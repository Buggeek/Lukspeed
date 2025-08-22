import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, AlertTriangle, Activity, Users, MapPin, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { configResolver } from '@/services/ConfigResolver';
import { supabase } from '@/lib/supabase';

interface OnboardingPhase {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  icon: React.ComponentType<{ className?: string }>;
  progress: number;
  timestamp?: Date;
  errorMessage?: string;
  metrics?: {
    count?: number;
    total?: number;
    quality?: number;
  };
}

interface OnboardingAlert {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

export function OnboardingDashboard() {
  const { user, stravaTokens } = useAuth();
  const [phases, setPhases] = React.useState<OnboardingPhase[]>([]);
  const [alerts, setAlerts] = React.useState<OnboardingAlert[]>([]);
  const [overallProgress, setOverallProgress] = React.useState(0);
  const [tokenExpiryHours, setTokenExpiryHours] = React.useState(48);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      loadConfigurableThresholds();
      fetchOnboardingStatus();
      checkTokenExpiry();
    }
  }, [user]);

  const loadConfigurableThresholds = async () => {
    try {
      const expiryWarning = await configResolver.getValue(
        'auth.token_expiry_warning_hours', 
        { user_id: user?.id }, 
        48
      );
      setTokenExpiryHours(Number(expiryWarning));
    } catch (error) {
      console.error('Error loading configurable thresholds:', error);
    }
  };

  const fetchOnboardingStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Obtener estado de cada fase
      const [userProfileResult, bicyclesResult, activitiesResult, segmentsResult] = await Promise.all([
        supabase.from('cyclist_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('bicycles').select('*').eq('user_id', user.id),
        supabase.from('activities').select('*').eq('user_id', user.id).limit(50),
        supabase.from('segment_efforts').select('*').eq('user_id', user.id).limit(100)
      ]);

      const userProfile = userProfileResult.data;
      const bicycles = bicyclesResult.data || [];
      const activities = activitiesResult.data || [];
      const segments = segmentsResult.data || [];

      const newPhases: OnboardingPhase[] = [
        {
          id: 'account_created',
          title: 'Cuenta Creada',
          description: 'Registro completado en LukSpeed',
          status: user ? 'completed' : 'pending',
          icon: Users,
          progress: user ? 100 : 0,
          timestamp: user?.created_at ? new Date(user.created_at) : undefined
        },
        {
          id: 'strava_connected',
          title: 'Strava Conectado',
          description: 'Tokens OAuth válidos y activos',
          status: stravaTokens?.access_token ? 'completed' : 'pending',
          icon: Activity,
          progress: stravaTokens?.access_token ? 100 : 0,
          timestamp: stravaTokens?.created_at ? new Date(stravaTokens.created_at) : undefined
        },
        {
          id: 'profile_completed',
          title: 'Perfil Completado',
          description: 'Datos antropométricos y configuración básica',
          status: userProfile ? 'completed' : 'pending',
          icon: Target,
          progress: userProfile ? 100 : 0,
          metrics: {
            count: userProfile ? 1 : 0,
            total: 1
          }
        },
        {
          id: 'bicycles_imported',
          title: 'Bicicletas Importadas',
          description: 'Equipos sincronizados desde Strava',
          status: bicycles.length > 0 ? 'completed' : 'pending',
          icon: MapPin,
          progress: Math.min(100, (bicycles.length / 3) * 100),
          metrics: {
            count: bicycles.length,
            total: 3 // Expected number
          }
        },
        {
          id: 'activities_imported',
          title: 'Actividades Importadas',
          description: 'Entrenamientos sincronizados y procesados',
          status: activities.length >= 5 ? 'completed' : 
                   activities.length > 0 ? 'in_progress' : 'pending',
          icon: Activity,
          progress: Math.min(100, (activities.length / 20) * 100),
          metrics: {
            count: activities.length,
            total: 20 // Target for good analysis
          }
        },
        {
          id: 'segments_detected',
          title: 'Segmentos Detectados',
          description: 'Esfuerzos en segmentos identificados',
          status: segments.length >= 10 ? 'completed' : 
                   segments.length > 0 ? 'in_progress' : 'pending',
          icon: Target,
          progress: Math.min(100, (segments.length / 50) * 100),
          metrics: {
            count: segments.length,
            total: 50 // Good number for analysis
          }
        }
      ];

      setPhases(newPhases);
      
      // Calcular progreso general
      const totalProgress = newPhases.reduce((sum, phase) => sum + phase.progress, 0) / newPhases.length;
      setOverallProgress(Math.round(totalProgress));

    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      setAlerts(prev => [...prev, {
        type: 'error',
        title: 'Error de Conexión',
        message: 'No se pudo cargar el estado del onboarding',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const checkTokenExpiry = () => {
    if (!stravaTokens?.expires_at) return;

    const expiryDate = new Date(stravaTokens.expires_at * 1000);
    const hoursUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60);

    const newAlerts: OnboardingAlert[] = [];

    if (hoursUntilExpiry < tokenExpiryHours && hoursUntilExpiry > 0) {
      newAlerts.push({
        type: 'warning',
        title: 'Token Strava por Expirar',
        message: `Tu token expira en ${Math.round(hoursUntilExpiry)} horas. Se renovará automáticamente.`,
        timestamp: new Date()
      });
    } else if (hoursUntilExpiry <= 0) {
      newAlerts.push({
        type: 'error',
        title: 'Token Strava Expirado',
        message: 'Reconecta tu cuenta Strava para continuar la sincronización.',
        timestamp: new Date()
      });
    }

    // Verificar fases fallidas
    phases.forEach(phase => {
      if (phase.status === 'failed' && phase.errorMessage) {
        newAlerts.push({
          type: 'error',
          title: `Error en ${phase.title}`,
          message: phase.errorMessage,
          timestamp: new Date()
        });
      }
    });

    setAlerts(newAlerts);
  };

  const getStatusIcon = (status: OnboardingPhase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: OnboardingPhase['status']) => {
    const variants = {
      completed: 'default',
      in_progress: 'secondary', 
      failed: 'destructive',
      pending: 'outline'
    } as const;

    const labels = {
      completed: 'Completado',
      in_progress: 'En Progreso', 
      failed: 'Error',
      pending: 'Pendiente'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">Cargando estado del onboarding...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con progreso general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Configuración Inicial de LukSpeed
          </CardTitle>
          <CardDescription>
            Progreso de configuración de tu cuenta y sincronización con Strava
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso General</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            
            {overallProgress === 100 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ¡Configuración inicial completada! Ya puedes comenzar a analizar tus entrenamientos.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alertas activas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.title}:</strong> {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Timeline de fases */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Configuración</CardTitle>
          <CardDescription>
            Estado detallado de cada fase de configuración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              return (
                <div key={phase.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                  <div className="mt-1">
                    {getStatusIcon(phase.status)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{phase.title}</h4>
                        {getStatusBadge(phase.status)}
                      </div>
                      {phase.timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {phase.timestamp.toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {phase.description}
                    </p>
                    
                    {phase.progress > 0 && phase.progress < 100 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progreso</span>
                          <span>{phase.progress}%</span>
                        </div>
                        <Progress value={phase.progress} className="h-2" />
                      </div>
                    )}
                    
                    {phase.metrics && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{phase.metrics.count}/{phase.metrics.total} elementos</span>
                        {phase.metrics.quality && (
                          <span>{phase.metrics.quality}% calidad</span>
                        )}
                      </div>
                    )}
                    
                    {phase.errorMessage && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">
                          {phase.errorMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}