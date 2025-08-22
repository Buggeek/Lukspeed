import React, { useState } from 'react';
import { ResponsiveContainer, ResponsiveGrid, AdaptiveCard } from '@/components/ui/responsive-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Brain,
  Target,
  TrendingUp,
  Zap,
  Calendar,
  Award,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Wind
} from 'lucide-react';

import { FTPPredictionCard } from '@/components/predictive/FTPPredictionCard';
import { TrainingLoadAnalysis } from '@/components/predictive/TrainingLoadAnalysis';
import { SegmentAnalysis } from '@/components/predictive/SegmentAnalysis';
import { calculateTrainingLoad, predictFTP, analyzeSegments, analyzeTacticalPatterns } from '@/utils/predictive-models';
import type { Activity } from '@/types';
import type { TacticalAnalysis } from '@/utils/predictive-models';

// Mock data for demonstration
const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Entrenamiento de Intervalos',
    date: '2024-01-15',
    duration: 3600,
    distance: 45.2,
    average_power: 287,
    normalized_power: 312,
    max_power: 1247,
    average_heart_rate: 156,
    max_heart_rate: 189,
    average_cadence: 92,
    intensity_factor: 0.82,
    training_stress_score: 187,
    elevation_gain: 650,
    vam: 1340,
    work: 985600
  },
  {
    id: '2',
    name: 'Salida Larga Endurance',
    date: '2024-01-20',
    duration: 7200,
    distance: 98.5,
    average_power: 245,
    normalized_power: 268,
    max_power: 890,
    average_heart_rate: 142,
    max_heart_rate: 175,
    average_cadence: 88,
    intensity_factor: 0.68,
    training_stress_score: 245,
    elevation_gain: 1250,
    vam: 1180,
    work: 1764000
  },
  {
    id: '3',
    name: 'Test FTP',
    date: '2024-01-25',
    duration: 2700,
    distance: 32.1,
    average_power: 315,
    normalized_power: 318,
    max_power: 1156,
    average_heart_rate: 165,
    max_heart_rate: 178,
    average_cadence: 95,
    intensity_factor: 0.95,
    training_stress_score: 195,
    elevation_gain: 320,
    vam: 1420,
    work: 850500
  }
];

export default function PredictiveAnalytics() {
  const [selectedView, setSelectedView] = useState<'ftp' | 'load' | 'segments' | 'tactical'>('ftp');
  const [predictionHorizon, setPredictionHorizon] = useState<'2weeks' | '4weeks' | '8weeks'>('4weeks');

  // Calculate predictive models
  const trainingLoadMetrics = calculateTrainingLoad(mockActivities);
  const ftpPrediction = predictFTP(mockActivities, 315);
  const segmentAnalysis = analyzeSegments(mockActivities);
  const tacticalAnalysis = analyzeTacticalPatterns(mockActivities[0]);

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <AdaptiveCard className="text-center">
        <div className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mb-1">
            {ftpPrediction.predicted_ftp}W
          </div>
          <div className="text-sm text-gray-600 mb-2">FTP Predicho</div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            +{ftpPrediction.predicted_ftp - ftpPrediction.current_ftp}W
          </Badge>
        </div>
      </AdaptiveCard>
      
      <AdaptiveCard className="text-center">
        <div className="p-4">
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700 mb-1">
            {trainingLoadMetrics.tsb > 0 ? '+' : ''}{trainingLoadMetrics.tsb}
          </div>
          <div className="text-sm text-gray-600 mb-2">TSB Actual</div>
          <Badge variant="secondary" className={
            trainingLoadMetrics.form === 'excellent' ? 'bg-green-50 text-green-700' :
            trainingLoadMetrics.form === 'good' ? 'bg-blue-50 text-blue-700' :
            trainingLoadMetrics.form === 'neutral' ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'
          }>
            {trainingLoadMetrics.form === 'excellent' ? 'Excelente' :
             trainingLoadMetrics.form === 'good' ? 'Buena' :
             trainingLoadMetrics.form === 'neutral' ? 'Neutral' :
             trainingLoadMetrics.form === 'tired' ? 'Cansado' : 'Sobreentrenado'}
          </Badge>
        </div>
      </AdaptiveCard>
      
      <AdaptiveCard className="text-center">
        <div className="p-4">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mb-1">
            {(ftpPrediction.confidence * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 mb-2">Confianza</div>
          <Badge variant="secondary" className={
            ftpPrediction.confidence >= 0.8 ? 'bg-green-50 text-green-700' :
            ftpPrediction.confidence >= 0.6 ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'
          }>
            {ftpPrediction.confidence >= 0.8 ? 'Alta' :
             ftpPrediction.confidence >= 0.6 ? 'Media' : 'Baja'}
          </Badge>
        </div>
      </AdaptiveCard>
      
      <AdaptiveCard className="text-center">
        <div className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-700 mb-1">
            14
          </div>
          <div className="text-sm text-gray-600 mb-2">Días al Test</div>
          <Badge variant="secondary" className="bg-orange-50 text-orange-700">
            Recomendado
          </Badge>
        </div>
      </AdaptiveCard>
    </div>
  );

  const renderTacticalAnalysis = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-red-600" />
            Análisis Táctico de Carrera
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700 mb-1">
                {tacticalAnalysis.attack_frequency.toFixed(1)}
              </div>
              <div className="text-sm text-red-600">Ataques/hora</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {(tacticalAnalysis.response_capability * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-blue-600">Respuesta</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {(tacticalAnalysis.drafting_benefit * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-green-600">Ahorro Drafting</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700 mb-1">
                {(tacticalAnalysis.positioning_analysis.front_third * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-purple-600">Posición Frontal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Energía por Zonas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(tacticalAnalysis.energy_distribution).map(([zone, percentage]) => (
              <div key={zone} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {zone.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {(percentage * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={percentage * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tactical Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Recomendaciones Tácticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900 mb-1">Posicionamiento</div>
                  <div className="text-sm text-blue-800">
                    {tacticalAnalysis.positioning_analysis.front_third > 0.6 
                      ? 'Excelente posicionamiento frontal. Mantén esta estrategia en subidas.'
                      : 'Mejora tu posicionamiento. Intenta estar en el primer tercio del pelotón.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Wind className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900 mb-1">Drafting</div>
                  <div className="text-sm text-green-800">
                    Ahorro promedio del {(tacticalAnalysis.drafting_benefit * 100).toFixed(0)}%. 
                    {tacticalAnalysis.drafting_benefit > 0.25 
                      ? ' Excelente uso del drafting.' 
                      : ' Busca más oportunidades de drafting para conservar energía.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-900 mb-1">Capacidad de Ataque</div>
                  <div className="text-sm text-red-800">
                    {tacticalAnalysis.response_capability > 0.8 
                      ? 'Excelente capacidad de respuesta a ataques. Puedes ser más agresivo.'
                      : 'Trabaja en intervalos cortos de alta intensidad para mejorar tu capacidad de respuesta.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEventPrediction = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Predicción de Rendimiento en Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Próximos Eventos Sugeridos</h4>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Gran Fondo 100km</span>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      Óptimo
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Tiempo estimado: 2h 45m - 3h 05m</div>
                    <div>Potencia media predicha: 285W</div>
                    <div>Probabilidad top 20%: 85%</div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Carrera Crit 45min</span>
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
                      Moderado
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Potencia media predicha: 295W</div>
                    <div>Picos requeridos: &gt;900W</div>
                    <div>Recomendación: 2 semanas más entrenamiento</div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Etapa Montaña 85km</span>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      Favorable
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>VAM predicho: 1,450 m/h</div>
                    <div>Tiempo en puerto: 18-22 min</div>
                    <div>Ventaja: +15% vs promedio categoría</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Factores de Rendimiento</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Forma física actual</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Resistencia</span>
                    <span className="font-medium text-blue-600">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Potencia explosiva</span>
                    <span className="font-medium text-purple-600">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Capacidad escalada</span>
                    <span className="font-medium text-orange-600">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Recomendación:</strong> Tu perfil actual es ideal para eventos de resistencia 
                  y montaña. Considera trabajar intervalos cortos para mejorar la potencia explosiva 
                  si planeas participar en criteriums.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ResponsiveContainer size="full" className="pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Análisis Predictivo Avanzado</h1>
            <p className="text-gray-600">Predicción de rendimiento con Machine Learning y análisis táctico</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={predictionHorizon} onValueChange={(value: '2weeks' | '4weeks' | '8weeks') => setPredictionHorizon(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2weeks">2 Semanas</SelectItem>
                <SelectItem value="4weeks">4 Semanas</SelectItem>
                <SelectItem value="8weeks">8 Semanas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      {renderOverviewCards()}

      {/* Main Analysis Tabs */}
      <Tabs value={selectedView} onValueChange={(value: 'ftp' | 'load' | 'segments' | 'tactical') => setSelectedView(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ftp">Predicción FTP</TabsTrigger>
          <TabsTrigger value="load">Carga Entrenamiento</TabsTrigger>
          <TabsTrigger value="segments">Segmentos</TabsTrigger>
          <TabsTrigger value="tactical">Análisis Táctico</TabsTrigger>
        </TabsList>

        <TabsContent value="ftp" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FTPPredictionCard prediction={ftpPrediction} />
            </div>
            <div>
              {renderEventPrediction()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="load" className="space-y-6">
          <TrainingLoadAnalysis metrics={trainingLoadMetrics} />
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <SegmentAnalysis segments={segmentAnalysis} />
        </TabsContent>

        <TabsContent value="tactical" className="space-y-6">
          {renderTacticalAnalysis()}
        </TabsContent>
      </Tabs>

      {/* AI Insights Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            Resumen IA - Insights Clave
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Predicciones Principales</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>FTP aumentará {ftpPrediction.predicted_ftp - ftpPrediction.current_ftp}W en {predictionHorizon}</span>
                </div>
                <div className="flex items-center gap-2">
                  {trainingLoadMetrics.form === 'excellent' ? 
                    <CheckCircle className="h-4 w-4 text-green-600" /> :
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  }
                  <span>Estado de forma: {trainingLoadMetrics.form === 'excellent' ? 'Óptimo para competir' : 'Necesita ajustes'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Mejor especialidad: Eventos de resistencia y montaña</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recomendaciones Prioritarias</h4>
              <div className="space-y-2 text-sm">
                <div>• Test FTP recomendado: {new Date(ftpPrediction.recommended_test_date).toLocaleDateString('es-ES')}</div>
                <div>• {trainingLoadMetrics.tsb < -10 ? 'Reducir carga de entrenamiento' : 'Mantener programa actual'}</div>
                <div>• Trabajar potencia explosiva para criteriums</div>
                <div>• Optimizar posicionamiento táctico en pelotón</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}