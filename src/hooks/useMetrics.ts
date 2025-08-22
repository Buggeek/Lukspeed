import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ActivityMetrics, ActivityStream, UserTrainingSettings } from '@/types/activity';
import { Logger } from '@/services/Logger';

interface MetricsHookState {
  metrics: ActivityMetrics | null;
  streams: ActivityStream[];
  loading: boolean;
  error: string | null;
}

export function useMetrics(activityId?: string) {
  const [state, setState] = useState<MetricsHookState>({
    metrics: null,
    streams: [],
    loading: false,
    error: null
  });

  const logger = new Logger('useMetrics');

  /**
   * Load metrics for an activity
   */
  const loadMetrics = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      logger.info(`Loading metrics for activity ${id}`);

      // Load metrics from database
      const { data: metrics, error: metricsError } = await supabase
        .from('activity_metrics')
        .select('*')
        .eq('activity_id', id)
        .single();

      if (metricsError && metricsError.code !== 'PGRST116') {
        throw new Error(`Error loading metrics: ${metricsError.message}`);
      }

      // Load streams if available
      const { data: streams, error: streamsError } = await supabase
        .from('activity_streams')
        .select('*')
        .eq('activity_id', id)
        .order('timestamp_offset', { ascending: true });

      if (streamsError) {
        logger.warn(`Error loading streams: ${streamsError.message}`);
      }

      setState({
        metrics: metrics || null,
        streams: streams || [],
        loading: false,
        error: null
      });

    } catch (error) {
      logger.error('Error loading metrics:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [logger]);

  /**
   * Load user training settings
   */
  const loadUserSettings = useCallback(async (): Promise<UserTrainingSettings | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('user_training_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error loading user settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error loading user settings:', error);
      return null;
    }
  }, [logger]);

  /**
   * Calculate power zones based on FTP
   */
  const getPowerZones = useCallback((ftp: number) => {
    return {
      zone1: { min: 0, max: Math.round(ftp * 0.55), name: 'Active Recovery', color: '#9CA3AF' },
      zone2: { min: Math.round(ftp * 0.55) + 1, max: Math.round(ftp * 0.75), name: 'Endurance', color: '#3B82F6' },
      zone3: { min: Math.round(ftp * 0.75) + 1, max: Math.round(ftp * 0.90), name: 'Tempo', color: '#10B981' },
      zone4: { min: Math.round(ftp * 0.90) + 1, max: Math.round(ftp * 1.05), name: 'Lactate Threshold', color: '#F59E0B' },
      zone5: { min: Math.round(ftp * 1.05) + 1, max: Math.round(ftp * 1.20), name: 'VO2 Max', color: '#EF4444' },
      zone6: { min: Math.round(ftp * 1.20) + 1, max: Math.round(ftp * 1.50), name: 'Anaerobic', color: '#8B5CF6' },
      zone7: { min: Math.round(ftp * 1.50) + 1, max: Infinity, name: 'Neuromuscular', color: '#EC4899' }
    };
  }, []);

  /**
   * Calculate heart rate zones based on max HR
   */
  const getHeartRateZones = useCallback((maxHR: number) => {
    return {
      zone1: { min: 0, max: Math.round(maxHR * 0.60), name: 'Active Recovery', color: '#9CA3AF' },
      zone2: { min: Math.round(maxHR * 0.60) + 1, max: Math.round(maxHR * 0.70), name: 'Base', color: '#3B82F6' },
      zone3: { min: Math.round(maxHR * 0.70) + 1, max: Math.round(maxHR * 0.80), name: 'Aerobic', color: '#10B981' },
      zone4: { min: Math.round(maxHR * 0.80) + 1, max: Math.round(maxHR * 0.90), name: 'Lactate Threshold', color: '#F59E0B' },
      zone5: { min: Math.round(maxHR * 0.90) + 1, max: maxHR, name: 'VO2 Max', color: '#EF4444' }
    };
  }, []);

  /**
   * Get formatted metrics summary
   */
  const getMetricsSummary = useCallback(() => {
    if (!state.metrics) return null;

    const { metrics } = state;
    
    return {
      // Power metrics
      power: {
        normalized: metrics.normalized_power,
        intensity: metrics.intensity_factor,
        tss: metrics.training_stress_score,
        work: metrics.work,
        variability: metrics.power_variability,
        peaks: {
          '5s': metrics.power_5s,
          '15s': metrics.power_15s,
          '30s': metrics.power_30s,
          '1min': metrics.power_1min,
          '5min': metrics.power_5min,
          '10min': metrics.power_10min,
          '20min': metrics.power_20min,
          '60min': metrics.power_60min
        }
      },
      
      // Heart rate metrics
      heartRate: {
        average: metrics.avg_heart_rate,
        maximum: metrics.max_heart_rate,
        efficiency: metrics.aerobic_efficiency
      },
      
      // Zone distribution (convert seconds to minutes)
      powerZones: {
        zone1: Math.round((metrics.power_zone_1_time || 0) / 60),
        zone2: Math.round((metrics.power_zone_2_time || 0) / 60),
        zone3: Math.round((metrics.power_zone_3_time || 0) / 60),
        zone4: Math.round((metrics.power_zone_4_time || 0) / 60),
        zone5: Math.round((metrics.power_zone_5_time || 0) / 60),
        zone6: Math.round((metrics.power_zone_6_time || 0) / 60),
        zone7: Math.round((metrics.power_zone_7_time || 0) / 60)
      },
      
      hrZones: {
        zone1: Math.round((metrics.hr_zone_1_time || 0) / 60),
        zone2: Math.round((metrics.hr_zone_2_time || 0) / 60),
        zone3: Math.round((metrics.hr_zone_3_time || 0) / 60),
        zone4: Math.round((metrics.hr_zone_4_time || 0) / 60),
        zone5: Math.round((metrics.hr_zone_5_time || 0) / 60)
      },
      
      // Speed and elevation
      speed: {
        average: metrics.avg_speed,
        maximum: metrics.max_speed
      },
      
      elevation: {
        gain: metrics.elevation_gain,
        loss: metrics.elevation_loss
      }
    };
  }, [state.metrics]);

  /**
   * Check if activity has detailed data
   */
  const hasDetailedData = useCallback(() => {
    return state.streams.length > 0 && state.metrics?.fit_file_processed === true;
  }, [state.streams, state.metrics]);

  /**
   * Get stream data for charts
   */
  const getChartData = useCallback((type: 'power' | 'heartrate' | 'speed' | 'elevation') => {
    if (state.streams.length === 0) return [];

    return state.streams
      .filter(stream => {
        switch (type) {
          case 'power':
            return stream.power !== null && stream.power !== undefined;
          case 'heartrate':
            return stream.heart_rate !== null && stream.heart_rate !== undefined;
          case 'speed':
            return stream.speed !== null && stream.speed !== undefined;
          case 'elevation':
            return stream.altitude !== null && stream.altitude !== undefined;
          default:
            return false;
        }
      })
      .map(stream => ({
        time: stream.timestamp_offset,
        value: type === 'power' ? stream.power :
               type === 'heartrate' ? stream.heart_rate :
               type === 'speed' ? stream.speed :
               stream.altitude
      }));
  }, [state.streams]);

  // Auto-load metrics when activityId changes
  useEffect(() => {
    if (activityId) {
      loadMetrics(activityId);
    }
  }, [activityId, loadMetrics]);

  return {
    ...state,
    loadMetrics,
    loadUserSettings,
    getPowerZones,
    getHeartRateZones,
    getMetricsSummary,
    hasDetailedData,
    getChartData
  };
}