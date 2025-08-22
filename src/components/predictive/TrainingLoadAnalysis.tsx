import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Battery,
  Zap,
  Calendar
} from 'lucide-react';
import type { TrainingLoadMetrics } from '@/utils/predictive-models';

interface TrainingLoadAnalysisProps {
  metrics: TrainingLoadMetrics;
  historicalData?: Array<{
    date: string;
    ctl: number;
    atl: number;
    tsb: number;
    tss: number;
  }>;
  className?: string;
}

export function TrainingLoadAnalysis({ metrics, historicalData = [], className }: TrainingLoadAnalysisProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'recommendations'>('overview');

  // Mock historical data if not provided
  const mockHistoricalData = historicalData.length > 0 ? historicalData : [
    { date: '2024-01-01', ctl: 45.2, atl: 52.1, tsb: -6.9, tss: 85 },
    { date: '2024-01-02', ctl: 46.1, atl: 54.3, tsb: -8.2, tss: 92 },
    { date: '2024-01-03', ctl: 47.3, atl: 48.7, tsb: -1.4, tss: 65 },
    { date: '2024-01-04', ctl: 48.1, atl: 45.2, tsb: 2.9, tss: 45 },
    { date: '2024-01-05', ctl: 49.2, atl: 47.8, tsb: 1.4, tss: 78 },
    { date: '2024-01-06', ctl: 50.3, atl: 51.2, tsb: -0.9, tss: 88 },
    { date: '2024-01-07', ctl: 51.8, atl: 55.4, tsb: -3.6, tss: 95 },
    { date: '2024-01-08', ctl: 52.7, atl: 58.1, tsb: -5.4, tss: 102 },
    { date: '2024-01-09', ctl: 53.9, atl: 60.2, tsb: -6.3, tss: 108 },
    { date: '2024-01-10', ctl: 55.1, atl: 62.1, tsb: -7.0, tss: 115 },
    { date: '2024-01-11', ctl: 56.4, atl: 59.8, tsb: -3.4, tss: 95 },
    { date: '2024-01-12', ctl: 57.2, atl: 55.7, tsb: 1.5, tss: 75 },
    { date: '2024-01-13', ctl: 58.2, atl: 62.1, tsb: -3.9, tss: 125 },
    { date: '2024-01-14', ctl: metrics.ctl, atl: metrics.atl, tsb: metrics.tsb, tss: 0 }
  ];

  const getFormStatus = (tsb: number) => {
    if (tsb > 20) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-50', label: 'Forma Excelente' };
    if (tsb > 5) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-50', label: 'Buena Forma' };
    if (tsb > -10) return { status: 'neutral', color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Neutral' };
    if (tsb > -30) return { status: 'tired', color: 'text-orange-600', bg: 'bg-orange-50', label: 'Cansado' };
    return { status: 'overreached', color: 'text-red-600', bg: 'bg-red-50', label: 'Sobreentrenado' };
  };

  const getFitnessIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFatigueIcon = (level: string) => {
    switch (level) {
      case 'fresh': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'building': return <Activity className="h-4 w-4 text-yellow-600" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'extreme': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formStatus = getFormStatus(metrics.tsb);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">CTL (Forma Física)</span>
              {getFitnessIcon(metrics.fitness_trend)}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.ctl}
            </div>
            <div className="text-xs text-gray-600">
              Carga crónica (42 días)
            </div>
            <Progress value={Math.min(100, (metrics.ctl / 80) * 100)} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">ATL (Fatiga)</span>
              {getFatigueIcon(metrics.fatigue_trend)}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.atl}
            </div>
            <div className="text-xs text-gray-600">
              Carga aguda (7 días)
            </div>
            <Progress value={Math.min(100, (metrics.atl / 100) * 100)} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">TSB (Forma)</span>
              <Battery className={`h-4 w-4 ${formStatus.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.tsb > 0 ? '+' : ''}{metrics.tsb}
            </div>
            <div className="text-xs text-gray-600">
              Balance estrés (CTL - ATL)
            </div>
            <Badge variant="secondary" className={`${formStatus.bg} ${formStatus.color} mt-2`}>
              {formStatus.label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Form Status Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Estado de Forma Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg ${formStatus.bg}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full bg-white`}>
                <Battery className={`h-6 w-6 ${formStatus.color}`} />
              </div>
              <div className="flex-1">
                <div className={`font-semibold ${formStatus.color} mb-1`}>
                  {formStatus.label}
                </div>
                <div className="text-sm text-gray-700 mb-3">
                  {metrics.form === 'excellent' && 'Excelente momento para competir. Tu cuerpo está fresco y en forma.'}
                  {metrics.form === 'good' && 'Buena forma para entrenamientos intensos y competiciones.'}
                  {metrics.form === 'neutral' && 'Forma neutral. Considera el contexto de tu periodización.'}
                  {metrics.form === 'tired' && 'Síntomas de fatiga. Considera reducir la carga o incluir más recuperación.'}
                  {metrics.form === 'overreached' && 'Posible sobreentrenamiento. Prioriza la recuperación inmediatamente.'}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tendencia Fitness:</span>
                    <span className="ml-2 capitalize">{metrics.fitness_trend}</span>
                  </div>
                  <div>
                    <span className="font-medium">Nivel Fatiga:</span>
                    <span className="ml-2 capitalize">{metrics.fatigue_trend}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Carga de Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockHistoricalData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                  formatter={(value: number, name: string) => [
                    value.toFixed(1), 
                    name === 'ctl' ? 'CTL (Forma)' : 
                    name === 'atl' ? 'ATL (Fatiga)' : 'TSB (Balance)'
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ctl" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  name="ctl"
                />
                <Line 
                  type="monotone" 
                  dataKey="atl" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                  name="atl"
                />
                <Line 
                  type="monotone" 
                  dataKey="tsb" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  name="tsb"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>CTL (Forma Física)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>ATL (Fatiga)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>TSB (Balance)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribución de TSS Diario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockHistoricalData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                  formatter={(value: number) => [`${value} TSS`, 'Carga Diaria']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tss" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Recomendaciones de Entrenamiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Recommendation */}
          <div className={`p-4 rounded-lg ${formStatus.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`h-5 w-5 ${formStatus.color}`} />
              <span className={`font-medium ${formStatus.color}`}>
                Recomendación Principal
              </span>
            </div>
            <div className="text-sm text-gray-700">
              {metrics.form === 'excellent' && 'Momento ideal para competir o entrenamientos de alta intensidad. Mantén la carga actual.'}
              {metrics.form === 'good' && 'Puedes mantener entrenamientos intensos. Considera una competición próximamente.'}
              {metrics.form === 'neutral' && 'Evalúa tus objetivos. Si buscas forma, aumenta carga. Si compites pronto, reduce ligeramente.'}
              {metrics.form === 'tired' && 'Reduce la intensidad 20-30%. Prioriza entrenamientos aeróbicos y recuperación.'}
              {metrics.form === 'overreached' && 'STOP: Necesitas 3-7 días de recuperación completa o entrenamiento muy suave.'}
            </div>
          </div>

          {/* Specific Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Próximos 7 Días</span>
                </div>
                <div className="space-y-2 text-sm">
                  {metrics.tsb > 5 ? (
                    <>
                      <div>• 2-3 entrenamientos de alta intensidad</div>
                      <div>• Considera una competición</div>
                      <div>• Mantén volumen actual</div>
                    </>
                  ) : metrics.tsb > -10 ? (
                    <>
                      <div>• 1-2 entrenamientos intensos máximo</div>
                      <div>• Incluye más recuperación activa</div>
                      <div>• Reduce volumen 10-15%</div>
                    </>
                  ) : (
                    <>
                      <div>• Solo entrenamientos suaves</div>
                      <div>• Maximiza horas de sueño</div>
                      <div>• Considera días completos de descanso</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-900">Objetivos TSS</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>TSS semanal objetivo:</span>
                    <span className="font-medium">
                      {metrics.tsb > 5 ? '450-550' : 
                       metrics.tsb > -10 ? '350-450' : '200-350'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TSS diario promedio:</span>
                    <span className="font-medium">
                      {metrics.tsb > 5 ? '65-80' : 
                       metrics.tsb > -10 ? '50-65' : '30-50'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Días de descanso:</span>
                    <span className="font-medium">
                      {metrics.tsb > 5 ? '1-2' : 
                       metrics.tsb > -10 ? '2-3' : '3-4'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recovery Recommendations */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Battery className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-900">Estrategias de Recuperación</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700 mb-1">Sueño</div>
                  <div>8-9 horas por noche</div>
                  <div>Siestras 20-30 min</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700 mb-1">Nutrición</div>
                  <div>Proteína post-entreno</div>
                  <div>Hidratación óptima</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700 mb-1">Activa</div>
                  <div>Estiramientos diarios</div>
                  <div>Masajes semanales</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Análisis de Carga de Entrenamiento
          </CardTitle>
          <Badge variant="secondary" className={`${formStatus.bg} ${formStatus.color}`}>
            {formStatus.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            {renderOverview()}
          </TabsContent>
          
          <TabsContent value="trends" className="mt-6">
            {renderTrends()}
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-6">
            {renderRecommendations()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}