import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Bike,
  Ruler,
  Settings
} from 'lucide-react';
import { AnthropometricProfile } from '@/types/profile';
import { 
  BikeFitting, 
  FittingCalculations, 
  FITTING_FORMULAS, 
  DISCIPLINE_GEOMETRY_TARGETS,
  FittingRecommendation
} from '@/types/fitting';

interface BikeFittingCalculatorProps {
  profile: AnthropometricProfile;
  onFittingCalculated: (fitting: BikeFitting) => void;
}

export default function BikeFittingCalculator({ profile, onFittingCalculated }: BikeFittingCalculatorProps) {
  const calculations = useMemo(() => {
    return calculateBikeFitting(profile);
  }, [profile]);

  React.useEffect(() => {
    onFittingCalculated(calculations.calculated_fitting);
  }, [calculations, onFittingCalculated]);

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return 'Alta Confianza';
    if (score >= 60) return 'Confianza Media';
    return 'Baja Confianza - Requiere Ajuste Profesional';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            Bike Fitting Calculado
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={getConfidenceColor(calculations.confidence_score)}>
                {getConfidenceLabel(calculations.confidence_score)}
              </Badge>
              <Badge variant="secondary">
                Disciplina: {profile.discipline?.toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Confianza del Cálculo</div>
              <div className="flex items-center gap-2">
                <Progress value={calculations.confidence_score} className="w-20 h-2" />
                <span className="text-sm font-medium">{calculations.confidence_score}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Warnings */}
      {calculations.warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Advertencias:</div>
            <ul className="list-disc list-inside space-y-1">
              {calculations.warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Measurements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Core Position */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Posición Core
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-xs text-gray-600 mb-1">Stack Objetivo</div>
                <div className="text-lg font-bold text-green-700">
                  {calculations.calculated_fitting.stack_objetivo} mm
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-xs text-gray-600 mb-1">Reach Objetivo</div>
                <div className="text-lg font-bold text-blue-700">
                  {calculations.calculated_fitting.reach_objetivo} mm
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Altura Sillín:</span>
                <span className="font-medium">{calculations.calculated_fitting.saddle_height_mm} mm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Setback Sillín:</span>
                <span className="font-medium">{calculations.calculated_fitting.saddle_setback_mm} mm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ángulo Sillín:</span>
                <span className="font-medium">{calculations.calculated_fitting.saddle_angle_deg}°</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Handlebar Setup */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Configuración Manillar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ancho Manillar:</span>
                <span className="font-medium">{calculations.calculated_fitting.handlebar_width_mm} mm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Reach Manillar:</span>
                <span className="font-medium">{calculations.calculated_fitting.handlebar_reach_mm} mm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Drop Manillar:</span>
                <span className="font-medium">{calculations.calculated_fitting.handlebar_drop_mm} mm</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Largo Potencia:</span>
                <span className="font-medium">{calculations.calculated_fitting.stem_length_mm} mm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ángulo Potencia:</span>
                <span className="font-medium">{calculations.calculated_fitting.stem_angle_deg}°</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Espaciadores:</span>
                <span className="font-medium">{calculations.calculated_fitting.spacers_mm} mm</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Components */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bike className="h-5 w-5 text-orange-600" />
              Componentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Largo Bielas:</span>
                <span className="font-medium">{calculations.calculated_fitting.crank_length_mm} mm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Posición Calas:</span>
                <span className="font-medium">{calculations.calculated_fitting.cleat_position_mm} mm</span>
              </div>
            </div>
            <Separator />
            <div className="bg-orange-50 p-3 rounded">
              <div className="text-xs font-medium text-orange-800 mb-1">
                Fórmula Usada
              </div>
              <div className="text-xs text-orange-700">
                {calculations.saddle_height_formula.toUpperCase()} para altura sillín
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ratios and Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-indigo-600" />
            Análisis Antropométrico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Ratio Torso/Entrepierna</div>
              <div className="text-xl font-bold text-indigo-700">
                {(calculations.torso_inseam_ratio * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {calculations.torso_inseam_ratio > 0.52 ? 'Torso Largo' : 'Piernas Largas'}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Stack Estimado</div>
              <div className="text-xl font-bold text-green-700">
                {calculations.estimated_stack} mm
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Reach Estimado</div>
              <div className="text-xl font-bold text-blue-700">
                {calculations.estimated_reach} mm
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Flexibilidad</div>
              <div className="text-lg font-bold text-purple-700 capitalize">
                {profile.flexibility_score}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {profile.pelvic_rotation}° rotación
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones de Ajuste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calculations.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="mt-1">
                  {rec.priority === 'high' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  {rec.priority === 'medium' && <CheckCircle className="h-5 w-5 text-yellow-500" />}
                  {rec.priority === 'low' && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{rec.title}</span>
                    <Badge 
                      variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {rec.priority}
                    </Badge>
                    {rec.category && (
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  {rec.suggested_change && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      💡 {rec.suggested_change}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Core calculation function
function calculateBikeFitting(profile: AnthropometricProfile): FittingCalculations {
  const {
    height_cm,
    inseam_cm,
    torso_cm,
    arm_length_cm,
    shoulder_width_cm,
    weight_kg,
    flexibility_score,
    pelvic_rotation,
    riding_experience,
    discipline
  } = profile;

  // Calculate ratios
  const torso_inseam_ratio = torso_cm / inseam_cm;
  
  // Choose saddle height formula based on experience and discipline
  let saddle_height_formula: 'lemond' | 'hamley' | 'holmes' = 'lemond';
  if (riding_experience === 'advanced' && discipline === 'crono') {
    saddle_height_formula = 'holmes';
  } else if (riding_experience === 'intermediate') {
    saddle_height_formula = 'hamley';
  }
  
  const saddle_height = FITTING_FORMULAS.saddle_height[saddle_height_formula](inseam_cm);
  
  // Calculate reach and stack
  const estimated_reach = FITTING_FORMULAS.reach_estimate(torso_cm, arm_length_cm, discipline, riding_experience);
  const estimated_stack = FITTING_FORMULAS.stack_estimate(torso_cm, flexibility_score, discipline);
  
  // Component calculations
  const crank_length = FITTING_FORMULAS.crank_length.standard(inseam_cm);
  const handlebar_width = FITTING_FORMULAS.handlebar_width(shoulder_width_cm);
  
  // Geometry adjustments based on discipline
  const disciplineTarget = DISCIPLINE_GEOMETRY_TARGETS[discipline];
  const final_reach = Math.round(estimated_reach * disciplineTarget.reach_modifier);
  const final_stack = Math.round(estimated_stack * disciplineTarget.stack_modifier);
  
  // Calculate other measurements
  const saddle_setback = Math.round(inseam_cm * 0.25 * disciplineTarget.saddle_setback_modifier);
  const handlebar_drop = Math.round(final_stack * 0.15);
  const stem_length = Math.round(final_reach * 0.12);
  
  // Generate recommendations
  const recommendations = generateRecommendations(profile, {
    torso_inseam_ratio,
    saddle_height,
    estimated_reach: final_reach,
    estimated_stack: final_stack
  });
  
  // Calculate confidence score
  const confidence_score = calculateConfidenceScore(profile, recommendations);
  
  // Generate warnings
  const warnings = generateWarnings(profile, recommendations);
  
  const calculated_fitting: BikeFitting = {
    user_id: '',
    fitting_name: `${discipline} - ${new Date().toLocaleDateString()}`,
    stack_objetivo: final_stack,
    reach_objetivo: final_reach,
    saddle_height_mm: saddle_height,
    saddle_setback_mm: saddle_setback,
    saddle_angle_deg: flexibility_score === 'low' ? 1 : 0,
    handlebar_reach_mm: final_reach,
    handlebar_drop_mm: handlebar_drop,
    crank_length_mm: crank_length,
    cleat_position_mm: profile.foot_length_cm ? profile.foot_length_cm * 4.5 : 100,
    stem_length_mm: stem_length,
    stem_angle_deg: flexibility_score === 'low' ? 17 : flexibility_score === 'high' ? -6 : 6,
    spacers_mm: flexibility_score === 'low' ? 30 : flexibility_score === 'high' ? 5 : 15,
    handlebar_width_mm: handlebar_width,
    fitting_type: 'basic',
    fitted_by: 'auto'
  };
  
  return {
    height_cm,
    inseam_cm,
    torso_cm,
    arm_length_cm,
    shoulder_width_cm,
    weight_kg,
    flexibility_score,
    pelvic_rotation: parseInt(pelvic_rotation),
    riding_experience,
    discipline,
    calculated_fitting,
    torso_inseam_ratio,
    estimated_stack: final_stack,
    estimated_reach: final_reach,
    saddle_height_formula,
    recommendations,
    warnings,
    confidence_score
  };
}

function generateRecommendations(
  profile: AnthropometricProfile, 
  calcs: { torso_inseam_ratio: number; saddle_height: number; estimated_reach: number; estimated_stack: number }
): FittingRecommendation[] {
  const recommendations: FittingRecommendation[] = [];
  
  // Flexibility-based recommendations
  if (profile.flexibility_score === 'low') {
    recommendations.push({
      category: 'position',
      title: 'Posición Más Erguida Recomendada',
      description: 'Tu flexibilidad limitada requiere una posición menos agresiva. Considera más espaciadores y potencia con ángulo positivo.',
      priority: 'high',
      suggested_change: 'Agregar 10-20mm de espaciadores adicionales'
    });
  }
  
  // Experience-based recommendations  
  if (profile.riding_experience === 'beginner') {
    recommendations.push({
      category: 'comfort',
      title: 'Enfoque en Comodidad',
      description: 'Como principiante, prioriza comodidad sobre aerodinámica. Posición más conservadora.',
      priority: 'medium',
      suggested_change: 'Potencia más corta y ángulo más positivo inicialmente'
    });
  }
  
  // Ratio analysis
  if (calcs.torso_inseam_ratio > 0.55) {
    recommendations.push({
      category: 'component',
      title: 'Torso Largo Detectado',
      description: 'Tu ratio torso/entrepierna indica torso largo. Necesitarás mayor reach efectivo.',
      priority: 'medium',
      suggested_change: 'Considera potencia más larga o cuadro con mayor reach'
    });
  }
  
  return recommendations;
}

function generateWarnings(profile: AnthropometricProfile, recommendations: FittingRecommendation[]): string[] {
  const warnings: string[] = [];
  
  if (!profile.height_cm || !profile.inseam_cm) {
    warnings.push('Medidas básicas incompletas - resultados pueden ser inexactos');
  }
  
  if (profile.flexibility_score === 'low' && profile.discipline === 'crono') {
    warnings.push('Flexibilidad baja con disciplina aerodinámica - requiere ajuste profesional');
  }
  
  const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
  if (highPriorityRecs.length > 2) {
    warnings.push('Múltiples ajustes de alta prioridad - consulta con especialista');
  }
  
  return warnings;
}

function calculateConfidenceScore(profile: AnthropometricProfile, recommendations: FittingRecommendation[]): number {
  let score = 100;
  
  // Penalize missing measurements
  if (!profile.height_cm) score -= 20;
  if (!profile.inseam_cm) score -= 30;
  if (!profile.torso_cm) score -= 15;
  if (!profile.arm_length_cm) score -= 15;
  
  // Penalize challenging combinations
  if (profile.flexibility_score === 'low' && profile.discipline === 'crono') score -= 20;
  if (profile.riding_experience === 'beginner' && profile.discipline === 'crono') score -= 15;
  
  // Penalize high-priority recommendations
  const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
  score -= highPriorityRecs.length * 10;
  
  return Math.max(0, Math.min(100, score));
}