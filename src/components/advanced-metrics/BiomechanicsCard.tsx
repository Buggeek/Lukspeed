import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Target, TrendingUp, RotateCcw } from 'lucide-react';
import type { BiomechanicalAnalysis } from '@/types/advanced-metrics';

interface BiomechanicsCardProps {
  analysis: BiomechanicalAnalysis;
  className?: string;
}

export function BiomechanicsCard({ analysis, className }: BiomechanicsCardProps) {
  const getEfficiencyStatus = (score: number) => {
    if (score >= 90) return { status: 'excellent', color: 'bg-green-50 text-green-700 border-green-200' };
    if (score >= 80) return { status: 'good', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (score >= 70) return { status: 'average', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    return { status: 'needs_improvement', color: 'bg-red-50 text-red-700 border-red-200' };
  };

  const efficiencyStatus = getEfficiencyStatus(analysis.biomechanical_efficiency_score);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Análisis Biomecánico
          </CardTitle>
          <Badge variant="secondary" className={efficiencyStatus.color}>
            {analysis.biomechanical_efficiency_score.toFixed(1)}% Eficiencia
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Torque Effectiveness */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Torque Efectivo (TE)</span>
            <span className="text-lg font-bold text-gray-900">{analysis.torque_effectiveness.toFixed(1)}%</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-sm font-semibold text-blue-600">{analysis.left_torque_effectiveness.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Izquierda</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-sm font-semibold text-green-600">{analysis.right_torque_effectiveness.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Derecha</div>
            </div>
          </div>
          <Progress 
            value={analysis.torque_effectiveness} 
            className="h-2"
          />
          <div className="text-xs text-gray-500">
            Óptimo: 90-98% • Actual: {analysis.torque_effectiveness > 90 ? 'Excelente' : analysis.torque_effectiveness > 85 ? 'Bueno' : 'Mejorable'}
          </div>
        </div>

        {/* Pedal Smoothness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Suavidad de Pedaleo</span>
            <span className="text-lg font-bold text-gray-900">{analysis.pedal_smoothness.toFixed(1)}%</span>
          </div>
          <Progress 
            value={Math.min(100, analysis.pedal_smoothness * 3.33)} 
            className="h-2"
          />
          <div className="text-xs text-gray-500">
            Rango objetivo: 15-30% • Más alto = más suave
          </div>
        </div>

        {/* Power Phase Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <RotateCcw className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-blue-700">
              {analysis.power_phase_angle.toFixed(0)}°
            </div>
            <div className="text-xs text-blue-600">Fase de Potencia</div>
            <div className="text-xs text-gray-500 mt-1">Óptimo: 65-75°</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Target className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-green-700">
              {analysis.peak_power_phase_angle.toFixed(0)}°
            </div>
            <div className="text-xs text-green-600">Pico de Potencia</div>
            <div className="text-xs text-gray-500 mt-1">Ángulo óptimo</div>
          </div>
        </div>

        {/* Muscle Activation Symmetry */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Simetría Muscular L/R</span>
            <span className="text-lg font-bold text-gray-900">{(analysis.muscle_activation_symmetry * 100).toFixed(1)}%</span>
          </div>
          <Progress 
            value={analysis.muscle_activation_symmetry * 100} 
            className="h-2"
          />
          <div className="text-xs text-gray-500">
            {analysis.muscle_activation_symmetry > 0.95 ? 'Excelente simetría' : 
             analysis.muscle_activation_symmetry > 0.90 ? 'Buena simetría' : 
             'Considere análisis de ajuste de bicicleta'}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-purple-800 mb-1">
                Recomendaciones Biomecánicas
              </div>
              <div className="text-purple-700 text-xs leading-relaxed">
                {analysis.torque_effectiveness < 85 && 
                  "• Trabajar técnica de pedaleo circular. "}
                {Math.abs(analysis.left_torque_effectiveness - analysis.right_torque_effectiveness) > 5 && 
                  "• Corregir asimetría L/R con ejercicios específicos. "}
                {analysis.pedal_smoothness < 20 && 
                  "• Mejorar suavidad con cadencia constante. "}
                {analysis.power_phase_angle < 60 || analysis.power_phase_angle > 80 ? 
                  "• Optimizar posición en bicicleta para mejor aplicación de fuerza." : 
                  "Biomecánica dentro de rangos óptimos."}
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-600 pt-2 border-t">
          <div className="font-medium">Fórmula TE: <span className="font-mono">(torque_positivo / |torque_total|) × 100</span></div>
          <div>Medición requiere potenciómetro avanzado con análisis de torque</div>
        </div>
      </CardContent>
    </Card>
  );
}