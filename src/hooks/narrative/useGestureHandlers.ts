import { useState, useCallback } from 'react';
import type { MetricNarrative } from '@/types/narrative';

export interface GestureState {
  type: 'idle' | 'compare' | 'history' | 'refresh';
  direction?: 'left' | 'right' | 'up' | 'down';
  progress?: number;
}

export function useGestureHandlers() {
  const [gestureState, setGestureState] = useState<GestureState>({ type: 'idle' });

  const handleSwipeLeft = useCallback((metric: MetricNarrative) => {
    setGestureState({ type: 'compare', direction: 'left' });
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Show comparison view
    setTimeout(() => {
      setGestureState({ type: 'idle' });
    }, 2000);
    
    return {
      action: 'compare',
      data: metric,
      message: 'Comparando con actividad anterior...'
    };
  }, []);

  const handleSwipeRight = useCallback((metric: MetricNarrative) => {
    setGestureState({ type: 'history', direction: 'right' });
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    setTimeout(() => {
      setGestureState({ type: 'idle' });
    }, 2000);
    
    return {
      action: 'history',
      data: metric,
      message: 'Mostrando evolución histórica...'
    };
  }, []);

  const handlePullToRefresh = useCallback(async () => {
    setGestureState({ type: 'refresh', direction: 'down' });
    
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setGestureState({ type: 'idle' });
    
    return {
      action: 'refresh',
      message: 'Datos actualizados'
    };
  }, []);

  const resetGestureState = useCallback(() => {
    setGestureState({ type: 'idle' });
  }, []);

  return {
    gestureState,
    handleSwipeLeft,
    handleSwipeRight,
    handlePullToRefresh,
    resetGestureState
  };
}