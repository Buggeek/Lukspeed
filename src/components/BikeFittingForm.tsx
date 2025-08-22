import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Calculator, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Bike,
  Target,
  Ruler
} from 'lucide-react';
import { BikeFitting, FittingType } from '@/types/fitting';
import { AnthropometricProfile } from '@/types/profile';
import useBikeFitting from '@/hooks/useBikeFitting';

interface BikeFittingFormProps {
  fitting?: BikeFitting;
  profile: AnthropometricProfile;
  onSave?: (fitting: BikeFitting) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'view';
}

export default function BikeFittingForm({ 
  fitting, 
  profile, 
  onSave, 
  onCancel, 
  mode = 'create' 
}: BikeFittingFormProps) {
  const { 
    calculateFitting, 
    validateFitting, 
    saveFitting, 
    updateFitting, 
    loading 
  } = useBikeFitting();

  const [formData, setFormData] = useState<Partial<BikeFitting>>({
    fitting_name: '',
    fitting_type: 'basic',
    fitted_by: 'Usuario',
    notes: '',
    ...fitting
  });

  const [validation, setValidation] = useState<{
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState('position');

  useEffect(() => {
    if (formData.stack_objetivo && formData.reach_objetivo) {
      const validationResult = validateFitting(formData as BikeFitting, profile);
      setValidation(validationResult);
    }
  }, [formData, profile, validateFitting]);

  const handleInputChange = (field: keyof BikeFitting, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field.includes('_mm') ? parseFloat(value) || 0 : value
    }));
  };

  const handleAutoCalculate = (method: 'conservative' | 'standard' | 'aggressive' = 'standard') => {
    const calculated = calculateFitting(profile, method);
    if (calculated) {
      setFormData(prev => ({
        ...prev,
        ...calculated,
        fitting_name: prev.fitting_name || calculated.fitting_name,
        notes: `${prev.notes ? prev.notes + '\n\n' : ''}Auto-calculado con método ${method}`
      }));
    }
  };

  const handleSave = async () => {
    try {
      const fittingToSave = {
        ...formData,
        fitting_date: new Date().toISOString()
      } as BikeFitting;

      let result;
      if (mode === 'edit' && fitting?.id) {
        result = await updateFitting(fitting.id, fittingToSave);
      } else {
        result = await saveFitting(fittingToSave);
      }

      if (result && onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('Error saving fitting:', error);
    }
  };

  const renderPositionTab = () => (
    <div className="space-y-6">
      {/* Core Position Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Posición Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stack_objetivo">Stack Objetivo (mm)</Label>
              <Input
                id="stack_objetivo"
                type="number"
                value={formData.stack_objetivo || ''}
                onChange={(e) => handleInputChange('stack_objetivo', e.target.value)}
                placeholder="ej. 550"
                disabled={mode === 'view'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Altura vertical desde eje pedalier al stack del cuadro
              </p>
            </div>

            <div>
              <Label htmlFor="reach_objetivo">Reach Objetivo (mm)</Label>
              <Input
                id="reach_objetivo"
                type="number"
                value={formData.reach_objetivo || ''}
                onChange={(e) => handleInputChange('reach_objetivo', e.target.value)}
                placeholder="ej. 385"
                disabled={mode === 'view'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Distancia horizontal efectiva al manillar
              </p>
            </div>

            <div>
              <Label htmlFor="saddle_height_mm">Altura Sillín (mm)</Label>
              <Input
                id="saddle_height_mm"
                type="number"
                value={formData.saddle_height_mm || ''}
                onChange={(e) => handleInputChange('saddle_height_mm', e.target.value)}
                placeholder="ej. 730"
                disabled={mode === 'view'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Desde eje pedalier al centro del sillín
              </p>
            </div>

            <div>
              <Label htmlFor="saddle_setback_mm">Setback Sillín (mm)</Label>
              <Input
                id="saddle_setback_mm"
                type="number"
                value={formData.saddle_setback_mm || ''}
                onChange={(e) => handleInputChange('saddle_setback_mm', e.target.value)}
                placeholder="ej. 65"
                disabled={mode === 'view'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Distancia hacia atrás desde eje pedalier
              </p>
            </div>

            <div>
              <Label htmlFor="saddle_angle_deg">Ángulo Sillín (°)</Label>
              <Input
                id="saddle_angle_deg"
                type="number"
                step="0.5"
                value={formData.saddle_angle_deg || ''}
                onChange={(e) => handleInputChange('saddle_angle_deg', e.target.value)}
                placeholder="ej. 0"
                disabled={mode === 'view'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Inclinación del sillín (positivo = nariz arriba)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Handlebar Position */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Posición Manillar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="handlebar_reach_mm">Reach Manillar (mm)</Label>
              <Input
                id="handlebar_reach_mm"
                type="number"
                value={formData.handlebar_reach_mm || ''}
                onChange={(e) => handleInputChange('handlebar_reach_mm', e.target.value)}
                placeholder="ej. 385"
                disabled={mode === 'view'}
              />
            </div>

            <div>
              <Label htmlFor="handlebar_drop_mm">Drop Manillar (mm)</Label>
              <Input
                id="handlebar_drop_mm"
                type="number"
                value={formData.handlebar_drop_mm || ''}
                onChange={(e) => handleInputChange('handlebar_drop_mm', e.target.value)}
                placeholder="ej. 65"
                disabled={mode === 'view'}
              />
            </div>

            <div>
              <Label htmlFor="handlebar_width_mm">Ancho Manillar (mm)</Label>
              <Input
                id="handlebar_width_mm"
                type="number"
                value={formData.handlebar_width_mm || ''}
                onChange={(e) => handleInputChange('handlebar_width_mm', e.target.value)}
                placeholder="ej. 420"
                disabled={mode === 'view'}
              />
            </div>

            <div>
              <Label htmlFor="stem_length_mm">Largo Potencia (mm)</Label>
              <Input
                id="stem_length_mm"
                type="number"
                value={formData.stem_length_mm || ''}
                onChange={(e) => handleInputChange('stem_length_mm', e.target.value)}
                placeholder="ej. 100"
                disabled={mode === 'view'}
              />
            </div>

            <div>
              <Label htmlFor="stem_angle_deg">Ángulo Potencia (°)</Label>
              <Input
                id="stem_angle_deg"
                type="number"
                value={formData.stem_angle_deg || ''}
                onChange={(e) => handleInputChange('stem_angle_deg', e.target.value)}
                placeholder="ej. 6"
                disabled={mode === 'view'}
              />
            </div>

            <div>
              <Label htmlFor="spacers_mm">Espaciadores (mm)</Label>
              <Input
                id="spacers_mm"
                type="number"
                value={formData.spacers_mm || ''}
                onChange={(e) => handleInputChange('spacers_mm', e.target.value)}
                placeholder="ej. 15"
                disabled={mode === 'view'}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComponentsTab = () => (
    <div className="space-y-6">
      {/* Drivetrain Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-green-600" />
            Componentes de Transmisión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crank_length_mm">Largo Bielas (mm)</Label>
              <Input
                id="crank_length_mm"
                type="number"
                step="2.5"
                value={formData.crank_length_mm || ''}
                onChange={(e) => handleInputChange('crank_length_mm', e.target.value)}
                placeholder="ej. 172.5"
                disabled={mode === 'view'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Largo de biela según entrepierna y disciplina
              </p>
            </div>

            <div>
              <Label htmlFor="cleat_position_mm">Posición Calas (mm)</Label>
              <Input
                id="cleat_position_mm"
                type="number"
                value={formData.cleat_position_mm || ''}
                onChange={(e) => handleInputChange('cleat_position_mm', e.target.value)}
                placeholder="ej. 15"
                disabled={mode === 'view'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Distancia desde talón a eje del pedal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMetadataTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Fitting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fitting_name">Nombre del Fitting</Label>
              <Input
                id="fitting_name"
                value={formData.fitting_name || ''}
                onChange={(e) => handleInputChange('fitting_name', e.target.value)}
                placeholder="ej. Fitting Inicial 2024"
                disabled={mode === 'view'}
              />
            </div>

            <div>
              <Label htmlFor="fitting_type">Tipo de Fitting</Label>
              <Select
                value={formData.fitting_type || 'basic'}
                onValueChange={(value: FittingType) => handleInputChange('fitting_type', value)}
                disabled={mode === 'view'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                  <SelectItem value="professional">Profesional</SelectItem>
                  <SelectItem value="biomechanical">Biomecánico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fitted_by">Realizado por</Label>
              <Input
                id="fitted_by"
                value={formData.fitted_by || ''}
                onChange={(e) => handleInputChange('fitted_by', e.target.value)}
                placeholder="ej. Bike Fitter Profesional"
                disabled={mode === 'view'}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                rows={4}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Observaciones, ajustes especiales, recomendaciones..."
                disabled={mode === 'view'}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-6 w-6 text-blue-600" />
                {mode === 'create' ? 'Nuevo Bike Fitting' : 
                 mode === 'edit' ? 'Editar Fitting' : 'Ver Fitting'}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {mode === 'view' 
                  ? 'Visualización de medidas de bike fitting'
                  : 'Configure las medidas de bike fitting basadas en datos antropométricos'
                }
              </p>
            </div>
            
            {mode !== 'view' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAutoCalculate('conservative')}
                  disabled={loading}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Conservador
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAutoCalculate('standard')}
                  disabled={loading}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Estándar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAutoCalculate('aggressive')}
                  disabled={loading}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Agresivo
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Validation Alerts */}
      {validation && (
        <div className="space-y-2">
          {validation.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Advertencias:</strong>
                <ul className="mt-1 list-disc list-inside">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {validation.recommendations.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <strong>Recomendaciones:</strong>
                <ul className="mt-1 list-disc list-inside">
                  {validation.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-blue-800">{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Main Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="position">Posición</TabsTrigger>
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="metadata">Información</TabsTrigger>
        </TabsList>

        <TabsContent value="position" className="mt-6">
          {renderPositionTab()}
        </TabsContent>

        <TabsContent value="components" className="mt-6">
          {renderComponentsTab()}
        </TabsContent>

        <TabsContent value="metadata" className="mt-6">
          {renderMetadataTab()}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      {mode !== 'view' && (
        <div className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : mode === 'edit' ? 'Actualizar' : 'Guardar Fitting'}
          </Button>
        </div>
      )}
    </div>
  );
}