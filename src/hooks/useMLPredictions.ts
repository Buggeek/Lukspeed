import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MLPredictor } from '@/services/MLPredictor';
import type { 
  MLPrediction, 
  TrainingLoadData, 
  TrainingRecommendation 
} from '@/types/powerAnalysis';

interface UseMLPredictionsProps {
  userId: string;
  predictionTypes?: ('ftp' | 'fatigue' | 'recovery' | 'zone_drift')[];
  autoRefresh?: boolean;
}

interface UseMLPredictionsReturn {
  predictions: MLPrediction[];
  recommendations: TrainingRecommendation[];
  trainingLoad: TrainingLoadData[];
  loading: boolean;
  error: string | null;
  refreshPredictions: () => Promise<void>;
  generateNewRecommendations: () => Promise<void>;
}

export function useMLPredictions({
  userId,
  predictionTypes = ['ftp', 'fatigue', 'recovery'],
  autoRefresh = false
}: UseMLPredictionsProps): UseMLPredictionsReturn {
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<TrainingRecommendation[]>([]);
  const [trainingLoad, setTrainingLoad] = useState<TrainingLoadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mlPredictor = MLPredictor.getInstance();

  const fetchPredictions = useCallback(async () => {
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('app_dbd0941867_ml_predictions')
        .select('*')
        .eq('user_id', userId)
        .in('prediction_type', predictionTypes)
        .order('prediction_date', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const formattedPredictions: MLPrediction[] = (data || []).map(item => ({
        prediction_type: item.prediction_type as 'ftp' | 'fatigue' | 'recovery' | 'zone_drift',
        current_value: item.current_value,
        predicted_value: item.predicted_value,
        confidence_interval: {
          low: item.confidence_interval_low,
          high: item.confidence_interval_high
        },
        confidence_score: item.confidence_score,
        prediction_date: item.prediction_date,
        target_date: item.target_date,
        model_version: item.model_version,
        input_features: item.input_features
      }));

      setPredictions(formattedPredictions);

    } catch (err) {
      console.error('Error fetching ML predictions:', err);
      setError(err instanceof Error ? err.message : 'Error fetching predictions');
    }
  }, [userId, predictionTypes]);

  const fetchTrainingLoad = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('app_dbd0941867_training_load')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(90); // Last 90 days

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const formattedTrainingLoad: TrainingLoadData[] = (data || []).map(item => ({
        date: item.date,
        tss: item.tss,
        ctl: item.ctl,
        atl: item.atl,
        tsb: item.tsb,
        fatigue_score: item.fatigue_score,
        fitness_score: item.fitness_score,
        form_score: item.form_score
      }));

      setTrainingLoad(formattedTrainingLoad);

      // Generate sample data if none exists
      if (formattedTrainingLoad.length === 0) {
        const sampleData = generateSampleTrainingLoad();
        setTrainingLoad(sampleData);
      }

    } catch (err) {
      console.error('Error fetching training load:', err);
      // Generate sample data on error
      const sampleData = generateSampleTrainingLoad();
      setTrainingLoad(sampleData);
    }
  }, [userId]);

  const generateSampleTrainingLoad = (): TrainingLoadData[] => {
    const data: TrainingLoadData[] = [];
    let ctl = 40;
    let atl = 30;
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate daily TSS variation
      const dailyTSS = Math.max(0, Math.round(
        60 + Math.sin(i * 0.1) * 30 + (Math.random() - 0.5) * 40
      ));
      
      // Update CTL and ATL with exponential moving averages
      ctl = ctl + (dailyTSS - ctl) / 42;
      atl = atl + (dailyTSS - atl) / 7;
      
      const tsb = ctl - atl;
      const fatigueScore = Math.max(0, Math.min(1, atl / Math.max(ctl, 1)));
      
      data.push({
        date: date.toISOString().split('T')[0],
        tss: dailyTSS,
        ctl: Math.round(ctl * 10) / 10,
        atl: Math.round(atl * 10) / 10,
        tsb: Math.round(tsb * 10) / 10,
        fatigue_score: Math.round(fatigueScore * 100) / 100,
        fitness_score: Math.round(ctl * 10) / 10,
        form_score: Math.round(tsb / 10 * 10) / 10
      });
    }
    
    return data.reverse(); // Most recent first
  };

  const generateNewRecommendations = useCallback(async () => {
    if (trainingLoad.length === 0) return;
    
    try {
      const latest = trainingLoad[0];
      const currentFTP = 250; // Would get from user profile
      
      const newRecommendations = mlPredictor.generateRecommendations(
        currentFTP,
        latest.fatigue_score,
        latest.form_score,
        [] // Recent activities - would fetch from activities table
      );
      
      setRecommendations(newRecommendations);
      
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError(err instanceof Error ? err.message : 'Error generating recommendations');
    }
  }, [trainingLoad, mlPredictor]);

  const refreshPredictions = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPredictions(),
        fetchTrainingLoad()
      ]);
      
      // Generate fresh recommendations
      await generateNewRecommendations();
      
    } finally {
      setLoading(false);
    }
  }, [fetchPredictions, fetchTrainingLoad, generateNewRecommendations]);

  useEffect(() => {
    refreshPredictions();
  }, [refreshPredictions]);

  useEffect(() => {
    if (trainingLoad.length > 0 && recommendations.length === 0) {
      generateNewRecommendations();
    }
  }, [trainingLoad, recommendations.length, generateNewRecommendations]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshPredictions, 10 * 60 * 1000); // 10 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshPredictions]);

  return {
    predictions,
    recommendations,
    trainingLoad,
    loading,
    error,
    refreshPredictions,
    generateNewRecommendations
  };
}