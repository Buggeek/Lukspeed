import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Zap, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  MapPin,
  Wind,
  Thermometer,
  Mountain,
  Target,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import type { Activity } from '@/types';

interface ActivityComparisonProps {
  activities: Activity[];
  className?: string;
}

interface ComparisonMetric {
  label: string;
  key: keyof Activity;
  format: (value: number) => string;
  higher_is_better: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const comparisonMetrics: ComparisonMetric[] = [
  {
    label: 'Potencia Media',
    key: 'average_power',
    format: (value: number) => `${value}W`,
    higher_is_better: true,
    icon: Zap
  },
  {
    label: 'Potencia Normalizada',
    key: 'normalized_power',
    format: (value: number) => `${value}W`,
    higher_is_better: true,
    icon: Zap
  },
  {
    label: 'Factor Intensidad',
    key: 'intensity_factor',
    format: (value: number) => `${(value || 0).toFixed(2)}`,
    higher_is_better: true,
    icon: TrendingUp
  },
  {
    label: 'TSS',
    key: 'training_stress_score',
    format: (value: number) => `${value}`,
    higher_is_better: true,
    icon: Target
  },
  {
    label: 'Duración',
    key: 'duration',
    format: (value: number) => {
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    },
    higher_is_better: true,
    icon: Clock
  },
  {
    label: 'VAM',
    key: 'vam',
    format: (value: number) => `${value} m/h`,
    higher_is_better: true,
    icon: Mountain
  }
];

export function ActivityComparison({ activities, className }: ActivityComparisonProps) {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [comparisonType, setComparisonType] = useState<'best_vs_recent' | 'manual_select' | 'trend_analysis'>('best_vs_recent');

  // Auto-select activities for best vs recent comparison
  const getBestVsRecentActivities = () => {
    if (activities.length < 2) return [];
    
    const sortedByPower = [...activities]
      .filter(a => a.average_power && a.average_power > 0)
      .sort((a, b) => (b.average_power || 0) - (a.average_power || 0));
    
    const recentActivities = [...activities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    return [
      sortedByPower[0], // Best power
      recentActivities[0] // Most recent
    ].filter(Boolean);
  };

  const getComparisonActivities = () => {
    if (comparisonType === 'best_vs_recent') {
      return getBestVsRecentActivities();
    }
    
    return activities.filter(a => selectedActivities.includes(a.id));
  };

  const comparisonActivities = getComparisonActivities();

  const calculateComparison = (metric: ComparisonMetric, activities: Activity[]) => {
    if (activities.length !== 2) return null;
    
    const [activity1, activity2] = activities;
    const value1 = activity1[metric.key] as number || 0;
    const value2 = activity2[metric.key] as number || 0;
    
    const difference = value2 - value1;
    const percentChange = value1 !== 0 ? (difference / value1) * 100 : 0;
    
    const isImprovement = metric.higher_is_better ? difference > 0 : difference < 0;
    
    return {
      value1,
      value2,
      difference,
      percentChange,
      isImprovement
    };
  };

  const renderMetricComparison = (metric: ComparisonMetric) => {
    const comparison = calculateComparison(metric, comparisonActivities);
    if (!comparison) return null;

    const Icon = metric.icon;
    
    return (
      <div key={metric.key as string} className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-900">{metric.label}</span>
          </div>
          <Badge 
            variant="secondary" 
            className={comparison.isImprovement ? 
              'bg-green-50 text-green-700 border-green-200' : 
              'bg-red-50 text-red-700 border-red-200'
            }
          >
            {comparison.isImprovement ? '+' : ''}{comparison.percentChange.toFixed(1)}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {comparisonType === 'best_vs_recent' ? 'Mejor registro' : 'Actividad 1'}
            </span>
            <span className="font-medium">{metric.format(comparison.value1)}</span>
          </div>
          
          <div className="flex items-center justify-center">
            <ArrowRight className={`h-4 w-4 ${comparison.isImprovement ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {comparisonType === 'best_vs_recent' ? 'Más reciente' : 'Actividad 2'}
            </span>
            <span className="font-medium">{metric.format(comparison.value2)}</span>
          </div>
          
          <div className="text-center text-xs text-gray-500">
            Diferencia: {metric.format(Math.abs(comparison.difference))}
          </div>
        </div>
      </div>
    );
  };

  const renderActivitySelector = () => {
    if (comparisonType !== 'manual_select') return null;
    
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Seleccionar Actividades para Comparar</h3>
        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
          {activities.slice(0, 20).map((activity) => (
            <div 
              key={activity.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedActivities.includes(activity.id) ? 
                'bg-blue-50 border-blue-200' : 
                'hover:bg-gray-50'
              }`}
              onClick={() => {
                if (selectedActivities.includes(activity.id)) {
                  setSelectedActivities(prev => prev.filter(id => id !== activity.id));
                } else if (selectedActivities.length < 2) {
                  setSelectedActivities(prev => [...prev, activity.id]);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {activity.name || `Actividad ${activity.date}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString('es-ES')} • {activity.average_power}W
                  </div>
                </div>
                {selectedActivities.includes(activity.id) && (
                  <Badge variant="secondary" className="text-xs">
                    Seleccionada
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500">
          Selecciona exactamente 2 actividades para comparar. {selectedActivities.length}/2 seleccionadas.
        </div>
      </div>
    );
  };

  const renderTrendAnalysis = () => {
    if (comparisonType !== 'trend_analysis') return null;
    
    // Get last 10 activities for trend analysis
    const recentActivities = [...activities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
    
    const calculateTrend = (metric: keyof Activity) => {
      const values = recentActivities
        .map(a => a[metric] as number)
        .filter(v => v && v > 0);
      
      if (values.length < 3) return null;
      
      const firstHalf = values.slice(Math.floor(values.length / 2));
      const secondHalf = values.slice(0, Math.floor(values.length / 2));
      
      const avgFirst = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
      
      const change = ((avgSecond - avgFirst) / avgFirst) * 100;
      
      return {
        avgFirst,
        avgSecond,
        change,
        trend: Math.abs(change) < 2 ? 'stable' : change > 0 ? 'improving' : 'declining'
      };
    };

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Análisis de Tendencias (Últimas 10 Actividades)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonMetrics.map(metric => {
            const trend = calculateTrend(metric.key);
            if (!trend) return null;
            
            const Icon = metric.icon;
            
            return (
              <Card key={metric.key as string}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">{metric.label}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {metric.format(trend.avgSecond)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={
                          trend.trend === 'improving' ? 'bg-green-50 text-green-700 border-green-200' :
                          trend.trend === 'declining' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }
                      >
                        {trend.trend === 'improving' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : trend.trend === 'declining' ? (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        ) : null}
                        {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      vs. actividades anteriores: {metric.format(trend.avgFirst)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Análisis Comparativo de Actividades</CardTitle>
          <Select value={comparisonType} onValueChange={(value: 'best_vs_recent' | 'manual_select' | 'trend_analysis') => setComparisonType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="best_vs_recent">Mejor vs Reciente</SelectItem>
              <SelectItem value="manual_select">Selección Manual</SelectItem>
              <SelectItem value="trend_analysis">Análisis Tendencias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {comparisonType === 'manual_select' && renderActivitySelector()}
        {comparisonType === 'trend_analysis' && renderTrendAnalysis()}
        
        {(comparisonType === 'best_vs_recent' || 
          (comparisonType === 'manual_select' && selectedActivities.length === 2)) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Comparación de Métricas</h3>
              {comparisonActivities.length === 2 && (
                <div className="text-sm text-gray-500">
                  {new Date(comparisonActivities[0].date).toLocaleDateString('es-ES')} vs{' '}
                  {new Date(comparisonActivities[1].date).toLocaleDateString('es-ES')}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonMetrics.map(renderMetricComparison)}
            </div>
            
            {comparisonActivities.length === 2 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Resumen de Comparación</h4>
                <div className="text-sm text-blue-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">Actividad Base:</div>
                      <div>{comparisonActivities[0].name || 'Sin nombre'}</div>
                      <div className="text-xs text-blue-600">
                        {new Date(comparisonActivities[0].date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Actividad Comparada:</div>
                      <div>{comparisonActivities[1].name || 'Sin nombre'}</div>
                      <div className="text-xs text-blue-600">
                        {new Date(comparisonActivities[1].date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}