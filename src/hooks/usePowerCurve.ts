import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MLPredictor } from '@/services/MLPredictor';
import { ZoneCalculator } from '@/services/ZoneCalculator';
import type { 
  PowerCurveData, 
  PowerCurvePoint, 
  CriticalPowerModel,
  TrainingZones 
} from '@/types/powerAnalysis';

interface UsePowerCurveProps {
  userId: string;
  dateRange?: {
    start: string;
    end: string;
  };
  autoRefresh?: boolean;
}

interface UsePowerCurveReturn {
  powerCurve: PowerCurvePoint[];
  criticalPowerModel: CriticalPowerModel | null;
  trainingZones: TrainingZones | null;
  currentFTP: number | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  calculateNewFTP: () => Promise<void>;
  recalibrateZones: () => Promise<void>;
}

export function usePowerCurve({
  userId,
  dateRange,
  autoRefresh = false
}: UsePowerCurveProps): UsePowerCurveReturn {
  const [powerCurve, setPowerCurve] = useState<PowerCurvePoint[]>([]);
  const [criticalPowerModel, setCriticalPowerModel] = useState<CriticalPowerModel | null>(null);
  const [trainingZones, setTrainingZones] = useState<TrainingZones | null>(null);
  const [currentFTP, setCurrentFTP] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mlPredictor = MLPredictor.getInstance();
  const zoneCalculator = ZoneCalculator.getInstance();

  const fetchPowerCurve = useCallback(async () => {
    try {
      setError(null);
      
      // Generate sample power curve data for demonstration
      const intervals = [5, 15, 60, 300, 1200, 3600]; // 5s, 15s, 1min, 5min, 20min, 1hr
      const sampleCurve: PowerCurvePoint[] = intervals.map(duration => ({
        duration,
        power: Math.round(400 * Math.exp(-duration / 2000) + 200), // Exponential decay model
        isPersonalBest: Math.random() > 0.7,
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      }));

      setPowerCurve(sampleCurve);
      
      // Calculate Critical Power model
      const powerData = sampleCurve.map(p => p.power);
      const durationData = sampleCurve.map(p => p.duration);
      
      try {
        const ftpModel = await mlPredictor.predictFTP(sampleCurve, userId);
        
        const cpModel: CriticalPowerModel = {
          critical_power: ftpModel.prediction.ftp_estimate,
          anaerobic_capacity: 20000, // 20kJ default
          r_squared: ftpModel.accuracy_metrics.r_squared || 0.85,
          confidence_interval: {
            cp_low: ftpModel.prediction.ftp_estimate * 0.95,
            cp_high: ftpModel.prediction.ftp_estimate * 1.05,
            awc_low: 18000,
            awc_high: 22000
          }
        };
        
        setCriticalPowerModel(cpModel);
        setCurrentFTP(ftpModel.prediction.ftp_estimate);
        
        // Calculate training zones
        const zones = zoneCalculator.calculateCogganZones(ftpModel.prediction.ftp_estimate);
        const zonesData: TrainingZones = {
          zones,
          ftp_base: ftpModel.prediction.ftp_estimate,
          auto_calculated: true,
          last_calibration: new Date().toISOString()
        };
        
        setTrainingZones(zonesData);
        
      } catch (mlError) {
        console.error('ML prediction error:', mlError);
        // Fallback to default values
        const defaultFTP = 250;
        setCurrentFTP(defaultFTP);
        
        const zones = zoneCalculator.calculateCogganZones(defaultFTP);
        setTrainingZones({
          zones,
          ftp_base: defaultFTP,
          auto_calculated: false,
          last_calibration: new Date().toISOString()
        });
      }

    } catch (err) {
      console.error('Error fetching power curve:', err);
      setError(err instanceof Error ? err.message : 'Error fetching power curve data');
    }
  }, [userId, dateRange, mlPredictor, zoneCalculator]);

  const fetchStoredData = useCallback(async () => {
    try {
      // Fetch existing power curve data
      const { data: curveData, error: curveError } = await supabase
        .from('app_dbd0941867_power_curves')
        .select('*')
        .eq('user_id', userId)
        .order('curve_date', { ascending: false })
        .limit(1);

      if (curveError && curveError.code !== 'PGRST116') { // PGRST116 = no rows
        throw curveError;
      }

      // Fetch existing training zones
      const { data: zonesData, error: zonesError } = await supabase
        .from('app_dbd0941867_training_zones')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (zonesError && zonesError.code !== 'PGRST116') {
        console.warn('No existing zones found, will calculate new ones');
      }

      if (zonesData) {
        const zones = zoneCalculator.calculateCogganZones(zonesData.ftp_base);
        setTrainingZones({
          zones,
          ftp_base: zonesData.ftp_base,
          auto_calculated: zonesData.auto_calculated,
          last_calibration: zonesData.last_calibration
        });
        setCurrentFTP(zonesData.ftp_base);
      }

    } catch (err) {
      console.error('Error fetching stored data:', err);
    }
  }, [userId, zoneCalculator]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchStoredData();
      await fetchPowerCurve();
    } finally {
      setLoading(false);
    }
  }, [fetchStoredData, fetchPowerCurve]);

  const calculateNewFTP = useCallback(async () => {
    if (!powerCurve.length) return;
    
    try {
      setLoading(true);
      const ftpModel = await mlPredictor.predictFTP(powerCurve, userId);
      setCurrentFTP(ftpModel.prediction.ftp_estimate);
      
      // Recalculate zones with new FTP
      await recalibrateZones();
      
    } catch (err) {
      console.error('Error calculating FTP:', err);
      setError(err instanceof Error ? err.message : 'Error calculating FTP');
    } finally {
      setLoading(false);
    }
  }, [powerCurve, userId, mlPredictor]);

  const recalibrateZones = useCallback(async () => {
    if (!currentFTP) return;
    
    try {
      const zones = await zoneCalculator.autoCalibrate(
        userId,
        powerCurve.map(p => p.power),
        currentFTP
      );
      setTrainingZones(zones);
      
    } catch (err) {
      console.error('Error recalibrating zones:', err);
      setError(err instanceof Error ? err.message : 'Error recalibrating zones');
    }
  }, [currentFTP, powerCurve, userId, zoneCalculator]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshData, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshData]);

  return {
    powerCurve,
    criticalPowerModel,
    trainingZones,
    currentFTP,
    loading,
    error,
    refreshData,
    calculateNewFTP,
    recalibrateZones
  };
}