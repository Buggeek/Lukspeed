import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bike, 
  Ruler, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { BikeFitting } from '@/types/fitting';
import { AnthropometricProfile } from '@/types/profile';

interface FittingVisualizationProps {
  fitting: BikeFitting;
  profile?: AnthropometricProfile;
  previousFitting?: BikeFitting;
}

export default function FittingVisualization({ 
  fitting, 
  profile, 
  previousFitting 
}: FittingVisualizationProps) {
  
  // Calculate fitting ratios and metrics
  const metrics = {
    saddleHeightToInseam: profile ? ((fitting.saddle_height_mm || 0) / (profile.inseam_cm * 10)) : null,
    reachToTorso: profile ? ((fitting.reach_objetivo || 0) / (profile.torso_cm * 10)) : null,
    stackToHeight: profile ? ((fitting.stack_objetivo || 0) / (profile.height_cm * 10)) : null,
    crankToInseam: profile ? ((fitting.crank_length_mm || 0) / (profile.inseam_cm * 10)) : null
  };

  // Determine fitting aggressiveness
  const getPositionAggressiveness = () => {
    if (!fitting.stack_objetivo || !fitting.reach_objetivo) return 'unknown';
    
    const stackReachRatio = fitting.stack_objetivo / fitting.reach_objetivo;
    
    if (stackReachRatio > 1.45) return 'comfort';
    if (stackReachRatio > 1.35) return 'endurance';
    if (stackReachRatio > 1.25) return 'performance';
    return 'aggressive';
  };

  const aggressiveness = getPositionAggressiveness();
  const aggressivenessColors = {
    comfort: 'bg-green-100 text-green-800',
    endurance: 'bg-blue-100 text-blue-800',
    performance: 'bg-orange-100 text-orange-800',
    aggressive: 'bg-red-100 text-red-800',
    unknown: 'bg-gray-100 text-gray-800'
  };

  // Compare with previous fitting if available
  const getChangeIcon = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 2) return <Minus className="h-4 w-4 text-gray-500" />;
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getChangeValue = (current: number, previous: number) => {
    const diff = current - previous;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  return (
    <div className="space-y-6">
      {/* Fitting Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bike className="h-6 w-6 text-blue-600" />
              {fitting.fitting_name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={aggressivenessColors[aggressiveness]}>
                {aggressiveness === 'comfort' ? 'Confort' :
                 aggressiveness === 'endurance' ? 'Resistencia' :
                 aggressiveness === 'performance' ? 'Rendimiento' :
                 aggressiveness === 'aggressive' ? 'Agresivo' : 'Desconocido'}
              </Badge>
              <Badge variant="outline">
                {fitting.fitting_type === 'basic' ? 'Básico' :
                 fitting.fitting_type === 'advanced' ? 'Avanzado' :
                 fitting.fitting_type === 'professional' ? 'Profesional' : 'Biomecánico'}
              </Badge>
            </div>
          </div>
          <p className="text-gray-600">
            Realizado por {fitting.fitted_by} • {new Date(fitting.fitting_date || '').toLocaleDateString()}
          </p>
        </CardHeader>
      </Card>

      {/* Core Measurements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stack */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Stack</span>
              {previousFitting?.stack_objetivo && (
                <div className="flex items-center gap-1">
                  {getChangeIcon(fitting.stack_objetivo || 0, previousFitting.stack_objetivo)}
                  <span className="text-xs text-gray-500">
                    {getChangeValue(fitting.stack_objetivo || 0, previousFitting.stack_objetivo)}mm
                  </span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {fitting.stack_objetivo}mm
            </div>
            {metrics.stackToHeight && (
              <div className="text-xs text-gray-500">
                {(metrics.stackToHeight * 100).toFixed(1)}% de altura
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reach */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Reach</span>
              {previousFitting?.reach_objetivo && (
                <div className="flex items-center gap-1">
                  {getChangeIcon(fitting.reach_objetivo || 0, previousFitting.reach_objetivo)}
                  <span className="text-xs text-gray-500">
                    {getChangeValue(fitting.reach_objetivo || 0, previousFitting.reach_objetivo)}mm
                  </span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-green-700 mb-1">
              {fitting.reach_objetivo}mm
            </div>
            {metrics.reachToTorso && (
              <div className="text-xs text-gray-500">
                {(metrics.reachToTorso * 100).toFixed(1)}% de torso
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saddle Height */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Altura Sillín</span>
              {previousFitting?.saddle_height_mm && (
                <div className="flex items-center gap-1">
                  {getChangeIcon(fitting.saddle_height_mm || 0, previousFitting.saddle_height_mm)}
                  <span className="text-xs text-gray-500">
                    {getChangeValue(fitting.saddle_height_mm || 0, previousFitting.saddle_height_mm)}mm
                  </span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {fitting.saddle_height_mm}mm
            </div>
            {metrics.saddleHeightToInseam && (
              <div className="text-xs text-gray-500">
                {(metrics.saddleHeightToInseam * 100).toFixed(1)}% entrepierna
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crank Length */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Bielas</span>
              {previousFitting?.crank_length_mm && (
                <div className="flex items-center gap-1">
                  {getChangeIcon(fitting.crank_length_mm || 0, previousFitting.crank_length_mm)}
                  <span className="text-xs text-gray-500">
                    {getChangeValue(fitting.crank_length_mm || 0, previousFitting.crank_length_mm)}mm
                  </span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-orange-700 mb-1">
              {fitting.crank_length_mm}mm
            </div>
            {metrics.crankToInseam && (
              <div className="text-xs text-gray-500">
                {(metrics.crankToInseam * 100).toFixed(1)}% entrepierna
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Measurements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saddle Position */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Posición del Sillín
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Altura</span>
                <div className="text-right">
                  <span className="font-medium">{fitting.saddle_height_mm}mm</span>
                  {profile && (
                    <div className="text-xs text-gray-500">
                      {((fitting.saddle_height_mm || 0) / profile.inseam_cm).toFixed(3)} × entrepierna
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Setback</span>
                <div className="text-right">
                  <span className="font-medium">{fitting.saddle_setback_mm}mm</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ángulo</span>
                <div className="text-right">
                  <span className="font-medium">{fitting.saddle_angle_deg}°</span>
                  <div className="text-xs text-gray-500">
                    {(fitting.saddle_angle_deg || 0) === 0 ? 'Neutro' :
                     (fitting.saddle_angle_deg || 0) > 0 ? 'Nariz arriba' : 'Nariz abajo'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Handlebar Position */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-green-600" />
              Posición del Manillar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reach</span>
                <div className="text-right">
                  <span className="font-medium">{fitting.handlebar_reach_mm}mm</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Drop</span>
                <div className="text-right">
                  <span className="font-medium">{fitting.handlebar_drop_mm}mm</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ancho</span>
                <div className="text-right">
                  <span className="font-medium">{fitting.handlebar_width_mm}mm</span>
                  {profile && (
                    <div className="text-xs text-gray-500">
                      vs {profile.shoulder_width_cm * 10}mm hombros
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Potencia</span>
                <div className="text-right">
                  <span className="font-medium">{fitting.stem_length_mm}mm</span>
                  <div className="text-xs text-gray-500">{fitting.stem_angle_deg}° ángulo</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Detalles de Componentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Transmisión</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bielas</span>
                  <span className="font-medium">{fitting.crank_length_mm}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Calas</span>
                  <span className="font-medium">{fitting.cleat_position_mm}mm</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Cockpit</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Potencia</span>
                  <span className="font-medium">{fitting.stem_length_mm}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Espaciadores</span>
                  <span className="font-medium">{fitting.spacers_mm}mm</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Geometría</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stack/Reach</span>
                  <span className="font-medium">
                    {fitting.stack_objetivo && fitting.reach_objetivo ? 
                      (fitting.stack_objetivo / fitting.reach_objetivo).toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tipo</span>
                  <span className="font-medium capitalize">{aggressiveness}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      {fitting.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas y Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{fitting.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Estado del Fitting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {metrics.saddleHeightToInseam ? 
                  (Math.abs(metrics.saddleHeightToInseam - 0.885) < 0.01 ? 'Óptimo' : 'Ajustado') : 
                  'N/A'}
              </div>
              <div className="text-sm text-gray-600">Altura Sillín</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {fitting.stack_objetivo && fitting.reach_objetivo ? 'Calculado' : 'Parcial'}
              </div>
              <div className="text-sm text-gray-600">Geometría</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700 mb-1">
                {fitting.fitting_type === 'professional' ? 'Pro' : 'Básico'}
              </div>
              <div className="text-sm text-gray-600">Nivel</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}