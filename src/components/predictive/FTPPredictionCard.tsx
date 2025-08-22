import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3
} from 'lucide-react';
import type { FTPPrediction } from '@/utils/predictive-models';

interface FTPPredictionCardProps {
  prediction: FTPPrediction;
  className?: string;
}

export function FTPPredictionCard({ prediction, className }: FTPPredictionCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-50 text-green-700 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getPlateauRiskColor = (risk: number) => {
    if (risk <= 0.3) return 'text-green-600';
    if (risk <= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const powerIncrease = prediction.predicted_ftp - prediction.current_ftp;
  const percentIncrease = (powerIncrease / prediction.current_ftp) * 100;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Predicción de FTP
          </CardTitle>
          <Badge variant="secondary" className={getConfidenceColor(prediction.confidence)}>
            Confianza: {(prediction.confidence * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Prediction Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {prediction.current_ftp}W
              </div>
              <div className="text-sm text-gray-600">FTP Actual</div>
            </div>
            
            <div className="flex items-center">
              <TrendingUp className={`h-6 w-6 ${powerIncrease > 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">
                {prediction.predicted_ftp}W
              </div>
              <div className="text-sm text-gray-600">FTP Predicho</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge 
              variant="secondary" 
              className={powerIncrease > 0 ? 
                'bg-green-50 text-green-700 border-green-200' : 
                'bg-red-50 text-red-700 border-red-200'
              }
            >
              {powerIncrease > 0 ? '+' : ''}{powerIncrease}W ({percentIncrease > 0 ? '+' : ''}{percentIncrease.toFixed(1)}%)
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            En {prediction.prediction_horizon_days} días
          </div>
        </div>

        {/* Progress and Trends */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tasa de Mejora</span>
              <span className="text-sm font-bold text-gray-900">
                {prediction.improvement_rate > 0 ? '+' : ''}{prediction.improvement_rate.toFixed(1)}W/semana
              </span>
            </div>
            <Progress 
              value={Math.min(100, Math.max(0, (prediction.improvement_rate + 5) * 10))} 
              className="h-2"
            />
            <div className="text-xs text-gray-500 mt-1">
              {prediction.improvement_rate > 2 ? 'Progreso rápido' :
               prediction.improvement_rate > 0.5 ? 'Progreso estable' :
               prediction.improvement_rate > -0.5 ? 'Mantenimiento' : 'Declive'}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Riesgo de Estancamiento</span>
              <span className={`text-sm font-bold ${getPlateauRiskColor(prediction.plateau_risk)}`}>
                {(prediction.plateau_risk * 100).toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={prediction.plateau_risk * 100} 
              className="h-2"
            />
            <div className="text-xs text-gray-500 mt-1">
              {prediction.plateau_risk <= 0.3 ? 'Riesgo bajo - continúa progresando' :
               prediction.plateau_risk <= 0.6 ? 'Riesgo moderado - varía el entrenamiento' :
               'Riesgo alto - necesita cambio de enfoque'}
            </div>
          </div>
        </div>

        {/* Test Recommendation */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-blue-900 mb-1">
                Test FTP Recomendado
              </div>
              <div className="text-sm text-blue-800 mb-2">
                Fecha sugerida: {new Date(prediction.recommended_test_date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-xs text-blue-700">
                Basado en tu tasa de mejora actual y patrones de entrenamiento
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Analysis */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Análisis de Confianza</h4>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {prediction.confidence >= 0.8 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : prediction.confidence >= 0.6 ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {prediction.confidence >= 0.8 ? 'Alta Confianza' :
                   prediction.confidence >= 0.6 ? 'Confianza Moderada' : 'Baja Confianza'}
                </div>
                <div className="text-xs text-gray-600">
                  {prediction.confidence >= 0.8 ? 
                    'Predicción muy fiable basada en datos consistentes' :
                   prediction.confidence >= 0.6 ? 
                    'Predicción razonable, considera factores adicionales' :
                    'Predicción incierta, necesita más datos de entrenamiento'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-green-900 mb-1">
                Recomendaciones de Entrenamiento
              </div>
              <div className="text-sm text-green-800 space-y-1">
                {prediction.improvement_rate > 1 ? (
                  <div>• Continúa el programa actual - excelente progreso</div>
                ) : prediction.improvement_rate > 0 ? (
                  <div>• Incrementa gradualmente la intensidad de intervalos</div>
                ) : (
                  <div>• Considera cambiar el enfoque de entrenamiento</div>
                )}
                
                {prediction.plateau_risk > 0.6 && (
                  <div>• Añade variedad: diferentes duraciones e intensidades</div>
                )}
                
                {prediction.confidence < 0.6 && (
                  <div>• Mantén consistencia para mejorar predicciones futuras</div>
                )}
                
                <div>• Realiza test FTP el {new Date(prediction.recommended_test_date).toLocaleDateString('es-ES')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="text-xs text-gray-600 pt-4 border-t space-y-1">
          <div>Modelo predictivo basado en análisis de potencia normalizada en esfuerzos umbral</div>
          <div>Horizonte de predicción: {prediction.prediction_horizon_days} días</div>
          <div>Algoritmo: Regresión lineal con corrección por fatiga y progreso histórico</div>
        </div>
      </CardContent>
    </Card>
  );
}