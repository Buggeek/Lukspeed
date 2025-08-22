import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Logger } from '@/services/Logger';

interface SyncStatus {
  isLoading: boolean;
  progress: number;
  message: string;
  error?: string;
}

interface SyncResults {
  total: number;
  created: number;
  updated: number;
  queued_for_processing: number;
  errors: string[];
}

export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    progress: 0,
    message: '',
  });
  
  const { toast } = useToast();
  const logger = new Logger('useSync');

  /**
   * Sync activities from Strava
   */
  const syncActivities = useCallback(async (
    accessToken: string,
    options: {
      page?: number;
      perPage?: number;
      autoProcess?: boolean;
    } = {}
  ): Promise<SyncResults | null> => {
    try {
      setSyncStatus({
        isLoading: true,
        progress: 0,
        message: 'Iniciando sincronización...',
      });

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Usuario no autenticado');
      }

      const { page = 1, perPage = 20, autoProcess = true } = options;
      
      logger.info(`Starting sync for user ${session.user.id}`);

      setSyncStatus(prev => ({
        ...prev,
        progress: 20,
        message: 'Obteniendo actividades de Strava...',
      }));

      // Call sync edge function
      const { data, error } = await supabase.functions.invoke('sync_activities', {
        body: {
          user_id: session.user.id,
          access_token: accessToken,
          page: page,
          per_page: perPage,
          auto_process: autoProcess
        }
      });

      if (error) {
        logger.error('Sync function error:', error);
        throw new Error(`Error en sincronización: ${error.message}`);
      }

      setSyncStatus(prev => ({
        ...prev,
        progress: 80,
        message: 'Procesando actividades...',
      }));

      const results: SyncResults = data.results;

      setSyncStatus(prev => ({
        ...prev,
        progress: 100,
        message: `Sincronización completa: ${results.created} nuevas, ${results.updated} actualizadas`,
      }));

      // Show success toast
      toast({
        title: "Sincronización Exitosa",
        description: `${results.total} actividades procesadas. ${results.created} nuevas, ${results.updated} actualizadas.`,
      });

      logger.info('Sync completed successfully:', results);
      return results;

    } catch (error) {
      logger.error('Sync error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        progress: 0,
        message: '',
        error: errorMessage,
      }));

      toast({
        title: "Error en Sincronización",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus({
          isLoading: false,
          progress: 0,
          message: '',
        });
      }, 3000);
    }
  }, [toast, logger]);

  /**
   * Get processing queue status
   */
  const getQueueStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('processing_queue')
        .select('status')
        .eq('user_id', session.user.id);

      if (error) {
        logger.error('Error getting queue status:', error);
        return null;
      }

      const status = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: 0
      };

      data?.forEach(item => {
        status.total++;
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
      logger.error('Error getting queue status:', error);
      return null;
    }
  }, [logger]);

  /**
   * Start automatic sync on authentication
   */
  const autoSync = useCallback(async (accessToken: string) => {
    logger.info('Starting automatic sync on authentication');
    
    try {
      // Sync last 20 activities automatically
      await syncActivities(accessToken, {
        page: 1,
        perPage: 20,
        autoProcess: true
      });
    } catch (error) {
      logger.error('Auto-sync failed:', error);
    }
  }, [syncActivities, logger]);

  /**
   * Retry failed processing items
   */
  const retryFailed = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const { error } = await supabase
        .from('processing_queue')
        .update({ 
          status: 'pending',
          retry_count: 0,
          error_message: null 
        })
        .eq('user_id', session.user.id)
        .eq('status', 'failed');

      if (error) {
        logger.error('Error retrying failed items:', error);
        return false;
      }

      toast({
        title: "Reintento Iniciado",
        description: "Los elementos fallidos han sido marcados para reintento.",
      });

      return true;
    } catch (error) {
      logger.error('Error retrying failed items:', error);
      return false;
    }
  }, [toast, logger]);

  return {
    syncStatus,
    syncActivities,
    getQueueStatus,
    autoSync,
    retryFailed
  };
}