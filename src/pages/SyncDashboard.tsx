import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase, SyncStatus } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { 
  Activity, 
  Bike, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Loader2,
  PlayCircle,
  StopCircle
} from 'lucide-react';

export default function SyncDashboard() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSyncStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sync_status')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setSyncStatus(data);
    } catch (error: any) {
      console.error('Error fetching sync status:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchSyncStatus();

    // Poll for updates every 2 seconds during sync
    const interval = setInterval(() => {
      if (syncStatus?.status === 'importing' || syncStatus?.status === 'processing') {
        fetchSyncStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [user, syncStatus?.status]);

  const startSync = async (action: 'import_bikes' | 'import_activities') => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch('https://tebrbispkzjtlilpquaz.supabase.co/functions/v1/strava_sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          action
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error en ${action}`);
      }

      const result = await response.json();
      console.log('Sync result:', result);

      // Refresh status
      await fetchSyncStatus();

    } catch (error: any) {
      console.error('Sync error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'importing':
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'importing':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const calculateProgress = () => {
    if (!syncStatus || syncStatus.total_activities === 0) return 0;
    return Math.round((syncStatus.processed_activities / syncStatus.total_activities) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Sincronización con Strava</h1>
        <p className="text-gray-600">Gestiona la importación de tus datos desde Strava</p>
      </div>

      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estado de Sincronización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {syncStatus ? (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(syncStatus.status)}>
                  {getStatusIcon(syncStatus.status)}
                  <span className="ml-1">
                    {syncStatus.status === 'idle' && 'Inactivo'}
                    {syncStatus.status === 'importing' && 'Importando'}
                    {syncStatus.status === 'processing' && 'Procesando'}
                    {syncStatus.status === 'completed' && 'Completado'}
                    {syncStatus.status === 'error' && 'Error'}
                  </span>
                </Badge>
              </div>

              {/* Progress */}
              {syncStatus.total_activities > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso de actividades</span>
                    <span>{syncStatus.processed_activities}/{syncStatus.total_activities}</span>
                  </div>
                  <Progress value={calculateProgress()} className="w-full" />
                  <div className="text-xs text-gray-600">
                    {calculateProgress()}% completado
                  </div>
                </div>
              )}

              {/* Current Activity */}
              {syncStatus.current_activity && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Actividad actual:</strong> {syncStatus.current_activity}
                  </p>
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {syncStatus.processed_activities}
                  </div>
                  <div className="text-xs text-green-600">Procesadas</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">
                    {syncStatus.total_activities - syncStatus.processed_activities}
                  </div>
                  <div className="text-xs text-orange-600">Pendientes</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">
                    {syncStatus.failed_activities}
                  </div>
                  <div className="text-xs text-red-600">Fallidas</div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-500 space-y-1">
                {syncStatus.started_at && (
                  <p>Iniciado: {new Date(syncStatus.started_at).toLocaleString()}</p>
                )}
                {syncStatus.completed_at && (
                  <p>Completado: {new Date(syncStatus.completed_at).toLocaleString()}</p>
                )}
              </div>

              {/* Error Message */}
              {syncStatus.error_message && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{syncStatus.error_message}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay sincronizaciones previas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5" />
              Importar Bicicletas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Sincroniza las bicicletas de tu cuenta de Strava
            </p>
            <Button
              onClick={() => startSync('import_bikes')}
              disabled={loading || syncStatus?.status === 'importing' || syncStatus?.status === 'processing'}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Importar Bicicletas
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Importar Actividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Sincroniza las actividades de los últimos 6 meses
            </p>
            <Button
              onClick={() => startSync('import_activities')}
              disabled={loading || syncStatus?.status === 'importing' || syncStatus?.status === 'processing'}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Importar Actividades
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}