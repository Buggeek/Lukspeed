import React, { useState } from 'react';
import { ResponsiveContainer, ResponsiveGrid, AdaptiveCard } from '@/components/ui/responsive-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  Target,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

import { ActivityComparison } from '@/components/comparative/ActivityComparison';
import { ProgressChart } from '@/components/comparative/ProgressChart';
import type { Activity } from '@/types';

// Mock data for demonstration
const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Entrenamiento de Intervalos',
    date: '2024-01-15',
    duration: 3600,
    distance: 45.2,
    average_power: 287,
    normalized_power: 312,
    max_power: 1247,
    average_heart_rate: 156,
    max_heart_rate: 189,
    average_cadence: 92,
    intensity_factor: 0.82,
    training_stress_score: 187,
    elevation_gain: 650,
    vam: 1340,
    work: 985600
  },
  {
    id: '2',
    name: 'Salida Larga Endurance',
    date: '2024-01-20',
    duration: 7200,
    distance: 98.5,
    average_power: 245,
    normalized_power: 268,
    max_power: 890,
    average_heart_rate: 142,
    max_heart_rate: 175,
    average_cadence: 88,
    intensity_factor: 0.68,
    training_stress_score: 245,
    elevation_gain: 1250,
    vam: 1180,
    work: 1764000
  },
  {
    id: '3',
    name: 'Test FTP',
    date: '2024-01-25',
    duration: 2700,
    distance: 32.1,
    average_power: 315,
    normalized_power: 318,
    max_power: 1156,
    average_heart_rate: 165,
    max_heart_rate: 178,
    average_cadence: 95,
    intensity_factor: 0.95,
    training_stress_score: 195,
    elevation_gain: 320,
    vam: 1420,
    work: 850500
  },
  {
    id: '4',
    name: 'Puerto de Montaña',
    date: '2024-01-30',
    duration: 5400,
    distance: 68.7,
    average_power: 268,
    normalized_power: 289,
    max_power: 1089,
    average_heart_rate: 151,
    max_heart_rate: 182,
    average_cadence: 89,
    intensity_factor: 0.74,
    training_stress_score: 223,
    elevation_gain: 1890,
    vam: 1520,
    work: 1447200
  },
  {
    id: '5',
    name: 'Recuperación Activa',
    date: '2024-02-02',
    duration: 2700,
    distance: 42.3,
    average_power: 165,
    normalized_power: 172,
    max_power: 456,
    average_heart_rate: 128,
    max_heart_rate: 145,
    average_cadence: 85,
    intensity_factor: 0.45,
    training_stress_score: 85,
    elevation_gain: 180,
    vam: 890,
    work: 445500
  }
];

const mockProgressData = [
  { date: '2024-01-01', ftp: 305, vo2_max: 57.8, cda: 0.292, weight: 71.2 },
  { date: '2024-01-08', ftp: 307, vo2_max: 58.1, cda: 0.289, weight: 70.8 },
  { date: '2024-01-15', ftp: 310, vo2_max: 58.2, cda: 0.287, weight: 70.5 },
  { date: '2024-01-22', ftp: 312, vo2_max: 58.4, cda: 0.285, weight: 70.3 },
  { date: '2024-01-29', ftp: 315, vo2_max: 58.3, cda: 0.287, weight: 70.1 },
  { date: '2024-02-05', ftp: 318, vo2_max: 58.6, cda: 0.284, weight: 69.9 }
];

export default function ComparativeAnalysis() {
  const [selectedPeriod, setSelectedPeriod] = useState<'4weeks' | '12weeks' | '1year'>('4weeks');
  const [selectedMetric, setSelectedMetric] = useState<'power' | 'performance' | 'physiological'>('power');
  const [comparisonMode, setComparisonMode] = useState<'activities' | 'progress' | 'trends'>('activities');

  const renderSummaryStats = () => {
    const totalActivities = mockActivities.length;
    const avgPower = Math.round(mockActivities.reduce((sum, a) => sum + (a.average_power || 0), 0) / totalActivities);
    const totalTSS = mockActivities.reduce((sum, a) => sum + (a.training_stress_score || 0), 0);
    const totalDistance = mockActivities.reduce((sum, a) => sum + (a.distance || 0), 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <AdaptiveCard className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-700 mb-1">{totalActivities}</div>
            <div className="text-sm text-gray-600">Actividades</div>
            <div className="text-xs text-gray-500 mt-1">Último período</div>
          </div>
        </AdaptiveCard>
        
        <AdaptiveCard className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-green-700 mb-1">{avgPower}W</div>
            <div className="text-sm text-gray-600">Potencia Media</div>
            <div className="text-xs text-gray-500 mt-1">Promedio general</div>
          </div>
        </AdaptiveCard>
        
        <AdaptiveCard className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-purple-700 mb-1">{totalTSS}</div>
            <div className="text-sm text-gray-600">TSS Total</div>
            <div className="text-xs text-gray-500 mt-1">Carga acumulada</div>
          </div>
        </AdaptiveCard>
        
        <AdaptiveCard className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-orange-700 mb-1">{totalDistance.toFixed(0)}km</div>
            <div className="text-sm text-gray-600">Distancia Total</div>
            <div className="text-xs text-gray-500 mt-1">Volumen acumulado</div>
          </div>
        </AdaptiveCard>
      </div>
    );
  };

  const renderActivityTypeAnalysis = () => {
    const activityTypes = [
      { type: 'Intervalos', count: 2, avgPower: 301, avgTSS: 191 },
      { type: 'Endurance', count: 2, avgPower: 256, avgTSS: 234 },
      { type: 'Test/Competición', count: 1, avgPower: 315, avgTSS: 195 }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Análisis por Tipo de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{type.type}</div>
                  <div className="text-sm text-gray-600">{type.count} actividades</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{type.avgPower}W</div>
                  <div className="text-xs text-gray-500">{type.avgTSS} TSS promedio</div>
                </div>
                <div className="w-16 ml-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(type.avgPower / 350) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPerformanceInsights = () => {
    const insights = [
      {
        title: 'Mejora en FTP',
        value: '+13W',
        description: 'Incremento del 4.2% en las últimas 4 semanas',
        trend: 'positive',
        icon: TrendingUp
      },
      {
        title: 'Consistencia de Potencia',
        value: '92.3%',
        description: 'Excelente capacidad de mantener esfuerzo',
        trend: 'positive',
        icon: Target
      },
      {
        title: 'Eficiencia Aerodinámica',
        value: '0.287 m²',
        description: 'CdA mejorado, potencial ahorro 28W',
        trend: 'positive',
        icon: Activity
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <insight.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">{insight.title}</div>
                  <div className="text-2xl font-bold text-blue-700 mb-1">{insight.value}</div>
                  <div className="text-sm text-gray-600">{insight.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer size="full" className="pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Análisis Comparativo Avanzado</h1>
            <p className="text-gray-600">Comparación inteligente de rendimiento y evolución temporal</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={(value: '4weeks' | '12weeks' | '1year') => setSelectedPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4weeks">4 Semanas</SelectItem>
                <SelectItem value="12weeks">12 Semanas</SelectItem>
                <SelectItem value="1year">1 Año</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {renderSummaryStats()}

      {/* Main Analysis Tabs */}
      <Tabs value={comparisonMode} onValueChange={(value: 'activities' | 'progress' | 'trends') => setComparisonMode(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities">Comparar Actividades</TabsTrigger>
          <TabsTrigger value="progress">Evolución Temporal</TabsTrigger>
          <TabsTrigger value="trends">Análisis Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityComparison activities={mockActivities} />
            </div>
            <div className="space-y-4">
              {renderActivityTypeAnalysis()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="space-y-6">
            <ProgressChart data={mockProgressData} />
            {renderPerformanceInsights()}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Tendencias de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-900">FTP Trending Up</div>
                      <div className="text-sm text-green-700">+4.2% últimas 4 semanas</div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Mejorando
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-blue-900">Consistencia Estable</div>
                      <div className="text-sm text-blue-700">Variabilidad < 5%</div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Target className="h-3 w-3 mr-1" />
                      Estable
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <div className="font-medium text-yellow-900">Carga de Entrenamiento</div>
                      <div className="text-sm text-yellow-700">TSB ligeramente negativo</div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Activity className="h-3 w-3 mr-1" />
                      Monitor
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Patrones Temporales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Mejor día semana</span>
                      <span className="font-bold text-orange-700">Martes</span>
                    </div>
                    <div className="text-xs text-gray-500">Potencia promedio: 289W</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Hora óptima</span>
                      <span className="font-bold text-orange-700">8:00-10:00</span>
                    </div>
                    <div className="text-xs text-gray-500">Mayor rendimiento matutino</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Frecuencia ideal</span>
                      <span className="font-bold text-orange-700">4-5 días/sem</span>
                    </div>
                    <div className="text-xs text-gray-500">Mejor balance carga/recuperación</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Condiciones</span>
                      <span className="font-bold text-orange-700">15-20°C</span>
                    </div>
                    <div className="text-xs text-gray-500">Temperatura óptima rendimiento</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avanzados
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar Datos
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Compartir Análisis
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Generar Reporte PDF
          </Button>
        </div>
      </div>
    </ResponsiveContainer>
  );
}