import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, Zap, Target, Info } from 'lucide-react';
import type { EfficiencyAnalysis } from '@/services/EfficiencyCurveService';

interface EfficiencyDashboardProps {
  efficiencyData?: EfficiencyAnalysis | null;
  comparisonData?: EfficiencyAnalysis | null;
  dataQuality?: {
    valid: boolean;
    warnings: string[];
    recommendations: string[];
  } | null;
}

export const EfficiencyDashboard: React.FC<EfficiencyDashboardProps> = ({ 
  efficiencyData, 
  comparisonData,
  dataQuality 
}) => {
  if (!efficiencyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Eficiencia</CardTitle>
          <CardDescription>No hay datos de eficiencia disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Info className="h-8 w-8 mr-2" />
            <span>Ejecute el análisis para ver métricas de eficiencia</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { curva_eficiencia, eficiencia_40kmh } = efficiencyData;

  // Prepare data for chart
  const chartData = curva_eficiencia.map(range => ({
    ...range,
    speed_range_numeric: parseInt(range.rango_velocidad.split('-')[0])
  })).sort((a, b) => a.speed_range_numeric - b.speed_range_numeric);

  // Calculate efficiency statistics
  const efficiencyStats = curva_eficiencia.length > 0 ? {
    max: Math.max(...curva_eficiencia.map(r => r.eficiencia)),
    min: Math.min(...curva_eficiencia.map(r => r.eficiencia)),
    avg: curva_eficiencia.reduce((sum, r) => sum + r.eficiencia, 0) / curva_eficiencia.length,
    totalSamples: curva_eficiencia.reduce((sum, r) => sum + r.muestras, 0)
  } : null;

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 0.4) return '#10b981'; // Excellent - Green
    if (efficiency >= 0.3) return '#3b82f6'; // Good - Blue  
    if (efficiency >= 0.2) return '#f59e0b'; // Average - Yellow
    return '#ef4444'; // Poor - Red
  };

  const getEfficiencyRating = (efficiency: number) => {
    if (efficiency >= 0.4) return 'Excelente';
    if (efficiency >= 0.3) return 'Buena';
    if (efficiency >= 0.2) return 'Promedio';
    return 'Deficiente';
  };

  return (
    <div className="space-y-6">
      {/* Data Quality Warnings */}
      {dataQuality && !dataQuality.valid && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">Advertencias de calidad de datos:</div>
              <ul className="list-disc list-inside space-y-1">
                {dataQuality.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">{warning}</li>
                ))}
              </ul>
              {dataQuality.recommendations.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium text-sm">Recomendaciones:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {dataQuality.recommendations.map((rec, index) => (
                      <li key={index} className="text-xs text-muted-foreground">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Efficiency Summary Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Máxima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {efficiencyStats ? efficiencyStats.max.toFixed(4) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">km/h por watt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {efficiencyStats ? efficiencyStats.avg.toFixed(4) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">km/h por watt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Datos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {efficiencyStats ? Math.floor(efficiencyStats.totalSamples / 60) : 0}
            </div>
            <p className="text-xs text-muted-foreground">minutos analizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Efficiency Curve Chart */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Curva de Eficiencia por Rangos de Velocidad
          </CardTitle>
          <CardDescription>
            Eficiencia (km/h por watt) en rangos de 5 km/h - Mayor valor indica mejor eficiencia aerodinámica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="rango_velocidad" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Eficiencia (km/h/W)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(4)} km/h/W`, 
                  'Eficiencia'
                ]}
                labelFormatter={(label: string) => `Rango: ${label} km/h`}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow">
                        <p className="font-medium">{`Rango: ${label} km/h`}</p>
                        <p className="text-blue-600">{`Eficiencia: ${data.eficiencia.toFixed(4)} km/h/W`}</p>
                        <p className="text-sm text-gray-600">{`Velocidad media: ${data.velocidad_media} km/h`}</p>
                        <p className="text-sm text-gray-600">{`Potencia media: ${data.potencia_media} W`}</p>
                        <p className="text-xs text-gray-500">{`Muestras: ${data.muestras}s`}</p>
                        <Badge variant="outline" className="mt-1">
                          {getEfficiencyRating(data.eficiencia)}
                        </Badge>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="eficiencia" 
                fill="#8884d8"
                stroke="#6366f1" 
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Standard 40km/h Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Eficiencia Estándar a 40 km/h
            </CardTitle>
            <CardDescription>
              Métrica de referencia para comparación entre actividades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eficiencia_40kmh.eficiencia_estandar_40kmh !== null ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold" style={{ 
                    color: getEfficiencyColor(eficiencia_40kmh.eficiencia_estandar_40kmh) 
                  }}>
                    {eficiencia_40kmh.eficiencia_estandar_40kmh?.toFixed(4)}
                  </div>
                  <div className="text-sm text-muted-foreground">km/h por watt</div>
                  <Badge 
                    variant="secondary" 
                    className="mt-2"
                    style={{ 
                      backgroundColor: getEfficiencyColor(eficiencia_40kmh.eficiencia_estandar_40kmh),
                      color: 'white' 
                    }}
                  >
                    {getEfficiencyRating(eficiencia_40kmh.eficiencia_estandar_40kmh)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Potencia Media</div>
                    <div className="text-muted-foreground">
                      {eficiencia_40kmh.potencia_media_40kmh} W
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Muestras</div>
                    <div className="text-muted-foreground">
                      {eficiencia_40kmh.muestras}s
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="w-full justify-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Datos suficientes para cálculo preciso
                </Badge>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
                <div>
                  <div className="font-medium text-amber-600">Datos Insuficientes</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {eficiencia_40kmh.warning}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Muestras: {eficiencia_40kmh.muestras}s (mínimo requerido: 10s)
                  </div>
                </div>
                <Badge variant="destructive" className="w-full justify-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Necesita más datos cerca de 40 km/h
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Efficiency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Eficiencia</CardTitle>
            <CardDescription>
              Resumen por rangos de velocidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.slice(0, 6).map((rango) => (
                <div key={rango.rango_velocidad} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: getEfficiencyColor(rango.eficiencia) }}
                    />
                    <span className="font-medium text-sm">{rango.rango_velocidad} km/h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium" style={{ color: getEfficiencyColor(rango.eficiencia) }}>
                      {rango.eficiencia.toFixed(3)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      ({Math.floor(rango.muestras / 60)}min)
                    </span>
                  </div>
                </div>
              ))}
              {chartData.length > 6 && (
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  +{chartData.length - 6} rangos más disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Información Técnica</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-medium">Algoritmo de Cálculo:</div>
              <div>• Filtrado: power > 0 && speed > 0</div>
              <div>• Bins de velocidad: 5 km/h</div>
              <div>• Mínimo por rango: 10 segundos</div>
              <div>• Eficiencia = velocidad_media / potencia_media</div>
            </div>
            <div>
              <div className="font-medium">Estándar 40 km/h:</div>
              <div>• Rango: 39.5 - 40.5 km/h</div>
              <div>• Fórmula: 40 / potencia_media</div>
              <div>• Mínimo: 10 segundos de datos</div>
              <div>• Métrica comparativa estándar</div>
            </div>
          </div>
          {efficiencyData.timestamp && (
            <div className="pt-2 border-t">
              <span className="font-medium">Calculado:</span> {new Date(efficiencyData.timestamp).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EfficiencyDashboard;