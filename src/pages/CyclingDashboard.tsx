import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ResponsiveGrid, AdaptiveCard } from '@/components/ui/responsive-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Heart, 
  Timer, 
  Mountain,
  Activity,
  Target,
  Calendar,
  Award,
  ChevronRight,
  Play,
  Pause,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { PowerCurveChart } from '@/components/charts/PowerCurveChart';
import { TrainingLoadChart } from '@/components/charts/TrainingLoadChart';

interface MetricComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface CyclingMetrics {
  // Variables Base (26)
  power_avg: MetricComparison;
  power_normalized: MetricComparison;
  ftp_current: MetricComparison;
  intensity_factor: MetricComparison;
  
  // Escalada (Variables específicas)
  vam_average: MetricComparison;
  elevation_gain_total: MetricComparison;
  power_to_weight: MetricComparison;
  climbing_efficiency: MetricComparison;
  
  // Resistencia y Consistencia
  duration_average: MetricComparison;
  power_consistency: MetricComparison;
  cardiac_drift: MetricComparison;
  endurance_factor: MetricComparison;
  
  // Eficiencia Biomecánica
  pedaling_efficiency: MetricComparison;
  left_right_balance: MetricComparison;
  pedaling_smoothness: MetricComparison;
  cadence_consistency: MetricComparison;
  
  // Carga de Entrenamiento
  tss_weekly: MetricComparison;
  ctl_fitness: MetricComparison;
  atl_fatigue: MetricComparison;
  tsb_form: MetricComparison;
}

export default function CyclingDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'4weeks' | '8weeks' | '12weeks'>('4weeks');
  const [isLiveActivity, setIsLiveActivity] = useState(false);
  
  // Mock data basado en métricas reales de ciclismo
  const cyclingMetrics: CyclingMetrics = {
    // Potencia - Métricas fundamentales
    power_avg: {
      current: 287,
      previous: 275,
      change: 12,
      changePercent: 4.4,
      trend: 'up',
      status: 'good'
    },
    power_normalized: {
      current: 312,
      previous: 298,
      change: 14,
      changePercent: 4.7,
      trend: 'up',
      status: 'good'
    },
    ftp_current: {
      current: 315,
      previous: 307,
      change: 8,
      changePercent: 2.6,
      trend: 'up',
      status: 'excellent'
    },
    intensity_factor: {
      current: 0.82,
      previous: 0.79,
      change: 0.03,
      changePercent: 3.8,
      trend: 'up',
      status: 'good'
    },
    
    // Escalada - Métricas específicas de montaña
    vam_average: {
      current: 1247,
      previous: 1189,
      change: 58,
      changePercent: 4.9,
      trend: 'up',
      status: 'excellent'
    },
    elevation_gain_total: {
      current: 3250,
      previous: 2890,
      change: 360,
      changePercent: 12.5,
      trend: 'up',
      status: 'good'
    },
    power_to_weight: {
      current: 4.38,
      previous: 4.26,
      change: 0.12,
      changePercent: 2.8,
      trend: 'up',
      status: 'excellent'
    },
    climbing_efficiency: {
      current: 84.3,
      previous: 81.7,
      change: 2.6,
      changePercent: 3.2,
      trend: 'up',
      status: 'good'
    },
    
    // Resistencia
    duration_average: {
      current: 95.2,
      previous: 87.6,
      change: 7.6,
      changePercent: 8.7,
      trend: 'up',
      status: 'good'
    },
    power_consistency: {
      current: 92.1,
      previous: 89.3,
      change: 2.8,
      changePercent: 3.1,
      trend: 'up',
      status: 'excellent'
    },
    cardiac_drift: {
      current: 3.2,
      previous: 4.1,
      change: -0.9,
      changePercent: -22.0,
      trend: 'up',
      status: 'excellent'
    },
    endurance_factor: {
      current: 1.68,
      previous: 1.61,
      change: 0.07,
      changePercent: 4.3,
      trend: 'up',
      status: 'good'
    },
    
    // Eficiencia Biomecánica
    pedaling_efficiency: {
      current: 87.4,
      previous: 85.1,
      change: 2.3,
      changePercent: 2.7,
      trend: 'up',
      status: 'good'
    },
    left_right_balance: {
      current: 51.2,
      previous: 52.1,
      change: -0.9,
      changePercent: -1.7,
      trend: 'up',
      status: 'good'
    },
    pedaling_smoothness: {
      current: 78.9,
      previous: 76.4,
      change: 2.5,
      changePercent: 3.3,
      trend: 'up',
      status: 'good'
    },
    cadence_consistency: {
      current: 94.2,
      previous: 91.8,
      change: 2.4,
      changePercent: 2.6,
      trend: 'up',
      status: 'excellent'
    },
    
    // Carga de Entrenamiento
    tss_weekly: {
      current: 485,
      previous: 456,
      change: 29,
      changePercent: 6.4,
      trend: 'up',
      status: 'good'
    },
    ctl_fitness: {
      current: 58.2,
      previous: 54.8,
      change: 3.4,
      changePercent: 6.2,
      trend: 'up',
      status: 'excellent'
    },
    atl_fatigue: {
      current: 62.1,
      previous: 59.3,
      change: 2.8,
      changePercent: 4.7,
      trend: 'up',
      status: 'warning'
    },
    tsb_form: {
      current: -3.9,
      previous: -4.5,
      change: 0.6,
      changePercent: 13.3,
      trend: 'up',
      status: 'good'
    }
  };

  const renderMetricCard = (
    title: string,
    metric: MetricComparison,
    unit: string,
    icon: React.ComponentType<{ className?: string }>,
    description: string,
    optimal?: { min: number; max: number }
  ) => {
    const Icon = icon;
    const trendIcon = metric.trend === 'up' ? ArrowUp : metric.trend === 'down' ? ArrowDown : Minus;
    const trendColor = metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600';
    
    return (
      <AdaptiveCard className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Icon className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            </div>
            
            <div className="space-y-1 mb-3">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-gray-900">
                  {typeof metric.current === 'number' ? metric.current.toFixed(unit === '%' ? 1 : 0) : metric.current}
                </span>
                <span className="text-sm text-gray-500">{unit}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 text-xs ${trendColor}`}>
                  {React.createElement(trendIcon, { className: "h-3 w-3" })}
                  <span>{Math.abs(metric.change).toFixed(unit === '%' ? 1 : 0)}{unit}</span>
                  <span>({metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%)</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    metric.status === 'excellent' ? 'bg-green-50 text-green-700 border-green-200' :
                    metric.status === 'good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    metric.status === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {selectedPeriod === '4weeks' ? 'vs. 4 sem ant.' : 
                   selectedPeriod === '8weeks' ? 'vs. 8 sem ant.' : 'vs. 12 sem ant.'}
                </Badge>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 leading-tight">{description}</p>
            
            {optimal && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Óptimo: {optimal.min}-{optimal.max}{unit}</span>
                </div>
                <Progress 
                  value={Math.min(100, Math.max(0, ((metric.current - optimal.min) / (optimal.max - optimal.min)) * 100))} 
                  className="h-1"
                />
              </div>
            )}
          </div>
        </div>
      </AdaptiveCard>
    );
  };

  return (
    <ResponsiveContainer size="full" className="pb-20 lg:pb-8">
      {/* Header con Período de Comparación */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Rendimiento</h1>
            <p className="text-gray-600">Métricas específicas de ciclismo con análisis temporal</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tabs value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="4weeks" className="text-xs">4 Semanas</TabsTrigger>
                <TabsTrigger value="8weeks" className="text-xs">8 Semanas</TabsTrigger>
                <TabsTrigger value="12weeks" className="text-xs">12 Semanas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Métricas por Categorías */}
      <Tabs defaultValue="power" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="power">Potencia</TabsTrigger>
          <TabsTrigger value="climbing">Escalada</TabsTrigger>
          <TabsTrigger value="endurance">Resistencia</TabsTrigger>
          <TabsTrigger value="efficiency">Eficiencia</TabsTrigger>
          <TabsTrigger value="load">Carga</TabsTrigger>
        </TabsList>

        {/* Potencia */}
        <TabsContent value="power">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Análisis de Potencia</h2>
            <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 4 }}>
              {renderMetricCard(
                "FTP Actual",
                cyclingMetrics.ftp_current,
                "W",
                Zap,
                "Potencia funcional en umbral. Base para zonas de entrenamiento.",
                { min: 280, max: 350 }
              )}
              {renderMetricCard(
                "Potencia Promedio",
                cyclingMetrics.power_avg,
                "W",
                Activity,
                "Potencia media en actividades. Indica capacidad sostenida.",
                { min: 250, max: 320 }
              )}
              {renderMetricCard(
                "Potencia Normalizada",
                cyclingMetrics.power_normalized,
                "W",
                TrendingUp,
                "Potencia ajustada por variabilidad. Mejor indicador de esfuerzo.",
                { min: 270, max: 340 }
              )}
              {renderMetricCard(
                "Factor de Intensidad",
                cyclingMetrics.intensity_factor,
                "",
                Target,
                "IF = NP/FTP. Indica la intensidad relativa del entrenamiento.",
                { min: 0.7, max: 0.9 }
              )}
            </ResponsiveGrid>
          </div>
        </TabsContent>

        {/* Escalada */}
        <TabsContent value="climbing">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Rendimiento en Escalada</h2>
            <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 4 }}>
              {renderMetricCard(
                "VAM Promedio",
                cyclingMetrics.vam_average,
                "m/h",
                Mountain,
                "Velocidad de Ascensión Media. Métrica clave para escaladores.",
                { min: 1100, max: 1400 }
              )}
              {renderMetricCard(
                "Potencia/Peso",
                cyclingMetrics.power_to_weight,
                "W/kg",
                TrendingUp,
                "Ratio fundamental para escalada. P/W en esfuerzos de subida.",
                { min: 4.0, max: 5.0 }
              )}
              {renderMetricCard(
                "Metros Escalados",
                cyclingMetrics.elevation_gain_total,
                "m",
                Mountain,
                "Desnivel acumulado total en el período de análisis.",
                { min: 2500, max: 4000 }
              )}
              {renderMetricCard(
                "Eficiencia Escalada",
                cyclingMetrics.climbing_efficiency,
                "%",
                Award,
                "Eficiencia energética en subidas vs. terreno llano.",
                { min: 80, max: 90 }
              )}
            </ResponsiveGrid>
          </div>
        </TabsContent>

        {/* Resistencia */}
        <TabsContent value="endurance">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Capacidad de Resistencia</h2>
            <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 4 }}>
              {renderMetricCard(
                "Duración Promedio",
                cyclingMetrics.duration_average,
                "min",
                Timer,
                "Tiempo promedio de actividades. Indica capacidad aeróbica.",
                { min: 80, max: 120 }
              )}
              {renderMetricCard(
                "Consistencia Potencia",
                cyclingMetrics.power_consistency,
                "%",
                BarChart3,
                "Capacidad de mantener potencia constante durante esfuerzos.",
                { min: 85, max: 95 }
              )}
              {renderMetricCard(
                "Deriva Cardíaca",
                cyclingMetrics.cardiac_drift,
                "%",
                Heart,
                "Aumento de FC por fatiga. Menor valor = mejor resistencia.",
                { min: 2, max: 5 }
              )}
              {renderMetricCard(
                "Factor Resistencia",
                cyclingMetrics.endurance_factor,
                "",
                Activity,
                "EF = NP/HR promedio. Eficiencia cardio-respiratoria.",
                { min: 1.5, max: 2.0 }
              )}
            </ResponsiveGrid>
          </div>
        </TabsContent>

        {/* Eficiencia */}
        <TabsContent value="efficiency">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Eficiencia Biomecánica</h2>
            <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 4 }}>
              {renderMetricCard(
                "Eficiencia Pedaleo",
                cyclingMetrics.pedaling_efficiency,
                "%",
                Target,
                "Porcentaje de fuerza aplicada en dirección efectiva.",
                { min: 80, max: 90 }
              )}
              {renderMetricCard(
                "Balance L/R",
                cyclingMetrics.left_right_balance,
                "%",
                Activity,
                "Distribución de potencia entre piernas. Óptimo ~50%.",
                { min: 48, max: 52 }
              )}
              {renderMetricCard(
                "Suavidad Pedaleo",
                cyclingMetrics.pedaling_smoothness,
                "%",
                Timer,
                "Uniformidad en la aplicación de fuerza durante el ciclo.",
                { min: 75, max: 85 }
              )}
              {renderMetricCard(
                "Consistencia Cadencia",
                cyclingMetrics.cadence_consistency,
                "%",
                Activity,
                "Estabilidad en la frecuencia de pedaleo durante esfuerzos.",
                { min: 90, max: 98 }
              )}
            </ResponsiveGrid>
          </div>
        </TabsContent>

        {/* Carga */}
        <TabsContent value="load">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Gestión de Carga de Entrenamiento</h2>
            <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 4 }}>
              {renderMetricCard(
                "TSS Semanal",
                cyclingMetrics.tss_weekly,
                "TSS",
                BarChart3,
                "Estrés de entrenamiento semanal. Volumen x Intensidad.",
                { min: 400, max: 600 }
              )}
              {renderMetricCard(
                "CTL (Forma Física)",
                cyclingMetrics.ctl_fitness,
                "",
                TrendingUp,
                "Carga Crónica. Promedio 42 días. Indica forma física actual.",
                { min: 50, max: 70 }
              )}
              {renderMetricCard(
                "ATL (Fatiga)",
                cyclingMetrics.atl_fatigue,
                "",
                Activity,
                "Carga Aguda. Promedio 7 días. Indica fatiga reciente.",
                { min: 45, max: 65 }
              )}
              {renderMetricCard(
                "TSB (Forma)",
                cyclingMetrics.tsb_form,
                "",
                Target,
                "Balance de Estrés. CTL-ATL. Indica frescura para competir.",
                { min: -10, max: 10 }
              )}
            </ResponsiveGrid>
          </div>
        </TabsContent>
      </Tabs>

      {/* Resumen Ejecutivo */}
      <div className="mt-8">
        <AdaptiveCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Resumen de Rendimiento - {selectedPeriod === '4weeks' ? 'Últimas 4 Semanas' : selectedPeriod === '8weeks' ? 'Últimas 8 Semanas' : 'Últimas 12 Semanas'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {Object.values(cyclingMetrics).filter(m => m.status === 'excellent').length}
                </div>
                <div className="text-sm text-green-600">Métricas Excelentes</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {Object.values(cyclingMetrics).filter(m => m.status === 'good').length}
                </div>
                <div className="text-sm text-blue-600">Métricas Buenas</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700 mb-1">
                  {Object.values(cyclingMetrics).filter(m => m.status === 'warning').length}
                </div>
                <div className="text-sm text-yellow-600">Métricas a Mejorar</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Principales Insights:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>FTP aumentó 2.6%</strong> - Mejora significativa en potencia funcional</li>
                <li>• <strong>VAM subió 4.9%</strong> - Excelente progreso en capacidad de escalada</li>
                <li>• <strong>Deriva cardíaca mejoró 22%</strong> - Mayor eficiencia cardiovascular</li>
                <li>• <strong>ATL elevado</strong> - Considera reducir intensidad próxima semana</li>
              </ul>
            </div>
          </div>
        </AdaptiveCard>
      </div>
    </ResponsiveContainer>
  );
}