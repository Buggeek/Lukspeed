import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import type { ThresholdAnalysis } from '@/types/advanced-metrics';

interface ThresholdAnalysisCardProps {
  analysis: ThresholdAnalysis;
  className?: string;
}

export function ThresholdAnalysisCard({ analysis, className }: ThresholdAnalysisCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Análisis de Umbrales
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={`${getConfidenceColor(analysis.threshold_detection_confidence)}`}
          >
            Confianza: {(analysis.threshold_detection_confidence * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* VT1 and VT2 Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {analysis.vt1_power}W
            </div>
            <div className="text-sm text-blue-600 mb-1">VT1 - Umbral Aeróbico</div>
            <div className="text-xs text-gray-500">{analysis.vt1_heart_rate} bpm</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700 mb-1">
              {analysis.vt2_power}W
            </div>
            <div className="text-sm text-red-600 mb-1">VT2 - Umbral Anaeróbico</div>
            <div className="text-xs text-gray-500">{analysis.vt2_heart_rate} bpm</div>
          </div>
        </div>

        {/* Lactate Shuttle Efficiency */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Eficiencia Shuttle Lactato</span>
            <span className="font-medium">{(analysis.lactate_shuttle_efficiency * 100).toFixed(1)}%</span>
          </div>
          <Progress 
            value={Math.min(100, analysis.lactate_shuttle_efficiency * 200)} 
            className="h-2"
          />
        </div>

        {/* Detection Confidence */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <AlertCircle className={`h-4 w-4 ${getConfidenceColor(analysis.threshold_detection_confidence)}`} />
          <div className="text-sm">
            <div className="font-medium">Confianza de Detección</div>
            <div className="text-gray-600 text-xs">
              {analysis.threshold_detection_confidence >= 0.8 ? 
                "Alta confianza - Umbrales detectados con precisión" :
                analysis.threshold_detection_confidence >= 0.6 ?
                "Confianza moderada - Considere test específico" :
                "Baja confianza - Datos insuficientes para detección precisa"
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}