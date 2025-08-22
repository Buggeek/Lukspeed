import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Zap,
  Gauge,
  Heart,
  Mountain,
  Thermometer,
  Timer
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { configResolver } from '@/services/ConfigResolver';
import { supabase } from '@/lib/supabase';

interface QualityStats {
  totalActivities: number;
  completedActivities: number;
  failedActivities: number;
  avgPowerCoverage: number;
  avgSpeedCoverage: number;
  avgCadenceCoverage: number;
  avgHrCoverage: number;
  avgAltitudeCoverage: number;
  totalSizeMb: number;
  activitiesWithGaps: number;
  avgMaxGapSeconds: number;
}

interface QualityHeatmapData {
  activityId: string;
  activityName: string;
  startDate: Date;
  powerCoverage: number;
  speedCoverage: number;
  cadenceCoverage: number;
  hrCoverage: number;
  altitudeCoverage: number;
  ingestStatus: 'pending' | 'downloading' | 'processing' | 'completed' | 'failed';
}

interface IngestAlert {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  count?: number;
}

export function IngestMonitor() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<QualityStats | null>(null);
  const [heatmapData, setHeatmapData] = React.useState<QualityHeatmapData[]>([]);
  const [alerts, setAlerts] = React.useState<IngestAlert[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [thresholds, setThresholds] = React.useState({
    minPowerCoverage: 70,
    minSpeedCoverage: 90,
    minCadenceCoverage: 60,
    minHrCoverage: 60,
    minAltitudeCoverage: 80,
    maxGapSeconds: 3
  });

  React.useEffect(() => {
    if (user) {
      loadConfigurableThresholds();
      fetchIngestData();
    }
  }, [user]);

  const loadConfigurableThresholds = async () => {
    try {
      const [powerMin, speedMin, cadenceMin, hrMin, altitudeMin, maxGap] = await Promise.all([
        configResolver.getValue('quality.min_power_coverage_pct', { user_id: user?.id }, 70),
        configResolver.getValue('quality.min_speed_coverage_pct', { user_id: user?.id }, 90),
        configResolver.getValue('quality.min_cadence_coverage_pct', { user_id: user?.id }, 60),
        configResolver.getValue('quality.min_hr_coverage_pct', { user_id: user?.id }, 60),
        configResolver.getValue('quality.min_altitude_coverage_pct', { user_id: user?.id }, 80),
        configResolver.getValue('ingest.data_gap_max_seconds', { user_id: user?.id }, 3)
      ]);

      setThresholds({
        minPowerCoverage: Number(powerMin),
        minSpeedCoverage: Number(speedMin),
        minCadenceCoverage: Number(cadenceMin),
        minHrCoverage: Number(hrMin),
        minAltitudeCoverage: Number(altitudeMin),
        maxGapSeconds: Number(maxGap)
      });
    } catch (error) {
      console.error('Error loading thresholds:', error);
    }
  };

  const fetchIngestData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Obtener estadísticas generales usando RPC
      const { data: statsData } = await supabase.rpc('calculate_quality_stats', {
        user_id_param: user.id
      });

      if (statsData && statsData.length > 0) {
        const row = statsData[0];
        setStats({
          totalActivities: row.total_activities || 0,
          completedActivities: row.completed_activities || 0,
          failedActivities: row.failed_activities || 0,
          avgPowerCoverage: row.avg_power_coverage || 0,
          avgSpeedCoverage: row.avg_speed_coverage || 0,
          avgCadenceCoverage: row.avg_cadence_coverage || 0,
          avgHrCoverage: row.avg_hr_coverage || 0,
          avgAltitudeCoverage: row.avg_altitude_coverage || 0,
          totalSizeMb: row.total_size_mb || 0,
          activitiesWithGaps: row.activities_with_gaps || 0,
          avgMaxGapSeconds: row.avg_max_gap_seconds || 0
        });
      }

      // Obtener datos del heatmap usando RPC
      const { data: heatmapRaw } = await supabase.rpc('get_quality_heatmap', {
        user_id_param: user.id,
        limit_param: 20
      });

      if (heatmapRaw) {
        const heatmapProcessed = heatmapRaw.map((row: Record<string, unknown>) => ({
          activityId: row.activity_id as string,
          activityName: row.activity_name as string,
          startDate: new Date(row.start_date as string),
          powerCoverage: Number(row.power_coverage) || 0,
          speedCoverage: Number(row.speed_coverage) || 0,
          cadenceCoverage: Number(row.cadence_coverage) || 0,
          hrCoverage: Number(row.hr_coverage) || 0,
          altitudeCoverage: Number(row.altitude_coverage) || 0,
          ingestStatus: (row.ingest_status as QualityHeatmapData['ingestStatus']) || 'pending'
        }));
        setHeatmapData(heatmapProcessed);
      }

    } catch (error) {
      console.error('Error fetching ingest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = React.useCallback(() => {
    if (!stats) return;

    const newAlerts: IngestAlert[] = [];

    // Alertas basadas en estadísticas
    if (stats.failedActivities > 0) {
      newAlerts.push({
        type: 'error',
        title: 'Fallos de Ingesta',
        message: `${stats.failedActivities} actividades fallaron durante el procesamiento`,
        count: stats.failedActivities
      });
    }

    if (stats.avgPowerCoverage < thresholds.minPowerCoverage) {
      newAlerts.push({
        type: 'warning',
        title: 'Cobertura de Potencia Baja',
        message: `Promedio: ${stats.avgPowerCoverage.toFixed(1)}% < ${thresholds.minPowerCoverage}% requerido`
      });
    }

    if (stats.avgSpeedCoverage < thresholds.minSpeedCoverage) {
      newAlerts.push({
        type: 'warning',
        title: 'Cobertura de Velocidad Baja',
        message: `Promedio: ${stats.avgSpeedCoverage.toFixed(1)}% < ${thresholds.minSpeedCoverage}% requerido`
      });
    }

    if (stats.activitiesWithGaps > stats.totalActivities * 0.3) {
      newAlerts.push({
        type: 'warning',
        title: 'Gaps de Datos Frecuentes',
        message: `${stats.activitiesWithGaps} actividades tienen gaps > ${thresholds.maxGapSeconds}s`,
        count: stats.activitiesWithGaps
      });
    }

    // Alertas de actividades recientes con problemas
    const recentProblems = heatmapData.filter(activity => {
      const isRecent = (Date.now() - activity.startDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
      const hasLowQuality = activity.powerCoverage < thresholds.minPowerCoverage || 
                           activity.speedCoverage < thresholds.minSpeedCoverage;
      return isRecent && hasLowQuality;
    });

    if (recentProblems.length > 0) {
      newAlerts.push({
        type: 'info',
        title: 'Problemas Recientes de Calidad',
        message: `${recentProblems.length} actividades de la última semana tienen calidad baja`,
        count: recentProblems.length
      });
    }

    setAlerts(newAlerts);
  }, [stats, heatmapData, thresholds]);

  React.useEffect(() => {
    if (stats && heatmapData.length > 0) {
      generateAlerts();
    }
  }, [generateAlerts, stats, heatmapData]);

  const getQualityColor = (coverage: number, threshold: number): string => {
    if (coverage >= threshold) return 'bg-green-500';
    if (coverage >= threshold * 0.8) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getQualityBadge = (coverage: number, threshold: number) => {
    if (coverage >= threshold) {
      return <Badge variant="default" className="bg-green-100 text-green-800">✓ {coverage.toFixed(1)}%</Badge>;
    } else if (coverage >= threshold * 0.8) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⚠ {coverage.toFixed(1)}%</Badge>;
    } else {
      return <Badge variant="destructive">✗ {coverage.toFixed(1)}%</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'downloading':
        return <Database className="h-4 w-4 text-blue-500" />;
      default:
        return <Timer className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      downloading: 'secondary',
      failed: 'destructive',
      pending: 'outline'
    } as const;

    const labels = {
      completed: 'Completado',
      processing: 'Procesando',
      downloading: 'Descargando',
      failed: 'Fallido',
      pending: 'Pendiente'
    };

    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
      {labels[status as keyof typeof labels] || status}
    </Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">Cargando datos de ingesta...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Actividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalActivities || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedActivities || 0} completadas, {stats?.failedActivities || 0} fallidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Calidad Potencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgPowerCoverage.toFixed(1) || 0}%</div>
            <Progress value={stats?.avgPowerCoverage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Umbral: {thresholds.minPowerCoverage}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Calidad Velocidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgSpeedCoverage.toFixed(1) || 0}%</div>
            <Progress value={stats?.avgSpeedCoverage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Umbral: {thresholds.minSpeedCoverage}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Tamaño Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSizeMb.toFixed(1) || 0} MB</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activitiesWithGaps || 0} con gaps de datos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas activas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-center">
                  <div>
                    <strong>{alert.title}:</strong> {alert.message}
                  </div>
                  {alert.count && (
                    <Badge variant="outline">{alert.count}</Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Tabs principales */}
      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList>
          <TabsTrigger value="heatmap">Heatmap de Calidad</TabsTrigger>
          <TabsTrigger value="activities">Lista de Actividades</TabsTrigger>
          <TabsTrigger value="channels">Análisis por Canal</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Heatmap de Calidad por Actividad</CardTitle>
              <CardDescription>
                Cobertura de datos por canal para las últimas 20 actividades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Leyenda */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>✓ {'>='} Umbral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>⚠ {'>='} 80% Umbral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>✗ {'<'} 80% Umbral</span>
                  </div>
                </div>

                {/* Grid de calidad */}
                <div className="grid gap-2">
                  {/* Headers */}
                  <div className="grid grid-cols-7 gap-2 text-xs font-medium">
                    <div>Actividad</div>
                    <div className="text-center">
                      <Zap className="h-4 w-4 mx-auto" title="Potencia" />
                    </div>
                    <div className="text-center">
                      <Gauge className="h-4 w-4 mx-auto" title="Velocidad" />
                    </div>
                    <div className="text-center">
                      <Timer className="h-4 w-4 mx-auto" title="Cadencia" />
                    </div>
                    <div className="text-center">
                      <Heart className="h-4 w-4 mx-auto" title="FC" />
                    </div>
                    <div className="text-center">
                      <Mountain className="h-4 w-4 mx-auto" title="Altitud" />
                    </div>
                    <div className="text-center">Estado</div>
                  </div>

                  {/* Filas de datos */}
                  {heatmapData.map((activity, index) => (
                    <div key={activity.activityId} className="grid grid-cols-7 gap-2 text-xs">
                      <div className="truncate" title={activity.activityName}>
                        {activity.activityName}
                      </div>
                      <div className="text-center">
                        <div 
                          className={`w-full h-6 rounded flex items-center justify-center text-white text-xs ${
                            getQualityColor(activity.powerCoverage, thresholds.minPowerCoverage)
                          }`}
                        >
                          {activity.powerCoverage.toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div 
                          className={`w-full h-6 rounded flex items-center justify-center text-white text-xs ${
                            getQualityColor(activity.speedCoverage, thresholds.minSpeedCoverage)
                          }`}
                        >
                          {activity.speedCoverage.toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div 
                          className={`w-full h-6 rounded flex items-center justify-center text-white text-xs ${
                            getQualityColor(activity.cadenceCoverage, thresholds.minCadenceCoverage)
                          }`}
                        >
                          {activity.cadenceCoverage.toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div 
                          className={`w-full h-6 rounded flex items-center justify-center text-white text-xs ${
                            getQualityColor(activity.hrCoverage, thresholds.minHrCoverage)
                          }`}
                        >
                          {activity.hrCoverage.toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div 
                          className={`w-full h-6 rounded flex items-center justify-center text-white text-xs ${
                            getQualityColor(activity.altitudeCoverage, thresholds.minAltitudeCoverage)
                          }`}
                        >
                          {activity.altitudeCoverage.toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getStatusIcon(activity.ingestStatus)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista Detallada de Actividades</CardTitle>
              <CardDescription>
                Estado de procesamiento y métricas de calidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {heatmapData.map((activity) => (
                  <div key={activity.activityId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{activity.activityName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.startDate.toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activity.ingestStatus)}
                        {getStatusBadge(activity.ingestStatus)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Potencia:</span>
                        <div className="mt-1">
                          {getQualityBadge(activity.powerCoverage, thresholds.minPowerCoverage)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Velocidad:</span>
                        <div className="mt-1">
                          {getQualityBadge(activity.speedCoverage, thresholds.minSpeedCoverage)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cadencia:</span>
                        <div className="mt-1">
                          {getQualityBadge(activity.cadenceCoverage, thresholds.minCadenceCoverage)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">FC:</span>
                        <div className="mt-1">
                          {getQualityBadge(activity.hrCoverage, thresholds.minHrCoverage)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Altitud:</span>
                        <div className="mt-1">
                          {getQualityBadge(activity.altitudeCoverage, thresholds.minAltitudeCoverage)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Potencia', icon: Zap, coverage: stats?.avgPowerCoverage || 0, threshold: thresholds.minPowerCoverage },
              { name: 'Velocidad', icon: Gauge, coverage: stats?.avgSpeedCoverage || 0, threshold: thresholds.minSpeedCoverage },
              { name: 'Cadencia', icon: Timer, coverage: stats?.avgCadenceCoverage || 0, threshold: thresholds.minCadenceCoverage },
              { name: 'FC', icon: Heart, coverage: stats?.avgHrCoverage || 0, threshold: thresholds.minHrCoverage },
              { name: 'Altitud', icon: Mountain, coverage: stats?.avgAltitudeCoverage || 0, threshold: thresholds.minAltitudeCoverage }
            ].map((channel) => {
              const Icon = channel.icon;
              return (
                <Card key={channel.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {channel.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">{channel.coverage.toFixed(1)}%</div>
                    <Progress value={channel.coverage} className="mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Umbral: {channel.threshold}%</span>
                      <span className={channel.coverage >= channel.threshold ? 'text-green-600' : 'text-red-600'}>
                        {channel.coverage >= channel.threshold ? '✓ OK' : '✗ Bajo'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}