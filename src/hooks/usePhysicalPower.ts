import { useState, useEffect, useCallback } from 'react';
import { PhysicalPowerService, type PhysicalPowerAnalysis } from '@/services/PhysicalPowerService';
import type { ActivityPoint } from '@/types/activity';
import { supabase } from '@/lib/supabase';

interface UsePhysicalPowerProps {
  activityId?: string;
  activityData?: ActivityPoint[];
  autoCalculate?: boolean;
}

interface PhysicalPowerData {
  components: {
    power_aero: number[];
    power_rr: number[];  
    power_gravity: number[];
  };
  estimates: {
    CdA_estimated: number;
    Crr_estimated: number;
    confidence_score: number;
  };
  conditions: {
    air_density: number;
    total_mass: number;
    avg_gradient: number;
  };
  metadata: {
    activity_id: string;
    calculated_at: string;
    segments_used_cda: number;
    segments_used_crr: number;
  };
}

export const usePhysicalPower = ({ 
  activityId, 
  activityData = [], 
  autoCalculate = true 
}: UsePhysicalPowerProps = {}) => {
  const [physicalData, setPhysicalData] = useState<PhysicalPowerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para guardar componentes físicas en BD
  const saveToDatabase = async () => {
    if (!physicalData || !activityId) {
      throw new Error('No data or activity ID to save');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save physical power components
      const { error: componentsError } = await supabase
        .from('physical_power_components')
        .upsert({
          activity_id: activityId,
          user_id: user.id,
          power_aero_data: physicalData.components.power_aero,
          power_rr_data: physicalData.components.power_rr,
          power_gravity_data: physicalData.components.power_gravity,
          air_density: physicalData.conditions.air_density,
          total_mass: physicalData.conditions.total_mass,
          power_conservation_error: 0, // Would be calculated
          components_realistic: true,
          estimates_realistic: true
        }, {
          onConflict: 'activity_id'
        });

      if (componentsError) throw componentsError;

      // Save aerodynamic estimates
      const { error: estimatesError } = await supabase
        .from('aerodynamic_estimates')
        .upsert({
          activity_id: activityId,
          user_id: user.id,
          cda_estimated: physicalData.estimates.CdA_estimated,
          crr_estimated: physicalData.estimates.Crr_estimated,
          confidence_score: physicalData.estimates.confidence_score,
          segments_used_cda: physicalData.metadata.segments_used_cda,
          segments_used_crr: physicalData.metadata.segments_used_crr
        }, {
          onConflict: 'activity_id'
        });

      if (estimatesError) throw estimatesError;

    } catch (err) {
      console.error('Error saving physical power data:', err);
      throw err;
    }
  };

  // Función principal de cálculo
  const calculatePhysicalComponents = useCallback(async (
    data: ActivityPoint[]
  ): Promise<PhysicalPowerData> => {
    if (!data || data.length === 0) {
      throw new Error('No activity data provided');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the physical analysis service
      const analysis = PhysicalPowerService.analyzeActivityPhysics(data);

      // Convert to the format expected by the dashboard
      const physicalData: PhysicalPowerData = {
        components: {
          power_aero: analysis.components.power_aero,
          power_rr: analysis.components.power_rr,
          power_gravity: analysis.components.power_gravity
        },
        estimates: {
          CdA_estimated: analysis.estimates.CdA_estimated,
          Crr_estimated: analysis.estimates.Crr_estimated,
          confidence_score: analysis.estimates.confidence_score
        },
        conditions: {
          air_density: analysis.conditions.air_density,
          total_mass: analysis.mass_data.total_mass,
          avg_gradient: 0 // Would be calculated from data
        },
        metadata: {
          activity_id: activityId || 'unknown',
          calculated_at: new Date().toISOString(),
          segments_used_cda: analysis.estimates.segments_used_CdA,
          segments_used_crr: analysis.estimates.segments_used_Crr
        }
      };

      setPhysicalData(physicalData);
      return physicalData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error calculating physical components';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activityId]);

  // Load existing data from database
  const loadFromDatabase = useCallback(async (activityId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: components, error: componentsError } = await supabase
        .from('physical_power_components')
        .select('*')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .single();

      const { data: estimates, error: estimatesError } = await supabase
        .from('aerodynamic_estimates')
        .select('*')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .single();

      if (components && estimates) {
        const physicalData: PhysicalPowerData = {
          components: {
            power_aero: components.power_aero_data,
            power_rr: components.power_rr_data,
            power_gravity: components.power_gravity_data
          },
          estimates: {
            CdA_estimated: estimates.cda_estimated,
            Crr_estimated: estimates.crr_estimated,
            confidence_score: estimates.confidence_score
          },
          conditions: {
            air_density: components.air_density,
            total_mass: components.total_mass,
            avg_gradient: 0
          },
          metadata: {
            activity_id: activityId,
            calculated_at: estimates.created_at,
            segments_used_cda: estimates.segments_used_cda,
            segments_used_crr: estimates.segments_used_crr
          }
        };

        setPhysicalData(physicalData);
        return physicalData;
      }
    } catch (err) {
      console.log('No existing physical data found:', err);
    }
    return null;
  }, []);

  // Auto-calculation effect
  useEffect(() => {
    if (!autoCalculate) return;

    const processData = async () => {
      if (!activityId && (!activityData || activityData.length === 0)) {
        return;
      }

      // Try to load existing data first
      if (activityId) {
        const existingData = await loadFromDatabase(activityId);
        if (existingData) {
          return;
        }
      }

      // Calculate new data if we have activity data
      if (activityData && activityData.length > 0) {
        try {
          await calculatePhysicalComponents(activityData);
        } catch (err) {
          console.error('Auto-calculation failed:', err);
        }
      }
    };

    processData();
  }, [activityId, activityData, autoCalculate, calculatePhysicalComponents, loadFromDatabase]);

  // Helper functions
  const recalculate = useCallback(() => {
    if (activityData && activityData.length > 0) {
      return calculatePhysicalComponents(activityData);
    }
    throw new Error('No activity data available for recalculation');
  }, [activityData, calculatePhysicalComponents]);

  const clearData = useCallback(() => {
    setPhysicalData(null);
    setError(null);
  }, []);

  const hasValidData = physicalData && 
    physicalData.components.power_aero.length > 0 &&
    physicalData.estimates.CdA_estimated > 0;

  return {
    // Main data
    physicalData,
    isLoading,
    error,
    hasValidData,

    // Functions
    calculatePhysicalComponents,
    recalculate,
    clearData,
    saveToDatabase,

    // Derived states
    isCalculating: isLoading,
    hasError: !!error,
    isEmpty: !physicalData,
    
    // Useful metadata
    confidenceScore: physicalData?.estimates.confidence_score || 0,
    totalDataPoints: physicalData?.components.power_aero.length || 0,
    lastCalculated: physicalData?.metadata.calculated_at
  };
};

export default usePhysicalPower;
export type { PhysicalPowerData, UsePhysicalPowerProps };