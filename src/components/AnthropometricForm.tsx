import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MeasurementGuide, MEASUREMENT_GUIDES } from './MeasurementGuide';
import { 
  AnthropometricProfile, 
  MEASUREMENT_RANGES, 
  FlexibilityScore, 
  RidingExperience, 
  CyclingDiscipline,
  DISCIPLINE_DESCRIPTIONS 
} from '@/types/profile';
import { 
  User, 
  Ruler, 
  Activity, 
  ChevronDown, 
  ChevronRight, 
  Calculator,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface AnthropometricFormProps {
  profile: Partial<AnthropometricProfile>;
  onProfileChange: (profile: Partial<AnthropometricProfile>) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

export default function AnthropometricForm({ 
  profile, 
  onProfileChange, 
  onNext, 
  onPrevious 
}: AnthropometricFormProps) {
  const [currentMeasurement, setCurrentMeasurement] = useState<string>('height_cm');
  const [showGuide, setShowGuide] = useState<{ [key: string]: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const measurements = [
    'height_cm', 'inseam_cm', 'torso_cm', 'arm_length_cm', 
    'shoulder_width_cm', 'foot_length_cm', 'weight_kg'
  ];

  const handleMeasurementChange = (field: keyof AnthropometricProfile, value: string | number) => {
    const updatedProfile = { ...profile, [field]: value };
    onProfileChange(updatedProfile);
    
    // Auto-calculate derived measurements if possible
    if (field === 'height_cm' || field === 'inseam_cm') {
      calculateDerivedMeasurements(updatedProfile);
    }
    
    validateMeasurement(field, value);
  };

  const calculateDerivedMeasurements = (updatedProfile: Partial<AnthropometricProfile>) => {
    const { height_cm, inseam_cm } = updatedProfile;
    
    if (height_cm && inseam_cm) {
      // Auto-suggest torso length if not provided
      if (!updatedProfile.torso_cm) {
        const estimatedTorso = Math.round((height_cm - inseam_cm) * 0.6);
        onProfileChange({ ...updatedProfile, torso_cm: estimatedTorso });
      }
      
      // Auto-suggest arm length if not provided
      if (!updatedProfile.arm_length_cm) {
        const estimatedArm = Math.round(height_cm * 0.38);
        onProfileChange({ ...updatedProfile, arm_length_cm: estimatedArm });
      }
    }
  };

  const validateMeasurement = (field: keyof AnthropometricProfile, value: string | number) => {
    const errors: string[] = [];
    
    if (field in MEASUREMENT_RANGES && typeof value === 'number') {
      const range = MEASUREMENT_RANGES[field as keyof typeof MEASUREMENT_RANGES];
      if (value < range.min || value > range.max) {
        errors.push(`${field}: Valor fuera del rango típico (${range.min}-${range.max})`);
      }
    }
    
    setValidationErrors(errors);
  };

  const getCompletionPercentage = () => {
    const requiredFields = [...measurements, 'flexibility_score', 'riding_experience', 'discipline'];
    const completedFields = requiredFields.filter(field => profile[field as keyof AnthropometricProfile]);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const canProceed = () => {
    return measurements.every(field => profile[field as keyof AnthropometricProfile]) &&
           profile.flexibility_score &&
           profile.riding_experience &&
           profile.discipline &&
           validationErrors.length === 0;
  };

  const toggleGuide = (measurement: string) => {
    setShowGuide(prev => ({ ...prev, [measurement]: !prev[measurement] }));
  };

  const renderMeasurementInput = (field: keyof AnthropometricProfile) => {
    const guide = MEASUREMENT_GUIDES[field as keyof typeof MEASUREMENT_GUIDES];
    if (!guide) return null;

    const value = profile[field] as number;
    const range = MEASUREMENT_RANGES[field as keyof typeof MEASUREMENT_RANGES];
    const isOutOfRange = value && range && (value < range.min || value > range.max);

    return (
      <Card key={field} className={`mb-4 ${currentMeasurement === field ? 'border-blue-500 shadow-md' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-blue-600" />
              <Label className="text-lg font-medium">{guide.measurement}</Label>
              <Badge variant="secondary">{guide.unit}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {value && !isOutOfRange && <CheckCircle className="h-5 w-5 text-green-500" />}
              {isOutOfRange && <AlertTriangle className="h-5 w-5 text-red-500" />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleGuide(field)}
                className="p-1"
              >
                {showGuide[field] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">{guide.description}</p>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => handleMeasurementChange(field, parseFloat(e.target.value) || 0)}
              placeholder={`Ingresa tu ${guide.measurement.toLowerCase()}`}
              className={`flex-1 ${isOutOfRange ? 'border-red-500' : ''}`}
              onFocus={() => setCurrentMeasurement(field)}
            />
            <span className="text-sm font-medium min-w-[30px]">{guide.unit}</span>
          </div>

          {range && (
            <div className="text-xs text-gray-500 mb-2">
              Rango típico: {range.min} - {range.max} {guide.unit}
            </div>
          )}

          <Collapsible open={showGuide[field]}>
            <CollapsibleContent>
              <MeasurementGuide
                measurement={guide.measurement}
                value={value}
                unit={guide.unit}
                description={guide.description}
                instructions={guide.instructions}
                tips={guide.tips}
                range={range || { min: 0, max: 1000 }}
              />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              Medidas Antropométricas
            </CardTitle>
            <Badge variant="outline">
              {getCompletionPercentage()}% Completado
            </Badge>
          </div>
          <Progress value={getCompletionPercentage()} className="h-2" />
        </CardHeader>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Measurements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Medidas Corporales</h3>
          {measurements.map(field => renderMeasurementInput(field as keyof AnthropometricProfile))}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Características Ciclistas</h3>
          
          {/* Flexibility Score */}
          <Card className="mb-4">
            <CardHeader>
              <Label className="text-lg font-medium">Flexibilidad</Label>
              <p className="text-sm text-gray-600">
                Evalúa tu flexibilidad general (especialmente cadera y espalda baja)
              </p>
            </CardHeader>
            <CardContent>
              <Select
                value={profile.flexibility_score}
                onValueChange={(value: FlexibilityScore) => handleMeasurementChange('flexibility_score', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu nivel de flexibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja - Dificultad para tocarse los pies</SelectItem>
                  <SelectItem value="medium">Media - Flexibilidad promedio</SelectItem>
                  <SelectItem value="high">Alta - Muy flexible, yoga/pilates</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Pelvic Rotation */}
          <Card className="mb-4">
            <CardHeader>
              <Label className="text-lg font-medium">Rotación Pélvica</Label>
              <p className="text-sm text-gray-600">
                Capacidad de rotar la pelvis hacia adelante (rango: 0-45°)
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={[parseInt(profile.pelvic_rotation) || 20]}
                  onValueChange={([value]) => handleMeasurementChange('pelvic_rotation', value.toString())}
                  max={45}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Rígida (0°)</span>
                  <span className="font-medium">{profile.pelvic_rotation || 20}°</span>
                  <span>Muy flexible (45°)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Riding Experience */}
          <Card className="mb-4">
            <CardHeader>
              <Label className="text-lg font-medium">Experiencia Ciclista</Label>
            </CardHeader>
            <CardContent>
              <Select
                value={profile.riding_experience}
                onValueChange={(value: RidingExperience) => handleMeasurementChange('riding_experience', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu nivel de experiencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">
                    Principiante - Menos de 1 año o posición cómoda
                  </SelectItem>
                  <SelectItem value="intermediate">
                    Intermedio - 1-3 años, algunas salidas largas
                  </SelectItem>
                  <SelectItem value="advanced">
                    Avanzado - +3 años, competencias, posición agresiva
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Discipline */}
          <Card className="mb-4">
            <CardHeader>
              <Label className="text-lg font-medium">Disciplina Principal</Label>
            </CardHeader>
            <CardContent>
              <Select
                value={profile.discipline}
                onValueChange={(value: CyclingDiscipline) => handleMeasurementChange('discipline', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu disciplina principal" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DISCIPLINE_DESCRIPTIONS).map(([key, desc]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{desc.name}</div>
                        <div className="text-xs text-gray-500">{desc.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {profile.discipline && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">
                    {DISCIPLINE_DESCRIPTIONS[profile.discipline].name}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    {DISCIPLINE_DESCRIPTIONS[profile.discipline].geometry}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calculated Ratios */}
      {profile.height_cm && profile.inseam_cm && profile.torso_cm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Ratios Calculados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Torso/Entrepierna</div>
                <div className="text-lg font-bold">
                  {((profile.torso_cm / profile.inseam_cm) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Altura Sillín Est.</div>
                <div className="text-lg font-bold">
                  {Math.round(profile.inseam_cm * 0.883)} mm
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Reach Estimado</div>
                <div className="text-lg font-bold">
                  {Math.round((profile.torso_cm + (profile.arm_length_cm || 0)) * 0.8)} mm
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Ancho Manillar</div>
                <div className="text-lg font-bold">
                  {profile.shoulder_width_cm || 0} cm
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {onPrevious && (
          <Button variant="outline" onClick={onPrevious}>
            Anterior
          </Button>
        )}
        <Button 
          onClick={onNext}
          disabled={!canProceed()}
          className="ml-auto"
        >
          Continuar al Bike Fitting
        </Button>
      </div>
    </div>
  );
}