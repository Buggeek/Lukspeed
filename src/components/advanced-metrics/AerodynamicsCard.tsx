import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wind, Gauge, TrendingDown, AlertTriangle } from 'lucide-react';
import type { AerodynamicAnalysis } from '@/types/advanced-metrics';

interface AerodynamicsCardProps {
  analysis: AerodynamicAnalysis;
  className?: string;
}

export function AerodynamicsCard({ analysis, className }: AerodynamicsCardProps) {
  const getCdAStatus = (cda: number) => {
    if (cda <= 0.25) return { status: 'excellent', color: 'bg-green-50 text-green-700 border-green-200' };
    if (cda <= 0.30) return { status: 'good', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (cda <= 0.35) return { status: 'average', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    return { status: 'needs_improvement', color: 'bg-red-50 text-red-700 border-red-200' };
  };

  const cdaStatus = getCdAStatus(analysis.cda_dynamic);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-blue-500" />
            Análisis Aerodinámico
          </CardTitle>
          <Badge variant="secondary" className={cdaStatus.color}>
            CdA: {analysis.cda_dynamic.toFixed(3)} m²
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main CdA Value */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analysis.cda_dynamic.toFixed(3)}
            <span className="text-lg text-gray-500 ml-1">m²</span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Coeficiente Aerodinámico Dinámico
          </div>
          <div className="text-xs text-gray-500">
            Fórmula: CdA = (2 × P_aero) / (ρ × v_aire³)
          </div>
        </div>

        {/* Efficiency Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Eficiencia Aerodinámica</span>
            <span className="text-lg font-bold text-gray-900">{analysis.aerodynamic_efficiency_score.toFixed(1)}/100</span>
          </div>
          <Progress 
            value={analysis.aerodynamic_efficiency_score} 
            className="h-2"
          />
        </div>

        {/* Component Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Gauge className="h-4 w-4 text-gray-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-700">
              {analysis.drag_coefficient.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Coef. Arrastre (Cd)</div>
            <div className="text-xs text-gray-500 mt-1">Típico: 0.8-1.2</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-700">
              {analysis.frontal_area.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Área Frontal (m²)</div>
            <div className="text-xs text-gray-500 mt-1">Típico: 0.3-0.5 m²</div>
          </div>
        </div>

        {/* Rolling Resistance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Resistencia Rodadura (Crr)</span>
            <span className="text-lg font-bold text-gray-900">{(analysis.rolling_resistance_dynamic * 1000).toFixed(1)}</span>
          </div>
          <Progress 
            value={Math.min(100, analysis.rolling_resistance_dynamic * 12500)} 
            className="h-2"
          />
          <div className="text-xs text-gray-500">
            Rango típico: 0.002-0.008 • Valor actual: {analysis.rolling_resistance_dynamic.toFixed(4)}
          </div>
        </div>

        {/* Wind Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Wind className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-blue-700">
              {analysis.wind_relative_speed.toFixed(1)}
            </div>
            <div className="text-xs text-blue-600">Viento Relativo (m/s)</div>
            <div className="text-xs text-gray-500 mt-1">
              Factor yaw: {(analysis.yaw_angle_effect * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <TrendingDown className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-green-700">
              {analysis.aero_power_savings.toFixed(0)}W
            </div>
            <div className="text-xs text-green-600">Ahorro Potencial</div>
            <div className="text-xs text-gray-500 mt-1">Con optimización</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">
                Recomendaciones Aerodinámicas
              </div>
              <div className="text-blue-700 text-xs leading-relaxed">
                {analysis.cda_dynamic > 0.35 && 
                  "• CdA alto - considere posición más aerodinámica. "}
                {analysis.rolling_resistance_dynamic > 0.006 && 
                  "• Crr elevado - revisar presión de neumáticos. "}
                {analysis.aerodynamic_efficiency_score < 70 && 
                  "• Eficiencia baja - optimizar equipamiento aero. "}
                {analysis.aero_power_savings > 20 && 
                  "• Gran potencial de mejora con ajustes de posición."}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="text-xs text-gray-600 pt-2 border-t space-y-1">
          <div>Cálculo basado en tramos homogéneos con potencia/velocidad/densidad aire</div>
          <div>Crr estimado en segmentos planos (&lt;2% pendiente)</div>
          <div>Correcciones por temperatura y presión barométrica incluidas</div>
        </div>
      </CardContent>
    </Card>
  );
}