import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Heart, Activity, Target } from 'lucide-react';
import type { VO2MaxAnalysis, MetricComparison } from '@/types/advanced-metrics';

interface VO2MaxCardProps {
  analysis: VO2MaxAnalysis;
  comparison?: MetricComparison;
  className?: string;
}

export function VO2MaxCard({ analysis, comparison, className }: VO2MaxCardProps) {
  const getScoreColor = (score: VO2MaxAnalysis['aerobic_capacity_score']) => {
    switch (score) {
      case 'excellent': return 'bg-green-50 text-green-700 border-green-200';
      case 'good': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'average': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'below_average': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'poor': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPercentileValue = (vo2: number) => {
    // Simplified percentile calculation based on typical population
    if (vo2 >= 55) return 90;
    if (vo2 >= 50) return 80;
    if (vo2 >= 45) return 70;
    if (vo2 >= 40) return 60;
    if (vo2 >= 35) return 50;
    return 30;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            VO₂ Max Estimado
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={getScoreColor(analysis.aerobic_capacity_score)}
          >
            {analysis.aerobic_capacity_score.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main VO2 Max Value */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analysis.estimated_vo2_max}
            <span className="text-lg text-gray-500 ml-1">ml/kg/min</span>
          </div>
          <div className="text-sm text-gray-600">
            Capacidad aeróbica máxima estimada
          </div>
        </div>

        {/* Comparison with previous periods */}
        {comparison && (
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">
                +{(comparison.current - comparison.previous_4weeks).toFixed(1)} vs 4 sem
              </span>
            </div>
            <div className="text-gray-500">
              Percentil {getPercentileValue(analysis.estimated_vo2_max)}%
            </div>
          </div>
        )}

        {/* Percentile Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Población general</span>
            <span>Elite</span>
          </div>
          <Progress 
            value={getPercentileValue(analysis.estimated_vo2_max)} 
            className="h-2"
          />
        </div>

        {/* Sub-metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {analysis.vo2_at_threshold}
            </div>
            <div className="text-xs text-gray-600">VO₂ en Umbral</div>
            <div className="text-xs text-gray-500 mt-1">
              ~87% del VO₂ max
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {(analysis.metabolic_flexibility * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Flexibilidad Metabólica</div>
            <div className="text-xs text-gray-500 mt-1">
              Eficiencia aeróbica
            </div>
          </div>
        </div>

        {/* Efficiency Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Eficiencia VO₂</span>
            <span className="font-medium">{analysis.vo2_efficiency} W/(ml/kg/min)</span>
          </div>
          <Progress 
            value={Math.min(100, analysis.vo2_efficiency * 20)} 
            className="h-1"
          />
        </div>

        {/* Contextual Information */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">
                Interpretación Clínica
              </div>
              <div className="text-blue-700 text-xs leading-relaxed">
                {analysis.aerobic_capacity_score === 'excellent' && 
                  "VO₂ máximo excepcional. Capacidad aeróbica de atleta elite. Excelente potencial para deportes de resistencia."}
                {analysis.aerobic_capacity_score === 'good' && 
                  "VO₂ máximo muy bueno. Capacidad aeróbica por encima del promedio. Buen potencial para mejoras."}
                {analysis.aerobic_capacity_score === 'average' && 
                  "VO₂ máximo promedio. Margen significativo para mejoras con entrenamiento específico."}
                {(analysis.aerobic_capacity_score === 'below_average' || analysis.aerobic_capacity_score === 'poor') && 
                  "VO₂ máximo por debajo del promedio. Considere enfoque en entrenamiento aeróbico base."}
              </div>
            </div>
          </div>
        </div>

        {/* Training Recommendations */}
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-medium">Fórmula: <span className="font-mono">VO₂max = 15.3 × (MAP/peso)</span></div>
          <div>Basado en modelo de Coggan con correcciones por edad y género</div>
        </div>
      </CardContent>
    </Card>
  );
}