import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, TrendingUp, Wind, Gauge, ArrowRight, Plus, 
  Bike, Users, Settings, Calculator
} from 'lucide-react';
import type { PhysicalPowerAnalysis } from '@/services/PhysicalPowerService';

interface AerodynamicComparisonProps {
  currentData?: PhysicalPowerAnalysis | null;
  comparisonData?: PhysicalPowerAnalysis | null;
  onLoadComparison?: (configId: string) => void;
}

export const AerodynamicComparison: React.FC<AerodynamicComparisonProps> = ({
  currentData,
  comparisonData,
  onLoadComparison
}) => {
  const [selectedConfig, setSelectedConfig] = useState<string>('');

  // Mock configurations for demonstration
  const availableConfigs = [
    { id: 'config1', name: 'Bici TT', description: 'Posición aerodinámica' },
    { id: 'config2', name: 'Bici Ruta', description: 'Posición estándar' },
    { id: 'config3', name: 'MTB', description: 'Posición erguida' },
  ];

  if (!currentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Comparación de Configuraciones
          </CardTitle>
          <CardDescription>
            No hay datos actuales para comparar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Settings className="h-8 w-8 mr-2" />
            <span>Necesita datos de análisis físico para comparar configuraciones</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calculateSavings = (current: PhysicalPowerAnalysis, comparison: PhysicalPowerAnalysis) => {
    const cdaDiff = comparison.estimates.CdA_estimated - current.estimates.CdA_estimated;
    const crrDiff = comparison.estimates.Crr_estimated - current.estimates.Crr_estimated;
    
    // Calculate power savings at different speeds
    const speeds = [30, 40, 50]; // km/h
    const airDensity = current.conditions.air_density;
    const mass = current.mass_data.total_mass;
    
    const savings = speeds.map(speed => {
      const speedMs = speed / 3.6;
      const aeroSaving = 0.5 * cdaDiff * airDensity * Math.pow(speedMs, 3);
      const rrSaving = crrDiff * mass * 9.81 * speedMs;
      return {
        speed,
        aeroSaving: -aeroSaving, // Negative diff means savings
        rrSaving: -rrSaving,
        totalSaving: -(aeroSaving + rrSaving)
      };
    });

    return {
      cdaDiff,
      crrDiff,
      savings
    };
  };

  // Mock comparison data if not provided
  const mockComparison: PhysicalPowerAnalysis = {
    activity_id: 'comparison',
    components: {
      power_aero: [],
      power_rr: [],
      power_gravity: [],
      power_total_calculated: [],
      power_total_measured: []
    },
    estimates: {
      CdA_estimated: currentData.estimates.CdA_estimated + 0.015,
      Crr_estimated: currentData.estimates.Crr_estimated + 0.001,
      confidence_score: 0.85,
      segments_used_CdA: 8,
      segments_used_Crr: 12
    },
    conditions: currentData.conditions,
    mass_data: currentData.mass_data,
    validation: currentData.validation,
    timestamp: new Date().toISOString()
  };

  const comparison = comparisonData || mockComparison;
  const savings = calculateSavings(currentData, comparison);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Comparación de Configuraciones
        </CardTitle>
        <CardDescription>
          Analiza diferencias entre configuraciones de bicicleta y posición
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Selector */}
        <div className="flex items-center gap-4">
          <Select value={selectedConfig} onValueChange={setSelectedConfig}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar configuración" />
            </SelectTrigger>
            <SelectContent>
              {availableConfigs.map(config => (
                <SelectItem key={config.id} value={config.id}>
                  <div>
                    <div className="font-medium">{config.name}</div>
                    <div className="text-xs text-muted-foreground">{config.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => onLoadComparison?.(selectedConfig)}
            disabled={!selectedConfig}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Cargar para Comparar
          </Button>
        </div>

        {/* Side-by-side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4" />
              <h4 className="font-medium">Configuración Actual</h4>
              <Badge variant="default">Actual</Badge>
            </div>
            
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm">CdA:</span>
                <span className="font-medium">{currentData.estimates.CdA_estimated.toFixed(4)} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Crr:</span>
                <span className="font-medium">{currentData.estimates.Crr_estimated.toFixed(5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Confianza:</span>
                <span className="font-medium">{(currentData.estimates.confidence_score * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Segmentos CdA:</span>
                <span className="font-medium">{currentData.estimates.segments_used_CdA}</span>
              </div>
            </div>
          </div>

          {/* Comparison Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4" />
              <h4 className="font-medium">Configuración Comparación</h4>
              <Badge variant="secondary">Comparación</Badge>
            </div>
            
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm">CdA:</span>
                <span className="font-medium">{comparison.estimates.CdA_estimated.toFixed(4)} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Crr:</span>
                <span className="font-medium">{comparison.estimates.Crr_estimated.toFixed(5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Confianza:</span>
                <span className="font-medium">{(comparison.estimates.confidence_score * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Segmentos CdA:</span>
                <span className="font-medium">{comparison.estimates.segments_used_CdA}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Differences */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <h4 className="font-medium">Diferencias Calculadas</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {savings.cdaDiff > 0 ? '+' : ''}{savings.cdaDiff.toFixed(4)} m²
              </div>
              <div className="text-sm text-muted-foreground">Diferencia CdA</div>
              <div className="text-xs mt-1">
                {savings.cdaDiff > 0 ? 'Menos aerodinámico' : 'Más aerodinámico'}
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {savings.crrDiff > 0 ? '+' : ''}{savings.crrDiff.toFixed(5)}
              </div>
              <div className="text-sm text-muted-foreground">Diferencia Crr</div>
              <div className="text-xs mt-1">
                {savings.crrDiff > 0 ? 'Más resistencia' : 'Menos resistencia'}
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {savings.savings[1].totalSaving > 0 ? '+' : ''}{savings.savings[1].totalSaving.toFixed(1)}W
              </div>
              <div className="text-sm text-muted-foreground">Ahorro @ 40 km/h</div>
              <div className="text-xs mt-1">
                {savings.savings[1].totalSaving > 0 ? 'Ganancia' : 'Pérdida'} de potencia
              </div>
            </div>
          </div>
        </div>

        {/* Power Savings at Different Speeds */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <h4 className="font-medium">Ahorro de Potencia por Velocidad</h4>
          </div>

          <div className="space-y-3">
            {savings.savings.map((saving, index) => (
              <div key={saving.speed} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{saving.speed} km/h</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Wind className="h-3 w-3 text-blue-500" />
                    <span className={saving.aeroSaving > 0 ? 'text-green-600' : 'text-red-600'}>
                      {saving.aeroSaving > 0 ? '+' : ''}{saving.aeroSaving.toFixed(1)}W
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gauge className="h-3 w-3 text-red-500" />
                    <span className={saving.rrSaving > 0 ? 'text-green-600' : 'text-red-600'}>
                      {saving.rrSaving > 0 ? '+' : ''}{saving.rrSaving.toFixed(1)}W
                    </span>
                  </div>
                  
                  <div className="font-medium">
                    <span className={saving.totalSaving > 0 ? 'text-green-600' : 'text-red-600'}>
                      {saving.totalSaving > 0 ? '+' : ''}{saving.totalSaving.toFixed(1)}W
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Impact */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4" />
            <h4 className="font-medium">Impacto en Rendimiento</h4>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {savings.savings[1].totalSaving > 0 ? (
              <>
                La configuración actual es <strong>{savings.savings[1].totalSaving.toFixed(1)}W más eficiente</strong> a 40 km/h.
                Esto equivale a una mejora del <strong>{((savings.savings[1].totalSaving / 250) * 100).toFixed(1)}%</strong> 
                {' '}para un ciclista de potencia media (250W).
              </>
            ) : (
              <>
                La configuración de comparación sería <strong>{Math.abs(savings.savings[1].totalSaving).toFixed(1)}W más eficiente</strong> a 40 km/h.
                Considera cambiar para mejorar el rendimiento en <strong>{((Math.abs(savings.savings[1].totalSaving) / 250) * 100).toFixed(1)}%</strong>.
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AerodynamicComparison;