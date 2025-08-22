import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { configResolver } from '@/services/ConfigResolver';
import { supabase } from '@/lib/supabase';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  dismissible: boolean;
  actionLabel?: string;
  actionHandler?: () => void;
}

export function useOnboardingAlerts() {
  const { user, stravaTokens, refreshStravaTokens } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  useEffect(() => {
    if (user) {
      checkAllAlerts();
      
      // Verificar cada 5 minutos
      const interval = setInterval(checkAllAlerts, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, stravaTokens]);

  const checkAllAlerts = async () => {
    const newAlerts: Alert[] = [];
    
    try {
      // 1. Verificar expiración de tokens
      await checkTokenExpiry(newAlerts);
      
      // 2. Verificar fases fallidas
      await checkFailedPhases(newAlerts);
      
      // 3. Verificar calidad de datos
      await checkDataQuality(newAlerts);
      
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  };

  const checkTokenExpiry = async (alerts: Alert[]) => {
    if (!stravaTokens?.expires_at) return;

    try {
      const warningHours = await configResolver.getValue('auth.token_expiry_warning_hours', 
        { user_id: user?.id }, 48);
      const refreshMinutes = await configResolver.getValue('auth.refresh_before_expiry_min',
        { user_id: user?.id }, 10);

      const expiryDate = new Date(stravaTokens.expires_at * 1000);
      const hoursUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60);
      const minutesUntilExpiry = hoursUntilExpiry * 60;

      if (hoursUntilExpiry <= 0) {
        alerts.push({
          id: 'token_expired',
          type: 'error',
          title: 'Token Strava Expirado',
          message: 'Tu conexión con Strava ha expirado. Reconecta para continuar la sincronización.',
          timestamp: new Date(),
          dismissible: false,
          actionLabel: 'Reconectar',
          actionHandler: () => window.location.href = '/auth/strava'
        });
      } else if (minutesUntilExpiry <= Number(refreshMinutes)) {
        // Auto-refresh si está muy cerca
        try {
          if (refreshStravaTokens) {
            await refreshStravaTokens();
            alerts.push({
              id: 'token_refreshed',
              type: 'success',
              title: 'Token Renovado',
              message: 'Tu token de Strava se renovó automáticamente.',
              timestamp: new Date(),
              dismissible: true
            });
          }
        } catch (error) {
          alerts.push({
            id: 'refresh_failed',
            type: 'error', 
            title: 'Error al Renovar Token',
            message: 'No se pudo renovar automáticamente. Reconecta manualmente.',
            timestamp: new Date(),
            dismissible: false,
            actionLabel: 'Reconectar',
            actionHandler: () => window.location.href = '/auth/strava'
          });
        }
      } else if (hoursUntilExpiry < Number(warningHours)) {
        alerts.push({
          id: 'token_expiring',
          type: 'warning',
          title: 'Token por Expirar',
          message: `Tu token de Strava expira en ${Math.round(hoursUntilExpiry)} horas. Se renovará automáticamente.`,
          timestamp: new Date(),
          dismissible: true
        });
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
    }
  };

  const checkFailedPhases = async (alerts: Alert[]) => {
    try {
      // Verificar logs de onboarding fallidos
      const { data: failedLogs } = await supabase
        .from('onboarding_logs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'failed')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      failedLogs?.forEach(log => {
        alerts.push({
          id: `failed_${log.phase}`,
          type: 'error',
          title: `Error en ${log.phase}`,
          message: log.error_message || 'Error desconocido durante la configuración',
          timestamp: new Date(log.created_at),
          dismissible: true,
          actionLabel: 'Reintentar',
          actionHandler: () => retryPhase(log.phase)
        });
      });
    } catch (error) {
      console.error('Error checking failed phases:', error);
    }
  };

  const checkDataQuality = async (alerts: Alert[]) => {
    try {
      const minPowerCoverage = await configResolver.getValue('quality.min_power_coverage_pct',
        { user_id: user?.id }, 70);

      // Verificar calidad de datos recientes
      const { data: recentActivities } = await supabase
        .from('activities')
        .select('id, power_coverage_pct, speed_coverage_pct')
        .eq('user_id', user?.id)
        .gte('start_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(10);

      const lowQualityActivities = recentActivities?.filter(
        activity => activity.power_coverage_pct < Number(minPowerCoverage)
      ) || [];

      if (lowQualityActivities.length > 3) {
        alerts.push({
          id: 'low_data_quality',
          type: 'warning',
          title: 'Calidad de Datos Baja',
          message: `${lowQualityActivities.length} actividades recientes tienen datos de potencia insuficientes.`,
          timestamp: new Date(),
          dismissible: true,
          actionLabel: 'Ver Detalles',
          actionHandler: () => window.location.href = '/data-quality'
        });
      }
    } catch (error) {
      console.error('Error checking data quality:', error);
    }
  };

  const retryPhase = async (phase: string) => {
    // Implementar lógica de reintento según la fase
    console.log('Retrying phase:', phase);
    
    // Log del reintento
    try {
      await supabase.from('onboarding_logs').insert({
        user_id: user?.id,
        phase,
        status: 'started',
        message: 'Retry initiated by user'
      });
    } catch (error) {
      console.error('Error logging retry:', error);
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return {
    alerts,
    dismissAlert,
    checkAllAlerts
  };
}