import { supabase } from '@/lib/supabase';
import { ProcessingQueueItem, StravaActivity, UserTrainingSettings } from '@/types/activity';
import { Logger } from './Logger';
import FitFileService from './FitFileService';
import MetricsCalculator from './MetricsCalculator';

class ProcessingQueue {
  private logger = new Logger('ProcessingQueue');
  private isProcessing = false;
  private maxConcurrent = 3;
  private currentProcessing = 0;

  /**
   * Add activity to processing queue
   */
  async addToQueue(
    userId: string,
    activityId: string,
    stravaActivityId: number,
    priority: number = 0
  ): Promise<string | null> {
    try {
      this.logger.info(`Adding activity ${stravaActivityId} to processing queue`);

      // Check if already queued
      const { data: existing } = await supabase
        .from('processing_queue')
        .select('id, status')
        .eq('user_id', userId)
        .eq('strava_activity_id', stravaActivityId)
        .single();

      if (existing) {
        if (existing.status === 'completed') {
          this.logger.info('Activity already processed');
          return existing.id;
        } else if (existing.status === 'failed') {
          // Reset failed item
          await this.resetQueueItem(existing.id);
          return existing.id;
        } else {
          this.logger.info('Activity already in queue');
          return existing.id;
        }
      }

      // Add new queue item
      const { data, error } = await supabase
        .from('processing_queue')
        .insert({
          user_id: userId,
          activity_id: activityId,
          strava_activity_id: stravaActivityId,
          priority: priority,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error adding to queue:', error);
        return null;
      }

      this.logger.info(`Added to queue with ID: ${data.id}`);
      return data.id;
    } catch (error) {
      this.logger.error('Error adding to queue:', error);
      return null;
    }
  }

  /**
   * Process pending items in the queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.currentProcessing >= this.maxConcurrent) {
      this.logger.debug('Queue processing already running or at max capacity');
      return;
    }

    try {
      this.isProcessing = true;
      this.logger.info('Starting queue processing');

      // Get pending items ordered by priority and creation time
      const { data: items, error } = await supabase
        .from('processing_queue')
        .select('*')
        .in('status', ['pending', 'retrying'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(this.maxConcurrent);

      if (error) {
        this.logger.error('Error fetching queue items:', error);
        return;
      }

      if (!items || items.length === 0) {
        this.logger.info('No items to process');
        return;
      }

      // Process items concurrently
      const promises = items.map(item => this.processItem(item));
      await Promise.all(promises);

    } catch (error) {
      this.logger.error('Error processing queue:', error);
    } finally {
      this.isProcessing = false;
      this.logger.info('Queue processing completed');
    }
  }

  /**
   * Process a single queue item
   */
  private async processItem(item: ProcessingQueueItem): Promise<void> {
    this.currentProcessing++;
    
    try {
      this.logger.info(`Processing item ${item.id} - Activity ${item.strava_activity_id}`);

      // Update status to processing
      await this.updateQueueItem(item.id, {
        status: 'processing',
        started_at: new Date().toISOString()
      });

      // Get user's access token
      const accessToken = await this.getUserAccessToken(item.user_id);
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Get user settings
      const settings = await this.getUserSettings(item.user_id);

      // Step 1: Get activity details from Strava
      const activity = await this.getStravaActivity(item.strava_activity_id, accessToken);
      if (!activity) {
        throw new Error('Failed to fetch activity from Strava');
      }

      // Step 2: Process .fit file / streams
      await this.updateQueueItem(item.id, { step_download: true });
      
      const processSuccess = await FitFileService.processActivity(
        activity,
        item.activity_id,
        item.user_id,
        accessToken
      );

      if (!processSuccess) {
        throw new Error('Failed to process activity streams');
      }

      await this.updateQueueItem(item.id, { 
        step_parse: true,
        step_store_streams: true 
      });

      // Step 3: Calculate metrics
      const streams = await FitFileService.getStoredStreams(item.activity_id);
      
      if (streams.length > 0) {
        const metrics = await MetricsCalculator.calculateActivityMetrics(
          streams,
          item.activity_id,
          item.user_id,
          settings
        );

        // Store metrics
        await this.storeActivityMetrics(metrics);
        
        await this.updateQueueItem(item.id, { step_calculate_metrics: true });
      }

      // Mark as completed
      await this.updateQueueItem(item.id, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });

      this.logger.info(`Successfully processed item ${item.id}`);

    } catch (error) {
      this.logger.error(`Error processing item ${item.id}:`, error);
      
      // Update retry count
      const newRetryCount = item.retry_count + 1;
      const status = newRetryCount >= item.max_retries ? 'failed' : 'retrying';
      
      await this.updateQueueItem(item.id, {
        status,
        retry_count: newRetryCount,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

    } finally {
      this.currentProcessing--;
    }
  }

  /**
   * Get user's Strava access token
   */
  private async getUserAccessToken(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('strava_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .single();

      if (error) {
        this.logger.error('Error getting access token:', error);
        return null;
      }

      return data?.access_token || null;
    } catch (error) {
      this.logger.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get user training settings
   */
  private async getUserSettings(userId: string): Promise<UserTrainingSettings | undefined> {
    try {
      const { data, error } = await supabase
        .from('user_training_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        this.logger.warn('No user training settings found');
        return undefined;
      }

      return data;
    } catch (error) {
      this.logger.error('Error getting user settings:', error);
      return undefined;
    }
  }

  /**
   * Get activity from Strava API
   */
  private async getStravaActivity(activityId: number, accessToken: string): Promise<StravaActivity | null> {
    try {
      const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        this.logger.error(`Failed to fetch activity: ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Error fetching Strava activity:', error);
      return null;
    }
  }

  /**
   * Store calculated metrics in database
   */
  private async storeActivityMetrics(metrics: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('activity_metrics')
        .upsert(metrics, { 
          onConflict: 'activity_id',
          ignoreDuplicates: false 
        });

      if (error) {
        this.logger.error('Error storing metrics:', error);
        return false;
      }

      this.logger.info('Successfully stored activity metrics');
      return true;
    } catch (error) {
      this.logger.error('Error storing metrics:', error);
      return false;
    }
  }

  /**
   * Update queue item
   */
  private async updateQueueItem(id: string, updates: Partial<ProcessingQueueItem>): Promise<void> {
    try {
      const { error } = await supabase
        .from('processing_queue')
        .update(updates)
        .eq('id', id);

      if (error) {
        this.logger.error('Error updating queue item:', error);
      }
    } catch (error) {
      this.logger.error('Error updating queue item:', error);
    }
  }

  /**
   * Reset a failed queue item
   */
  private async resetQueueItem(id: string): Promise<void> {
    await this.updateQueueItem(id, {
      status: 'pending',
      retry_count: 0,
      error_message: null,
      started_at: null,
      completed_at: null,
      step_download: false,
      step_parse: false,
      step_store_streams: false,
      step_calculate_metrics: false
    });
  }

  /**
   * Get queue status for a user
   */
  async getQueueStatus(userId: string): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('processing_queue')
        .select('status')
        .eq('user_id', userId);

      if (error) {
        this.logger.error('Error getting queue status:', error);
        return { pending: 0, processing: 0, completed: 0, failed: 0 };
      }

      const status = { pending: 0, processing: 0, completed: 0, failed: 0 };
      
      data?.forEach(item => {
        switch (item.status) {
          case 'pending':
          case 'retrying':
            status.pending++;
            break;
          case 'processing':
            status.processing++;
            break;
          case 'completed':
            status.completed++;
            break;
          case 'failed':
            status.failed++;
            break;
        }
      });

      return status;
    } catch (error) {
      this.logger.error('Error getting queue status:', error);
      return { pending: 0, processing: 0, completed: 0, failed: 0 };
    }
  }

  /**
   * Start automatic queue processing with interval
   */
  startAutoProcessing(intervalMs: number = 30000): void {
    this.logger.info(`Starting auto-processing with ${intervalMs}ms interval`);
    
    setInterval(() => {
      this.processQueue().catch(error => {
        this.logger.error('Auto-processing error:', error);
      });
    }, intervalMs);
  }
}

export default new ProcessingQueue();