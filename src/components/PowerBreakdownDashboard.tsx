import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Legend, PieChart, Pie, Cell,
  ComposedChart, ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wind, Mountain, Gauge, TrendingUp, BarChart3, PieChart as PieChartIcon,
  Info, AlertCircle, Zap, Target, Activity, Clock, Thermometer
} from 'lucide-react';
import type { PhysicalPowerAnalysis } from '@/services/PhysicalPowerService';
import type { ActivityPoint } from '@/types/activity';

interface PowerBreakdownDashboardProps {
  physicalData?: PhysicalPowerAnalysis | null;
  activityData?: ActivityPoint[];
  comparisonData?: PhysicalPowerAnalysis | null;
  isLoading?: boolean;
}

export const PowerBreakdownDashboard: React.FC<PowerBreakdownDashboardProps> = ({
  physicalData,
  activityData,
  comparisonData,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis Físico de Potencia</CardTitle>
          <CardDescription>Calculando descomposición física...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!physicalData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis Físico de Potencia</CardTitle>
          <CardDescription>No hay datos de análisis físico disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Info className="h-8 w-8 mr-2" />
            <span>Cargue datos de actividad para ver análisis físico</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate averages and totals for visualization
  const avgPowerAero = physicalData.components.power_aero.reduce((a, b) => a + b, 0) / physicalData.components.power_aero.length;
  const avgPowerRr = physicalData.components.power_rr.reduce((a, b) => a + b, 0) / physicalData.components.power_rr.length;
  const avgPowerGravity = physicalData.components.power_gravity.reduce((a, b) => a + b, 0) / physicalData.components.power_gravity.length;
  const totalAvgPower = avgPowerAero + avgPowerRr + avgPowerGravity;

  // Calculate percentages for pie chart
  const percentAero = (avgPowerAero / totalAvgPower) * 100;
  const percentRr = (avgPowerRr / totalAvgPower) * 100;
  const percentGravity = (avgPowerGravity / totalAvgPower) * 100;

  // Prepare data for charts
  const componentData = [
    { name: 'Aerodinámica', value: avgPowerAero, color: '#3b82f6', percentage: percentAero },
    { name: 'Rodamiento', value: avgPowerRr, color: '#ef4444', percentage: percentRr },
    { name: 'Gravedad', value: avgPowerGravity, color: '#10b981', percentage: percentGravity }
  ];

  // Sample timeline data (every 10 seconds for performance)
  const timelineData = physicalData.components.power_aero
    .map((aero, index) => {
      if (index % 10 === 0) { // Sample every 10 seconds
        return {
          time: Math.floor(index / 60), // Convert to minutes
          aero: aero,
          rr: physicalData.components.power_rr[index],
          gravity: physicalData.components.power_gravity[index],
          total: aero + physicalData.components.power_rr[index] + physicalData.components.power_gravity[index],
          speed: activityData?.[index]?.speed_kmh || 0
        };
      }
      return null;
    })
    .filter(Boolean);

  // Rating functions
  const getCdArating = (cda: number) => {
    if (cda <= 0.25) return { rating: 'Excelente', color: 'bg-green-500' };
    if (cda <= 0.30) return { rating: 'Muy Bueno', color: 'bg-blue-500' };
    if (cda <= 0.35) return { rating: 'Bueno', color: 'bg-yellow-500' };
    return { rating: 'Estándar', color: 'bg-orange-500' };
  };

  const getCrrRating = (crr: number) => {
    if (crr <= 0.004) return { rating: 'Excelente', color: 'bg-green-500' };
    if (crr <= 0.006) return { rating: 'Muy Bueno', color: 'bg-blue-500' };
    if (crr <= 0.008) return { rating: 'Bueno', color: 'bg-yellow-500' };
    return { rating: 'Estándar', color: 'bg-orange-500' };
  };

  const getConfidenceRating = (confidence: number) => {
    if (confidence >= 0.8) return { rating: 'Alta', color: 'bg-green-500' };
    if (confidence >= 0.6) return { rating: 'Media', color: 'bg-yellow-500' };
    return { rating: 'Baja', color: 'bg-red-500' };
  };

  const cdaRating = getCdArating(physicalData.estimates.CdA_estimated);
  const crrRating = getCrrRating(physicalData.estimates.Crr_estimated);
  const confidenceRating = getConfidenceRating(physicalData.estimates.confidence_score);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wind className="h-4 w-4" />
              CdA Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{physicalData.estimates.CdA_estimated.toFixed(4)}</div>
            <div className="text-xs text-muted-foreground">m² (coef. aerodinámico)</div>
            <Badge className={`mt-2 ${cdaRating.color} text-white`}>
              {cdaRating.rating}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Crr Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{physicalData.estimates.Crr_estimated.toFixed(5)}</div>
            <div className="text-xs text-muted-foreground">coef. rodamiento</div>
            <Badge className={`mt-2 ${crrRating.color} text-white`}>
              {crrRating.rating}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Confianza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(physicalData.estimates.confidence_score * 100).toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">precisión estimación</div>
            <Badge className={`mt-2 ${confidenceRating.color} text-white`}>
              {confidenceRating.rating}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Potencia Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAvgPower.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">W (promedio)</div>
            <div className="text-xs text-green-600 mt-1">
              ±{physicalData.validation.power_conservation_error.toFixed(1)}W error
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Descomposición Física de Potencia
          </CardTitle>
          <CardDescription>
            Análisis detallado de las componentes físicas que componen la potencia total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="breakdown">Descomposición</TabsTrigger>
              <TabsTrigger value="distribution">Distribución</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="conditions">Condiciones</TabsTrigger>
            </TabsList>

            {/* Tab 1: Breakdown */}
            <TabsContent value="breakdown" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Componentes de Potencia</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={componentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Potencia (W)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)} W`, 'Potencia']}
                        labelFormatter={(label) => `Componente: ${label}`}
                      />
                      <Bar dataKey="value" fill="#8884d8">
                        {componentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Desglose Detallado</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="font-medium">Aerodinámica</span>
                      </div>
                      <span className="font-bold">{avgPowerAero.toFixed(1)} W</span>
                    </div>
                    <Progress value={percentAero} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {percentAero.toFixed(1)}% del total • CdA: {physicalData.estimates.CdA_estimated.toFixed(4)} m²
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="font-medium">Rodamiento</span>
                      </div>
                      <span className="font-bold">{avgPowerRr.toFixed(1)} W</span>
                    </div>
                    <Progress value={percentRr} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {percentRr.toFixed(1)}% del total • Crr: {physicalData.estimates.Crr_estimated.toFixed(5)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="font-medium">Gravedad</span>
                      </div>
                      <span className="font-bold">{avgPowerGravity.toFixed(1)} W</span>
                    </div>
                    <Progress value={Math.abs(percentGravity)} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {percentGravity.toFixed(1)}% del total • Masa: {physicalData.mass_data.total_mass.toFixed(1)} kg
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Distribution */}
            <TabsContent value="distribution" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Distribución Porcentual</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={componentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {componentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)} W`, 'Potencia']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Análisis y Recomendaciones</h4>
                  
                  <div className="space-y-4">
                    <Alert>
                      <Wind className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">Optimización Aerodinámica</div>
                        <div className="text-sm mt-1">
                          La resistencia aerodinámica representa el {percentAero.toFixed(0)}% de tu potencia. 
                          {percentAero > 70 ? 
                            ' Considera mejorar posición aerodinámica o equipamiento.' :
                            ' Buena eficiencia aerodinámica actual.'
                          }
                        </div>
                      </AlertDescription>
                    </Alert>

                    <Alert>
                      <Gauge className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">Resistencia al Rodamiento</div>
                        <div className="text-sm mt-1">
                          El rodamiento consume {percentRr.toFixed(0)}% de tu potencia.
                          {physicalData.estimates.Crr_estimated > 0.006 ?
                            ' Considera neumáticos de menor resistencia.' :
                            ' Excelente configuración de neumáticos.'
                          }
                        </div>
                      </AlertDescription>
                    </Alert>

                    <Alert>
                      <Mountain className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">Componente Gravitacional</div>
                        <div className="text-sm mt-1">
                          {Math.abs(percentGravity) > 30 ?
                            'Ruta con desnivel significativo. La potencia gravitacional es dominante.' :
                            'Ruta relativamente plana. Optimización aero/rodamiento más relevante.'
                          }
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Timeline */}
            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Evolución Temporal de Componentes</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      label={{ value: 'Tiempo (min)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      yAxisId="power"
                      label={{ value: 'Potencia (W)', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis 
                      yAxisId="speed" 
                      orientation="right"
                      label={{ value: 'Velocidad (km/h)', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        const unit = name === 'speed' ? ' km/h' : ' W';
                        return [`${value.toFixed(1)}${unit}`, name];
                      }}
                      labelFormatter={(label) => `Tiempo: ${label} min`}
                    />
                    <Legend />
                    
                    <Area 
                      yAxisId="power"
                      type="monotone" 
                      dataKey="aero" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      name="Aerodinámica"
                    />
                    <Area 
                      yAxisId="power"
                      type="monotone" 
                      dataKey="rr" 
                      stackId="1" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                      name="Rodamiento"
                    />
                    <Area 
                      yAxisId="power"
                      type="monotone" 
                      dataKey="gravity" 
                      stackId="1" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="Gravedad"
                    />
                    
                    <Line 
                      yAxisId="speed"
                      type="monotone" 
                      dataKey="speed" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={false}
                      name="Velocidad"
                    />
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-medium">Pico Aero</div>
                    <div className="text-blue-600 font-bold">
                      {Math.max(...physicalData.components.power_aero).toFixed(0)} W
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Pico Rodamiento</div>
                    <div className="text-red-600 font-bold">
                      {Math.max(...physicalData.components.power_rr).toFixed(0)} W
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Pico Gravedad</div>
                    <div className="text-green-600 font-bold">
                      {Math.max(...physicalData.components.power_gravity).toFixed(0)} W
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 4: Conditions */}
            <TabsContent value="conditions" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Validación Física</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>CdA en rango realista</span>
                      <Badge variant={physicalData.validation.estimates_realistic ? "default" : "destructive"}>
                        {physicalData.validation.estimates_realistic ? "✓ Válido" : "⚠ Fuera rango"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Componentes físicamente realistas</span>
                      <Badge variant={physicalData.validation.components_realistic ? "default" : "destructive"}>
                        {physicalData.validation.components_realistic ? "✓ Válido" : "⚠ Revisar"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Error conservación energía</span>
                      <Badge variant={physicalData.validation.power_conservation_error < 50 ? "default" : "secondary"}>
                        {physicalData.validation.power_conservation_error.toFixed(1)} W
                      </Badge>
                    </div>
                  </div>

                  <h4 className="font-medium pt-4">Calidad de Estimación</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Segmentos usados CdA</span>
                      <Badge variant="outline">
                        {physicalData.estimates.segments_used_CdA}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Segmentos usados Crr</span>
                      <Badge variant="outline">
                        {physicalData.estimates.segments_used_Crr}
                      </Badge>
                    </div>
                    
                    <Progress 
                      value={physicalData.estimates.confidence_score * 100} 
                      className="h-3"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      Confianza: {(physicalData.estimates.confidence_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Condiciones Ambientales</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Thermometer className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <div className="font-bold">{physicalData.conditions.air_density.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground">kg/m³ densidad aire</div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Mountain className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="font-bold">{physicalData.mass_data.total_mass.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">kg masa total</div>
                    </div>
                  </div>

                  <h4 className="font-medium pt-4">Información Técnica</h4>
                  
                  <div className="text-xs text-muted-foreground space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium">Fórmulas utilizadas:</div>
                        <div>• P_aero = 0.5 × CdA × ρ × v³</div>
                        <div>• P_rr = Crr × m × g × v</div>
                        <div>• P_gravity = m × g × v × sin(θ)</div>
                      </div>
                      <div>
                        <div className="font-medium">Rangos típicos:</div>
                        <div>• CdA: 0.20-0.45 m² (bici ruta)</div>
                        <div>• Crr: 0.003-0.008 (asfalto)</div>
                        <div>• ρ aire: 1.0-1.3 kg/m³</div>
                      </div>
                    </div>
                    
                    {physicalData.timestamp && (
                      <div className="pt-2 border-t">
                        <span className="font-medium">Calculado:</span> {new Date(physicalData.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PowerBreakdownDashboard;