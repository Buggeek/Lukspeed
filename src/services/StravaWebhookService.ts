import { supabase } from '@/lib/supabase';
import { logger } from './Logger';

export interface WebhookSubscription {
  id: string;
  strava_subscription_id: number;
  callback_url: string;
  verify_token: string;
  status: 'active' | 'inactive' | 'failed';
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  event_type: 'create' | 'update' | 'delete';
  object_type: 'activity' | 'athlete';
  object_id: number;
  owner_id: number;
  event_time: number;
  processed: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at?: string;
}

export interface WebhookStats {
  total_events: number;
  processed_events: number;
  failed_events: number;
  success_rate: number;
  avg_processing_time: number;
  recent_events: WebhookEvent[];
}

export class StravaWebhookService {
  private static readonly WEBHOOK_ENDPOINT = 'https://tebrbispkzjtlilpquaz.supabase.co/functions/v1/app_dbd0941867_strava_webhook';
  private static readonly STRAVA_API_BASE = 'https://www.strava.com/api/v3';

  // Generate a secure verify token
  private static generateVerifyToken(): string {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 20);
  }

  // Create webhook subscription with Strava
  static async createSubscription(): Promise<{ success: boolean; subscription?: WebhookSubscription; error?: string }> {
    const timerId = logger.startTimer('Create Strava Webhook Subscription');
    
    try {
      logger.apiInfo('Creating Strava webhook subscription', {
        service: 'StravaWebhookService',
        action: 'createSubscription',
        data: { endpoint: this.WEBHOOK_ENDPOINT }
      });

      // Check if subscription already exists
      const { data: existingSubscription } = await supabase
        .from('app_dbd0941867_webhook_subscriptions')
        .select('*')
        .eq('status', 'active')
        .single();

      if (existingSubscription) {
        logger.apiInfo('Active webhook subscription already exists', {
          service: 'StravaWebhookService',
          data: { subscriptionId: existingSubscription.strava_subscription_id }
        });
        return { success: true, subscription: existingSubscription };
      }

      const verifyToken = this.generateVerifyToken();
      const clientId = '43486'; // Strava Client ID
      const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;

      if (!clientSecret) {
        throw new Error('Strava client secret not configured');
      }

      // Create subscription with Strava API
      const subscriptionData = {
        client_id: clientId,
        client_secret: clientSecret,
        callback_url: this.WEBHOOK_ENDPOINT,
        verify_token: verifyToken
      };

      logger.apiInfo('Sending subscription request to Strava', {
        service: 'StravaWebhookService',
        data: { 
          clientId, 
          callbackUrl: this.WEBHOOK_ENDPOINT,
          verifyTokenLength: verifyToken.length
        }
      });

      const response = await fetch(`${this.STRAVA_API_BASE}/push_subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.apiError('Strava subscription creation failed', new Error(errorText), {
          service: 'StravaWebhookService',
          data: { status: response.status, statusText: response.statusText }
        });
        throw new Error(`Strava API error: ${response.status} - ${errorText}`);
      }

      const stravaSubscription = await response.json();
      logger.apiInfo('Strava subscription created successfully', {
        service: 'StravaWebhookService',
        data: { stravaSubscriptionId: stravaSubscription.id }
      });

      // Store subscription in database
      const { data: dbSubscription, error: dbError } = await supabase
        .from('app_dbd0941867_webhook_subscriptions')
        .insert({
          strava_subscription_id: stravaSubscription.id,
          callback_url: this.WEBHOOK_ENDPOINT,
          verify_token: verifyToken,
          client_id: clientId,
          status: 'active'
        })
        .select()
        .single();

      if (dbError) {
        logger.apiError('Failed to store subscription in database', dbError, {
          service: 'StravaWebhookService'
        });
        throw new Error(`Database error: ${dbError.message}`);
      }

      logger.endTimer(timerId, 'api', 'Create Strava Webhook Subscription');
      logger.apiInfo('Webhook subscription setup completed', {
        service: 'StravaWebhookService',
        data: { subscriptionId: dbSubscription.id }
      });

      return { success: true, subscription: dbSubscription };

    } catch (error) {
      logger.apiError('Failed to create webhook subscription', error as Error, {
        service: 'StravaWebhookService',
        action: 'createSubscription'
      });
      return { success: false, error: (error as Error).message };
    }
  }

  // Delete webhook subscription
  static async deleteSubscription(subscriptionId?: number): Promise<{ success: boolean; error?: string }> {
    const timerId = logger.startTimer('Delete Strava Webhook Subscription');
    
    try {
      logger.apiInfo('Deleting Strava webhook subscription', {
        service: 'StravaWebhookService',
        action: 'deleteSubscription',
        data: { subscriptionId }
      });

      // Get subscription details
      let subscription;
      if (subscriptionId) {
        const { data } = await supabase
          .from('app_dbd0941867_webhook_subscriptions')
          .select('*')
          .eq('strava_subscription_id', subscriptionId)
          .single();
        subscription = data;
      } else {
        const { data } = await supabase
          .from('app_dbd0941867_webhook_subscriptions')
          .select('*')
          .eq('status', 'active')
          .single();
        subscription = data;
      }

      if (!subscription) {
        return { success: true }; // Already deleted
      }

      const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;
      if (!clientSecret) {
        throw new Error('Strava client secret not configured');
      }

      // Delete from Strava API
      const response = await fetch(
        `${this.STRAVA_API_BASE}/push_subscriptions/${subscription.strava_subscription_id}?client_id=${subscription.client_id}&client_secret=${clientSecret}`,
        { method: 'DELETE' }
      );

      if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        logger.apiError('Strava subscription deletion failed', new Error(errorText), {
          service: 'StravaWebhookService',
          data: { status: response.status }
        });
        throw new Error(`Strava API error: ${response.status} - ${errorText}`);
      }

      // Update status in database
      await supabase
        .from('app_dbd0941867_webhook_subscriptions')
        .update({ status: 'inactive' })
        .eq('id', subscription.id);

      logger.endTimer(timerId, 'api', 'Delete Strava Webhook Subscription');
      logger.apiInfo('Webhook subscription deleted successfully', {
        service: 'StravaWebhookService'
      });

      return { success: true };

    } catch (error) {
      logger.apiError('Failed to delete webhook subscription', error as Error, {
        service: 'StravaWebhookService',
        action: 'deleteSubscription'
      });
      return { success: false, error: (error as Error).message };
    }
  }

  // Get current subscription status
  static async getSubscriptionStatus(): Promise<{ subscription?: WebhookSubscription; error?: string }> {
    try {
      const { data: subscription, error } = await supabase
        .from('app_dbd0941867_webhook_subscriptions')
        .select('*')
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is okay
        throw error;
      }

      return { subscription: subscription || undefined };

    } catch (error) {
      logger.apiError('Failed to get subscription status', error as Error, {
        service: 'StravaWebhookService',
        action: 'getSubscriptionStatus'
      });
      return { error: (error as Error).message };
    }
  }

  // Get webhook statistics
  static async getWebhookStats(limit: number = 50): Promise<{ stats?: WebhookStats; error?: string }> {
    try {
      logger.apiInfo('Fetching webhook statistics', {
        service: 'StravaWebhookService',
        action: 'getWebhookStats',
        data: { limit }
      });

      // Get total counts
      const { count: totalEvents } = await supabase
        .from('app_dbd0941867_webhook_events')
        .select('*', { count: 'exact', head: true });

      const { count: processedEvents } = await supabase
        .from('app_dbd0941867_webhook_events')
        .select('*', { count: 'exact', head: true })
        .eq('processed', true);

      const { count: failedEvents } = await supabase
        .from('app_dbd0941867_webhook_events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      // Get recent events
      const { data: recentEvents } = await supabase
        .from('app_dbd0941867_webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Calculate average processing time
      const { data: processedWithTimes } = await supabase
        .from('app_dbd0941867_webhook_events')
        .select('created_at, processed_at')
        .not('processed_at', 'is', null)
        .limit(100);

      let avgProcessingTime = 0;
      if (processedWithTimes && processedWithTimes.length > 0) {
        const times = processedWithTimes.map(event => {
          const created = new Date(event.created_at).getTime();
          const processed = new Date(event.processed_at!).getTime();
          return processed - created;
        });
        avgProcessingTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      }

      const stats: WebhookStats = {
        total_events: totalEvents || 0,
        processed_events: processedEvents || 0,
        failed_events: failedEvents || 0,
        success_rate: totalEvents ? (processedEvents || 0) / totalEvents * 100 : 0,
        avg_processing_time: Math.round(avgProcessingTime / 1000), // Convert to seconds
        recent_events: recentEvents || []
      };

      logger.apiInfo('Webhook statistics retrieved', {
        service: 'StravaWebhookService',
        data: {
          totalEvents: stats.total_events,
          successRate: stats.success_rate,
          avgProcessingTime: stats.avg_processing_time
        }
      });

      return { stats };

    } catch (error) {
      logger.apiError('Failed to get webhook stats', error as Error, {
        service: 'StravaWebhookService',
        action: 'getWebhookStats'
      });
      return { error: (error as Error).message };
    }
  }

  // Test webhook endpoint
  static async testWebhookEndpoint(): Promise<{ success: boolean; error?: string }> {
    try {
      logger.apiInfo('Testing webhook endpoint', {
        service: 'StravaWebhookService',
        action: 'testWebhookEndpoint'
      });

      const response = await fetch(this.WEBHOOK_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Webhook endpoint should handle GET requests for verification
      const success = response.status === 200 || response.status === 404;

      if (success) {
        logger.apiInfo('Webhook endpoint test successful', {
          service: 'StravaWebhookService',
          data: { status: response.status }
        });
      } else {
        logger.apiError('Webhook endpoint test failed', new Error(`Status: ${response.status}`), {
          service: 'StravaWebhookService',
          data: { status: response.status }
        });
      }

      return { success };

    } catch (error) {
      logger.apiError('Webhook endpoint test error', error as Error, {
        service: 'StravaWebhookService',
        action: 'testWebhookEndpoint'
      });
      return { success: false, error: (error as Error).message };
    }
  }

  // Retry failed webhook jobs
  static async retryFailedJobs(): Promise<{ success: boolean; retriedCount?: number; error?: string }> {
    try {
      logger.apiInfo('Retrying failed webhook jobs', {
        service: 'StravaWebhookService',
        action: 'retryFailedJobs'
      });

      // Get failed jobs that haven't exceeded max retries
      const { data: failedJobs, error: fetchError } = await supabase
        .from('app_dbd0941867_webhook_jobs')
        .select('*')
        .eq('status', 'failed')
        .lt('retry_count', 5); // Max 5 retries

      if (fetchError) {
        throw fetchError;
      }

      if (!failedJobs || failedJobs.length === 0) {
        return { success: true, retriedCount: 0 };
      }

      // Reset failed jobs to pending status
      const { error: updateError } = await supabase
        .from('app_dbd0941867_webhook_jobs')
        .update({
          status: 'pending',
          scheduled_at: new Date().toISOString(),
          error_message: null
        })
        .in('id', failedJobs.map(job => job.id));

      if (updateError) {
        throw updateError;
      }

      logger.apiInfo('Failed webhook jobs reset for retry', {
        service: 'StravaWebhookService',
        data: { retriedCount: failedJobs.length }
      });

      return { success: true, retriedCount: failedJobs.length };

    } catch (error) {
      logger.apiError('Failed to retry webhook jobs', error as Error, {
        service: 'StravaWebhookService',
        action: 'retryFailedJobs'
      });
      return { success: false, error: (error as Error).message };
    }
  }
}