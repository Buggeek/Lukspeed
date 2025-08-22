import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { BikeFitting } from '@/types/fitting';
import { AnthropometricProfile } from '@/types/profile';
import { FittingCalculator } from '@/services/FittingCalculator';
import { useToast } from '@/hooks/use-toast';

export function useBikeFitting() {
  const [fittings, setFittings] = useState<BikeFitting[]>([]);
  const [currentFitting, setCurrentFitting] = useState<BikeFitting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Calculate a new fitting from anthropometric data
  const calculateFitting = useCallback((
    profile: AnthropometricProfile, 
    method: 'conservative' | 'standard' | 'aggressive' = 'standard'
  ) => {
    try {
      const calculatedFitting = FittingCalculator.calculateCompleteFitting(profile, method);
      setCurrentFitting(calculatedFitting);
      return calculatedFitting;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculating fitting');
      return null;
    }
  }, []);

  // Validate a fitting against profile
  const validateFitting = useCallback((fitting: BikeFitting, profile: AnthropometricProfile) => {
    return FittingCalculator.validateFitting(fitting, profile);
  }, []);

  // Compare two fittings
  const compareFittings = useCallback((current: BikeFitting, previous: BikeFitting) => {
    return FittingCalculator.compareFittings(current, previous);
  }, []);

  // Save fitting to database
  const saveFitting = useCallback(async (fitting: BikeFitting) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const fittingToSave = {
        ...fitting,
        user_id: session.user.id,
        fitting_date: new Date().toISOString()
      };

      const { data, error: saveError } = await supabase
        .from('bike_fittings')
        .insert(fittingToSave)
        .select()
        .single();

      if (saveError) throw saveError;

      setFittings(prev => [data, ...prev]);
      toast({
        title: "Fitting Guardado",
        description: "Tu bike fitting ha sido guardado exitosamente.",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving fitting';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update existing fitting
  const updateFitting = useCallback(async (id: string, updates: Partial<BikeFitting>) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('bike_fittings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setFittings(prev => prev.map(f => f.id === id ? data : f));
      toast({
        title: "Fitting Actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating fitting';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load user's fittings
  const loadFittings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error: loadError } = await supabase
        .from('bike_fittings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('fitting_date', { ascending: false });

      if (loadError) throw loadError;

      setFittings(data || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading fittings';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete fitting
  const deleteFitting = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('bike_fittings')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setFittings(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Fitting Eliminado",
        description: "El fitting ha sido eliminado exitosamente.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting fitting';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get latest fitting
  const getLatestFitting = useCallback(() => {
    return fittings.length > 0 ? fittings[0] : null;
  }, [fittings]);

  return {
    // State
    fittings,
    currentFitting,
    loading,
    error,

    // Actions
    calculateFitting,
    validateFitting,
    compareFittings,
    saveFitting,
    updateFitting,
    loadFittings,
    deleteFitting,
    
    // Computed
    getLatestFitting,
    
    // Setters
    setCurrentFitting
  };
}

export default useBikeFitting;