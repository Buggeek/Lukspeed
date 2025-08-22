import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  MapPin,
  TrendingUp, 
  TrendingDown,
  Clock,
  Zap,
  Mountain,
  Target,
  Activity,
  Award,
  AlertTriangle
} from 'lucide-react';
import type { SegmentAnalysis as SegmentAnalysisType } from '@/utils/predictive-models';

interface SegmentAnalysisProps {
  segments: SegmentAnalysisType[];
  className?: string;
}

export function SegmentAnalysis({ segments, className }: SegmentAnalysisProps) {
  const [selectedSegment, setSelectedSegment] = useState<string>(segments[0]?.segment_id || '');
  const [viewMode, setViewMode] = useState<'performance' | 'pacing' | 'comparison'>('performance');

  const selectedSegmentData = segments.find(s => s.segment_id === selectedSegment);

  if (!selectedSegmentData) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">No hay datos de segmentos disponibles</div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'bg-green-50 text-green-700 border-green-200';
      case 'declining': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPacingColor = (strategy: string) => {
    switch (strategy) {
      case 'even': return 'text-green-600';
      case 'negative_split': return 'text-blue-600';
      case 'fast_start': return 'text-orange-600';
      case 'surging': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPacingRecommendation = (strategy: string, efficiency: number) => {
    if (strategy === 'even' && efficiency > 0.85) {
      return 'Pacing óptimo. Mantén esta estrategia.';
    } else if (strategy === 'fast_start') {
      return 'Salida muy rápida. Considera un enfoque más conservador.';
    } else if (strategy === 'negative_split' && efficiency > 0.8) {
      return 'Buen negative split. Puedes ser ligeramente más agresivo al inicio.';
    } else if (strategy === 'surging') {
      return 'Demasiadas variaciones. Busca mayor consistencia.';
    }
    return 'Analiza tu distribución de esfuerzo para optimizar.';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderPerformanceAnalysis = () => (
    <div className="space-y-6">
      {/* Best Effort Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Mejor Marca Personal
            </CardTitle>
            <Badge variant="secondary" className={getTrendColor(selectedSegmentData.performance_trend)}>
              {getTrendIcon(selectedSegmentData.performance_trend)}
              <span className="ml-1 capitalize">{selectedSegmentData.performance_trend}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">
                {selectedSegmentData.best_effort.power}W
              </div>
              <div className="text-sm text-gray-600 mb-2">Potencia Media</div>
              <div className="text-xs text-gray-500">
                {new Date(selectedSegmentData.best_effort.date).toLocaleDateString('es-ES')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700 mb-1">
                {formatTime(selectedSegmentData.best_effort.time)}
              </div>
              <div className="text-sm text-gray-600 mb-2">Tiempo</div>
              <div className="text-xs text-gray-500">
                Mejor registro
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {(selectedSegmentData.best_effort.power / 70 * 3.6).toFixed(1)} W/kg
              </div>
              <div className="text-sm text-gray-600 mb-2">Potencia/Peso</div>
              <div className="text-xs text-gray-500">
                Estimado (70kg)
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Condiciones:</strong> {selectedSegmentData.best_effort.conditions}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Efforts Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Esfuerzos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedSegmentData.recent_efforts}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis 
                  yAxisId="power"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}W`}
                />
                <YAxis 
                  yAxisId="performance"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                  formatter={(value: number, name: string) => [
                    name === 'power' ? `${value}W` : 
                    name === 'time' ? formatTime(value) : 
                    `${(value * 100).toFixed(1)}%`,
                    name === 'power' ? 'Potencia' : 
                    name === 'time' ? 'Tiempo' : 
                    'vs. Mejor'
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="power" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  yAxisId="power"
                  name="power"
                />
                <Line 
                  type="monotone" 
                  dataKey="relative_performance" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  yAxisId="performance"
                  name="relative_performance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Potencia (W)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Rendimiento vs. Mejor (%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {selectedSegmentData.recent_efforts.length}
            </div>
            <div className="text-sm text-gray-600">Intentos</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {Math.round(selectedSegmentData.recent_efforts.reduce((sum, effort) => sum + effort.power, 0) / selectedSegmentData.recent_efforts.length)}W
            </div>
            <div className="text-sm text-gray-600">Potencia Media</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {Math.round(selectedSegmentData.recent_efforts.reduce((sum, effort) => sum + effort.relative_performance, 0) / selectedSegmentData.recent_efforts.length * 100)}%
            </div>
            <div className="text-sm text-gray-600">Consistencia</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {Math.max(...selectedSegmentData.recent_efforts.map(e => e.relative_performance) || [0]) > 1.0 ? 'PB!' : 'No'}
            </div>
            <div className="text-sm text-gray-600">Nuevo Record</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPacingAnalysis = () => (
    <div className="space-y-6">
      {/* Pacing Strategy Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Estrategia de Pacing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-center mb-4">
                <div className={`text-2xl font-bold mb-1 ${getPacingColor(selectedSegmentData.pacing_analysis.strategy)}`}>
                  {selectedSegmentData.pacing_analysis.strategy === 'even' ? 'Uniforme' :
                   selectedSegmentData.pacing_analysis.strategy === 'negative_split' ? 'Negative Split' :
                   selectedSegmentData.pacing_analysis.strategy === 'fast_start' ? 'Salida Rápida' :
                   'Con Variaciones'}
                </div>
                <div className="text-sm text-gray-600 mb-2">Estrategia Actual</div>
                <Badge variant="secondary" className={
                  selectedSegmentData.pacing_analysis.efficiency_score > 0.85 ? 
                  'bg-green-50 text-green-700 border-green-200' :
                  selectedSegmentData.pacing_analysis.efficiency_score > 0.75 ? 
                  'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }>
                  Eficiencia: {(selectedSegmentData.pacing_analysis.efficiency_score * 100).toFixed(1)}%
                </Badge>
              </div>
              
              <div className="text-sm text-gray-700 text-center">
                {getPacingRecommendation(selectedSegmentData.pacing_analysis.strategy, selectedSegmentData.pacing_analysis.efficiency_score)}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pacing Óptimo Recomendado</h4>
              <div className="space-y-2">
                {selectedSegmentData.pacing_analysis.optimal_pacing.map((power, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">
                      {index === 0 ? 'Primer tercio' : index === 1 ? 'Segundo tercio' : 'Último tercio'}
                    </span>
                    <span className="font-medium">{power}W</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pacing Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Potencia Recomendada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedSegmentData.pacing_analysis.optimal_pacing.map((power, index) => ({
                section: `${index + 1}er tercio`,
                recommended: power,
                current: selectedSegmentData.best_effort.power * (
                  selectedSegmentData.pacing_analysis.strategy === 'fast_start' ? 
                  [1.1, 0.95, 0.95][index] :
                  selectedSegmentData.pacing_analysis.strategy === 'negative_split' ? 
                  [0.95, 1.0, 1.05][index] :
                  [1.0, 1.0, 1.0][index]
                )
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="section" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}W`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(0)}W`, 
                    name === 'recommended' ? 'Recomendado' : 'Actual'
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="current" fill="#ef4444" name="current" />
                <Bar dataKey="recommended" fill="#10b981" name="recommended" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Distribución Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Distribución Óptima</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Análisis Inteligente de Segmentos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Rendimiento</SelectItem>
                <SelectItem value="pacing">Pacing</SelectItem>
                <SelectItem value="comparison">Comparación</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {segments.map((segment) => (
                  <SelectItem key={segment.segment_id} value={segment.segment_id}>
                    {segment.segment_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewMode === 'performance' && renderPerformanceAnalysis()}
        {viewMode === 'pacing' && renderPacingAnalysis()}
        {viewMode === 'comparison' && (
          <div className="text-center p-8 text-gray-500">
            Comparación entre segmentos - Funcionalidad en desarrollo
          </div>
        )}
      </CardContent>
    </Card>
  );
}