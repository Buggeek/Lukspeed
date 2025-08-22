import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Activity, Clock, Route, Zap } from 'lucide-react';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { useActivityData } from '@/hooks/useActivityData';
import { useAuth } from '@/hooks/useAuth';

export default function ActivityTimelinePage() {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data,
    segments,
    metrics,
    loading,
    error,
    refetch
  } = useActivityData({
    activityId: activityId || '',
    smoothingWindow: 5,
    autoRefresh: false
  });

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Debes iniciar sesión para ver el timeline de actividades.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activityId) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">ID de actividad no encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Timeline de Actividad</h1>
            <p className="text-muted-foreground">
              Análisis multieje con métricas derivadas
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Activity Metrics Summary */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duración</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(metrics.duration / 60)}:{(metrics.duration % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-muted-foreground">
                {(metrics.totalDistance / 1000).toFixed(1)} km
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potencia Promedio</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averages.power.toFixed(0)}W</div>
              <p className="text-xs text-muted-foreground">
                Pico: {metrics.peaks.power.toFixed(0)}W
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Velocidad Promedio</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averages.speed.toFixed(1)} km/h</div>
              <p className="text-xs text-muted-foreground">
                Pico: {metrics.peaks.speed.toFixed(1)} km/h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Análisis</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.derived.segmentCount}</div>
              <p className="text-xs text-muted-foreground">
                Segmentos detectados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Timeline Component */}
      <ActivityTimeline
        data={data}
        segments={segments}
        loading={loading}
        error={error}
      />

      {/* Additional Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Cardiovasculares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>FC Promedio:</span>
                <Badge variant="secondary">{metrics.averages.heartrate.toFixed(0)} bpm</Badge>
              </div>
              <div className="flex justify-between">
                <span>Cadencia Promedio:</span>
                <Badge variant="secondary">{metrics.averages.cadence.toFixed(0)} rpm</Badge>
              </div>
              <div className="flex justify-between">
                <span>Eficiencia Promedio:</span>
                <Badge variant="secondary">{metrics.derived.averageEfficiency.toFixed(4)} m/s/W</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Torque Máximo:</span>
                <Badge variant="secondary">{metrics.peaks.torque.toFixed(1)} Nm</Badge>
              </div>
              <div className="flex justify-between">
                <span>Aceleración Máxima:</span>
                <Badge variant="secondary">{metrics.peaks.acceleration.toFixed(2)} m/s²</Badge>
              </div>
              <div className="flex justify-between">
                <span>Elevación Total:</span>
                <Badge variant="secondary">{metrics.derived.totalElevationGain.toFixed(0)} m</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}