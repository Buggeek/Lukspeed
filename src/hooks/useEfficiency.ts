import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { EfficiencyCurveService, type EfficiencyAnalysis } from '@/services/EfficiencyCurveService';
import type { ActivityPoint } from '@/types/activity';

interface UseEfficiencyProps {
  activityId?: string;
  activityData?: ActivityPoint[];
  autoCalculate?: boolean;
}

interface UseEfficiencyReturn {
  efficiencyData: EfficiencyAnalysis | null;
  isLoading: boolean;
  error: string | null;
  calculateEfficiency: (data?: ActivityPoint[]) => Promise<EfficiencyAnalysis>;
  recalculate: () => void;
  saveToDatabase: () => Promise<void>;
  dataQuality: {
    valid: boolean;
    warnings: string[];
    recommendations: string[];
  } | null;
}

export function useEfficiency({
  activityId,
  activityData,
  autoCalculate = true
}: UseEfficiencyProps): UseEfficiencyReturn {
  const [efficiencyData, setEfficiencyData] = useState<EfficiencyAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataQuality, setDataQuality] = useState<any>(null);

  const calculateEfficiency = useCallback(async (data?: ActivityPoint[]): Promise<EfficiencyAnalysis> => {
    const dataToUse = data || activityData;
    
    if (!dataToUse || dataToUse.length === 0) {
      throw new Error('No hay datos de actividad para calcular eficiencia');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validate data quality first
      const quality = EfficiencyCurveService.validateDataQuality(dataToUse);
      setDataQuality(quality);

      if (!quality.valid) {
        console.warn('Data quality issues detected:', quality.warnings);
      }

      // Calculate efficiency metrics
      const analysis = EfficiencyCurveService.analyzeActivityEfficiency(dataToUse);
      setEfficiencyData(analysis);

      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error calculando eficiencia';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [activityData]);

  const saveToDatabase = useCallback(async (): Promise<void> => {
    if (!efficiencyData || !activityId) {
      throw new Error('No hay datos de eficiencia o ID de actividad para guardar');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Save efficiency curves
      if (efficiencyData.curva_eficiencia.length > 0) {
        const curvesToSave = efficiencyData.curva_eficiencia.map(curve => ({
          activity_id: activityId,
          user_id: user.id,
          rango_velocidad: curve.rango_velocidad,
          eficiencia: curve.eficiencia,
          muestras: curve.muestras,
          velocidad_media: curve.velocidad_media,
          potencia_media: curve.potencia_media
        }));

        const { error: curveError } = await supabase
          .from('efficiency_curves')
          .upsert(curvesToSave, {
            onConflict: 'activity_id,rango_velocidad'
          });

        if (curveError) {
          console.error('Error saving efficiency curves:', curveError);
          throw curveError;
        }
      }

      // Save 40km/h efficiency
      const { error: standardError } = await supabase
        .from('efficiency_40kmh')
        .upsert({
          activity_id: activityId,
          user_id: user.id,
          eficiencia_estandar_40kmh: efficiencyData.eficiencia_40kmh.eficiencia_estandar_40kmh,
          potencia_media_40kmh: efficiencyData.eficiencia_40kmh.potencia_media_40kmh,
          muestras: efficiencyData.eficiencia_40kmh.muestras,
          warning: efficiencyData.eficiencia_40kmh.warning
        }, {
          onConflict: 'activity_id'
        });

      if (standardError) {
        console.error('Error saving 40km/h efficiency:', standardError);
        throw standardError;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error guardando datos de eficiencia';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [efficiencyData, activityId]);

  const loadFromDatabase = useCallback(async (): Promise<EfficiencyAnalysis | null> => {
    if (!activityId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Load efficiency curves
      const { data: curves, error: curveError } = await supabase
        .from('efficiency_curves')
        .select('*')
        .eq('activity_id', activityId)
        .eq('user_id', user.id);

      if (curveError && curveError.code !== 'PGRST116') {
        throw curveError;
      }

      // Load 40km/h efficiency
      const { data: standard, error: standardError } = await supabase
        .from('efficiency_40kmh')
        .select('*')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .single();

      if (standardError && standardError.code !== 'PGRST116') {
        console.warn('No 40km/h efficiency data found:', standardError);
      }

      if (curves && curves.length > 0) {
        const analysis: EfficiencyAnalysis = {
          curva_eficiencia: curves.map(curve => ({
            rango_velocidad: curve.rango_velocidad,
            eficiencia: curve.eficiencia,
            muestras: curve.muestras,
            velocidad_media: curve.velocidad_media,
            potencia_media: curve.potencia_media
          })),
          eficiencia_40kmh: standard ? {
            eficiencia_estandar_40kmh: standard.eficiencia_estandar_40kmh,
            potencia_media_40kmh: standard.potencia_media_40kmh,
            muestras: standard.muestras,
            warning: standard.warning
          } : {
            eficiencia_estandar_40kmh: null,
            potencia_media_40kmh: null,
            muestras: 0,
            warning: 'No se encontraron datos guardados'
          },
          timestamp: curves[0]?.created_at || new Date().toISOString(),
          total_samples: 0 // Would need to be calculated from original data
        };

        setEfficiencyData(analysis);
        return analysis;
      }

      return null;
    } catch (err) {
      console.error('Error loading efficiency data from database:', err);
      return null;
    }
  }, [activityId]);

  const recalculate = useCallback(() => {
    if (activityData && activityData.length > 0) {
      calculateEfficiency(activityData);
    }
  }, [activityData, calculateEfficiency]);

  // Auto-calculate when activity data is available
  useEffect(() => {
    if (autoCalculate && activityData && activityData.length > 0 && !efficiencyData) {
      calculateEfficiency(activityData);
    }
  }, [autoCalculate, activityData, efficiencyData, calculateEfficiency]);

  // Try to load from database first if activityId is available
  useEffect(() => {
    if (activityId && !efficiencyData) {
      loadFromDatabase().then(loaded => {
        if (!loaded && autoCalculate && activityData && activityData.length > 0) {
          calculateEfficiency(activityData);
        }
      });
    }
  }, [activityId, efficiencyData, autoCalculate, activityData, loadFromDatabase, calculateEfficiency]);

  return {
    efficiencyData,
    isLoading,
    error,
    calculateEfficiency,
    recalculate,
    saveToDatabase,
    dataQuality
  };
}