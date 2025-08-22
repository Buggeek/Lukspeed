import React, { useState } from 'react';
import { ResponsiveContainer, ResponsiveGrid, AdaptiveCard } from '@/components/ui/responsive-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Heart, 
  Settings, 
  Wind, 
  Brain,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  Gauge,
  Calculator,
  Maximize2
} from 'lucide-react';

import { VO2MaxCard } from '@/components/advanced-metrics/VO2MaxCard';
import { ThresholdAnalysisCard } from '@/components/advanced-metrics/ThresholdAnalysisCard';
import { BiomechanicsCard } from '@/components/advanced-metrics/BiomechanicsCard';
import { AerodynamicsCard } from '@/components/advanced-metrics/AerodynamicsCard';

import type { AdvancedMetricsSnapshot } from '@/types/advanced-metrics';

export default function AdvancedMetricsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'4weeks' | '12weeks' | '1year'>('4weeks');
  const [analysisType, setAnalysisType] = useState<'current' | 'trends' | 'comparison'>('current');

  // Mock advanced metrics data - based on your specific examples
  const mockAdvancedMetrics: AdvancedMetricsSnapshot = {
    timestamp: new Date().toISOString(),
    vo2_analysis: {
      estimated_vo2_max: 58.3,
      vo2_at_threshold: 50.7,
      aerobic_capacity_score: 'excellent',
      vo2_efficiency: 5.4,
      metabolic_flexibility: 0.87
    },
    threshold_analysis: {
      vt1_power: 248,
      vt1_heart_rate: 142,
      vt2_power: 315,
      vt2_heart_rate: 165,
      anaerobic_threshold: 315,
      aerobic_threshold: 248,
      threshold_detection_confidence: 0.87,
      lactate_shuttle_efficiency: 0.27
    },
    hrv_analysis: {
      rmssd: 42.3,
      pnn50: 18.7,
      stress_score: 28.4,
      recovery_status: 'good',
      autonomic_balance: 0.85,
      hrv_trend: 'stable',
      parasympathetic_activity: 0.94,
      sympathetic_activity: 0.72
    },
    biomechanical_analysis: {
      torque_effectiveness: 91.2,
      pedal_smoothness: 23.8,
      power_phase_angle: 68.4,
      peak_power_phase_angle: 72.1,
      left_torque_effectiveness: 89.7,
      right_torque_effectiveness: 92.8,
      biomechanical_efficiency_score: 88.3,
      muscle_activation_symmetry: 0.967
    },
    aerodynamic_analysis: {
      cda_dynamic: 0.287,
      drag_coefficient: 0.89,
      frontal_area: 0.42,
      yaw_angle_effect: 0.12,
      rolling_resistance_dynamic: 0.0045,
      aerodynamic_efficiency_score: 76.2,
      wind_relative_speed: 12.8,
      aero_power_savings: 28.5
    },
    power_curve_analysis: {
      critical_power: 285,
      w_prime: 18500,
      anaerobic_work_capacity: 18500,
      power_duration_model: {
        a: 285,
        b: 0.85,
        c: 18500
      },
      neuromuscular_power: 1247,
      vo2_max_power: 389,
      lactate_threshold_power: 315,
      aerobic_threshold_power: 248,
      endurance_ratio: 0.228
    },
    overall_performance_score: 84.7,
    training_readiness_score: 78.3,
    fatigue_resistance_index: 0.847
  };

  // Mock your specific metrics examples
  const mockSpecificMetrics = {
    acceleration_analysis: {
      flat_acceleration: 2.8, // m/s² en plano
      grade_acceleration_bins: {
        "0-2%": 2.6,
        "2-5%": 2.1,
        "5-8%": 1.7,
        "8%+": 1.3
      },
      acceleration_variability: 0.45, // std
      explosivity_index: 12.4 // Δv/Δt máximo sostenido 5-10s
    },
    torque_analysis: {
      mean_torque: 145.2, // Nm
      normalized_torque: 152.8, // Nm
      torque_effectiveness: 91.2, // TE %
      torque_efficiency_index: 0.89 // IE
    },
    mechanical_efficiency: {
      efficiency_normalized: 4.8, // (v media / W medios) normalizada
      grade_correction_factor: 1.12,
      wind_correction_factor: 0.96
    },
    power_metrics: {
      normalized_power: 312, // NP
      intensity_factor: 0.82, // IF
      training_stress_score: 187, // TSS
      power_curve_gradient_specific: {
        "±2%": [{ duration: 5, power: 1247 }, { duration: 60, power: 485 }, { duration: 300, power: 389 }]
      }
    }
  };

  const renderOverviewCards = () => (
    <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 4 }}>
      <AdaptiveCard className="text-center">
        <div className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Award className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {mockAdvancedMetrics.overall_performance_score.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 mb-2">Score General</div>
          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
            Top 15% ciclistas
          </Badge>
        </div>
      </AdaptiveCard>

      <AdaptiveCard className="text-center">
        <div className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Brain className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {mockAdvancedMetrics.training_readiness_score.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 mb-2">Preparación</div>
          <Badge variant="secondary" className="bg-green-50 text-green-700">
            Listo entrenar
          </Badge>
        </div>
      </AdaptiveCard>

      <AdaptiveCard className="text-center">
        <div className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Gauge className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {(mockAdvancedMetrics.fatigue_resistance_index * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mb-2">Resistencia Fatiga</div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            Excelente
          </Badge>
        </div>
      </AdaptiveCard>

      <AdaptiveCard className="text-center">
        <div className="p-4">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            +12.3%
          </div>
          <div className="text-sm text-gray-600 mb-2">Mejora {selectedPeriod}</div>
          <Badge variant="secondary" className="bg-purple-50 text-purple-700">
            Progreso óptimo
          </Badge>
        </div>
      </AdaptiveCard>
    </ResponsiveGrid>
  );

  const renderSpecificMetricsCards = () => (
    <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }}>
      {/* Acceleration Analysis */}
      <AdaptiveCard>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Maximize2 className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Análisis de Aceleración</h3>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-700">
              {mockSpecificMetrics.acceleration_analysis.flat_acceleration}
            </div>
            <div className="text-sm text-orange-600">m/s² en Plano</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Por Bins de Pendiente:</div>
            {Object.entries(mockSpecificMetrics.acceleration_analysis.grade_acceleration_bins).map(([grade, accel]) => (
              <div key={grade} className="flex justify-between text-sm">
                <span className="text-gray-600">{grade}</span>
                <span className="font-medium">{accel} m/s²</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Variabilidad (std)</span>
              <span className="font-medium">{mockSpecificMetrics.acceleration_analysis.acceleration_variability}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Índice Explosividad</span>
              <span className="font-medium text-red-600">{mockSpecificMetrics.acceleration_analysis.explosivity_index}</span>
            </div>
          </div>
        </div>
      </AdaptiveCard>

      {/* Torque Analysis */}
      <AdaptiveCard>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Análisis de Torque</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-700">
                {mockSpecificMetrics.torque_analysis.mean_torque}
              </div>
              <div className="text-xs text-purple-600">Torque Medio (Nm)</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-700">
                {mockSpecificMetrics.torque_analysis.normalized_torque}
              </div>
              <div className="text-xs text-purple-600">Normalizado (Nm)</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">TE (Torque Efectivo)</span>
              <span className="font-medium text-green-600">{mockSpecificMetrics.torque_analysis.torque_effectiveness}%</span>
            </div>
            <Progress value={mockSpecificMetrics.torque_analysis.torque_effectiveness} className="h-2" />
          </div>

          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="text-gray-600">IE (Índice Eficiencia)</span>
            <span className="font-medium">{mockSpecificMetrics.torque_analysis.torque_efficiency_index}</span>
          </div>
        </div>
      </AdaptiveCard>

      {/* Mechanical Efficiency */}
      <AdaptiveCard>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Eficiencia Mecánica</h3>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-700">
              {mockSpecificMetrics.mechanical_efficiency.efficiency_normalized}
            </div>
            <div className="text-sm text-green-600">(v media / W medios) normalizada</div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Factor Corrección Pendiente</span>
              <span className="font-medium">{mockSpecificMetrics.mechanical_efficiency.grade_correction_factor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Factor Corrección Viento</span>
              <span className="font-medium">{mockSpecificMetrics.mechanical_efficiency.wind_correction_factor}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t">
            Normalizada por pendiente y condiciones de viento
          </div>
        </div>
      </AdaptiveCard>
    </ResponsiveGrid>
  );

  const renderPowerMetricsCard = () => (
    <AdaptiveCard>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Métricas de Potencia Específicas
          </h3>
          <Badge variant="secondary">NP/IF/TSS</Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {mockSpecificMetrics.power_metrics.normalized_power}W
            </div>
            <div className="text-sm text-blue-600">Potencia Normalizada</div>
            <div className="text-xs text-gray-500 mt-1">NP</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {mockSpecificMetrics.power_metrics.intensity_factor.toFixed(2)}
            </div>
            <div className="text-sm text-green-600">Factor Intensidad</div>
            <div className="text-xs text-gray-500 mt-1">IF = NP/FTP</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {mockSpecificMetrics.power_metrics.training_stress_score}
            </div>
            <div className="text-sm text-purple-600">TSS</div>
            <div className="text-xs text-gray-500 mt-1">Training Stress Score</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Curva Potencia Específica (±2% pendiente)</h4>
          <div className="grid grid-cols-3 gap-3">
            {mockSpecificMetrics.power_metrics.power_curve_gradient_specific["±2%"].map((point, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-800">{point.power}W</div>
                <div className="text-xs text-gray-600">{point.duration < 60 ? `${point.duration}s` : `${Math.floor(point.duration/60)}min`}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-600 pt-3 border-t">
          Curva específica tomando solo muestras con gradiente ±2% para mayor precisión
        </div>
      </div>
    </AdaptiveCard>
  );

  return (
    <ResponsiveContainer size="full" className="pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Métricas Avanzadas</h1>
            <p className="text-gray-600">Análisis profesional de ciencia del deporte</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={(value: '4weeks' | '12weeks' | '1year') => setSelectedPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4weeks">4 Semanas</SelectItem>
                <SelectItem value="12weeks">12 Semanas</SelectItem>
                <SelectItem value="1year">1 Año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mb-6">
        {renderOverviewCards()}
      </div>

      {/* Main Analysis Tabs */}
      <Tabs defaultValue="physiological" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="physiological">Fisiológico</TabsTrigger>
          <TabsTrigger value="biomechanical">Biomecánico</TabsTrigger>
          <TabsTrigger value="aerodynamic">Aerodinámico</TabsTrigger>
          <TabsTrigger value="specific">Específicas</TabsTrigger>
          <TabsTrigger value="power">Potencia</TabsTrigger>
        </TabsList>

        <TabsContent value="physiological" className="space-y-4">
          <ResponsiveGrid cols={{ sm: 1, lg: 2 }}>
            <VO2MaxCard analysis={mockAdvancedMetrics.vo2_analysis} />
            <ThresholdAnalysisCard analysis={mockAdvancedMetrics.threshold_analysis} />
          </ResponsiveGrid>
        </TabsContent>

        <TabsContent value="biomechanical" className="space-y-4">
          <BiomechanicsCard analysis={mockAdvancedMetrics.biomechanical_analysis} />
        </TabsContent>

        <TabsContent value="aerodynamic" className="space-y-4">
          <AerodynamicsCard analysis={mockAdvancedMetrics.aerodynamic_analysis} />
        </TabsContent>

        <TabsContent value="specific" className="space-y-4">
          {renderSpecificMetricsCards()}
        </TabsContent>

        <TabsContent value="power" className="space-y-4">
          {renderPowerMetricsCard()}
        </TabsContent>
      </Tabs>

      {/* Performance Summary */}
      <div className="mt-8">
        <AdaptiveCard>
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Resumen Profesional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Fortalezas Detectadas</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>VO₂ máximo excelente</strong> - Top 15% de ciclistas entrenados</li>
                  <li>• <strong>Biomecánica eficiente</strong> - TE 91.2% dentro del rango élite</li>
                  <li>• <strong>Capacidad explosiva</strong> - Índice 12.4 superior al promedio</li>
                  <li>• <strong>Detección umbrales</strong> - Alta confianza (87%)</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Áreas de Mejora</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>CdA aerodinámico</strong> - Potencial ahorro 28.5W con optimización</li>
                  <li>• <strong>Eficiencia en subidas</strong> - Aceleración disminuye en pendientes {'>'} 5%</li>
                  <li>• <strong>Crr rodadura</strong> - Revisar presión neumáticos (0.0045 actual)</li>
                  <li>• <strong>Simetría L/R</strong> - Diferencia 3.1% entre piernas</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600">
                <strong>Recomendación Principal:</strong> Enfoque en optimización aerodinámica y trabajo específico de fuerza en subidas para maximizar rendimiento competitivo.
              </div>
            </div>
          </div>
        </AdaptiveCard>
      </div>
    </ResponsiveContainer>
  );
}