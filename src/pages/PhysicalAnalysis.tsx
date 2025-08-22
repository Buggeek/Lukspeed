import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, Zap, Download, RefreshCw, Share2, 
  Info, AlertTriangle, CheckCircle
} from 'lucide-react';
import PowerBreakdownDashboard from '@/components/PowerBreakdownDashboard';
import AerodynamicComparison from '@/components/AerodynamicComparison';
import { usePhysicalPower } from '@/hooks/usePhysicalPower';
import { useActivityData } from '@/hooks/useActivityData';

export const PhysicalAnalysis: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  
  const { physicalData, isLoading, error, recalculate, saveToDatabase } = usePhysicalPower({ 
    activityId,
    autoCalculate: true
  });
  
  const { activityData, isLoading: activityLoading } = useActivityData({ 
    activityId 
  });

  const handleSaveToDatabase = async () => {
    try {
      await saveToDatabase();
      // Show success notification
    } catch (err) {
      console.error('Error saving to database:', err);
      // Show error notification
    }
  };

  const handleExportData = () => {
    if (!physicalData) return;
    
    const exportData = {
      activity_id: activityId,
      physical_analysis: physicalData,
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physical-analysis-${activityId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!activityId) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ID de actividad no especificado. Por favor, seleccione una actividad válida.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/activities">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8 text-blue-600" />
              Análisis Físico de Potencia
            </h1>
            <p className="text-muted-foreground">
              Descomposición científica de las componentes físicas de potencia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            ID: {activityId.slice(0, 8)}...
          </Badge>
          
          {physicalData && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSaveToDatabase}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={recalculate}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Recalcular
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status and Error Handling */}
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Error en el análisis físico:</div>
            <div className="text-sm mt-1">{error}</div>
          </AlertDescription>
        </Alert>
      )}

      {isLoading && !physicalData && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Calculando componentes físicas de potencia... Esto puede tomar unos segundos.
          </AlertDescription>
        </Alert>
      )}

      {physicalData && !physicalData.validation.components_realistic && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Advertencia de Calidad:</div>
            <div className="text-sm mt-1">
              Algunos componentes físicos están fuera de rangos típicos. 
              Verifique la calidad de los datos de entrada y condiciones ambientales.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {physicalData && physicalData.validation.components_realistic && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Análisis Completado:</div>
            <div className="text-sm mt-1">
              Descomposición física calculada exitosamente con validación de rangos realistas.
              Confianza: {(physicalData.estimates.confidence_score * 100).toFixed(0)}%
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard */}
      <PowerBreakdownDashboard 
        physicalData={physicalData}
        activityData={activityData}
        isLoading={isLoading || activityLoading}
      />

      {/* Aerodynamic Comparison */}
      {physicalData && (
        <AerodynamicComparison 
          currentData={physicalData}
          onLoadComparison={(configId) => {
            console.log('Loading comparison config:', configId);
            // Implementation for loading comparison data
          }}
        />
      )}

      {/* Technical Information */}
      {physicalData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Técnica del Análisis</CardTitle>
            <CardDescription>
              Detalles sobre los cálculos y metodología utilizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Parámetros del Sistema</h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Masa total del sistema:</span>
                    <span className="font-medium">{physicalData.mass_data.total_mass.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Densidad del aire:</span>
                    <span className="font-medium">{physicalData.conditions.air_density.toFixed(3)} kg/m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temperatura estimada:</span>
                    <span className="font-medium">{physicalData.conditions.temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Presión atmosférica:</span>
                    <span className="font-medium">{(physicalData.conditions.pressure / 1000).toFixed(1)} kPa</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Calidad de la Estimación</h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Segmentos válidos CdA:</span>
                    <span className="font-medium">{physicalData.estimates.segments_used_CdA}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Segmentos válidos Crr:</span>
                    <span className="font-medium">{physicalData.estimates.segments_used_Crr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error RMS conservación:</span>
                    <span className="font-medium">{physicalData.validation.power_conservation_error.toFixed(1)} W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Puntos de datos analizados:</span>
                    <span className="font-medium">{physicalData.components.power_aero.length.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">Metodología de Cálculo</h4>
              <div className="text-xs text-muted-foreground space-y-2">
                <div>
                  <strong>Descomposición física:</strong> La potencia total se descompone en tres componentes 
                  usando las ecuaciones fundamentales de la física del ciclismo.
                </div>
                <div>
                  <strong>Estimación CdA:</strong> Se utilizan segmentos planos (&lt;2% gradiente) y rápidos 
                  (&gt;30 km/h) para estimar el coeficiente aerodinámico mediante regresión estadística.
                </div>
                <div>
                  <strong>Estimación Crr:</strong> Se utilizan segmentos muy planos (&lt;1% gradiente) y 
                  velocidad moderada (15-25 km/h) para minimizar efectos aerodinámicos.
                </div>
                <div>
                  <strong>Validación:</strong> Los resultados se validan contra rangos físicamente realistas 
                  y se calcula un score de confianza basado en la calidad y cantidad de datos.
                </div>
              </div>
            </div>

            {physicalData.timestamp && (
              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Análisis calculado:</span>
                  <span>{new Date(physicalData.timestamp).toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          LukSpeed Physical Power Analysis • Cálculos basados en principios físicos fundamentales • 
          Comparable con TrainingPeaks WKO5 y Golden Cheetah
        </p>
      </div>
    </div>
  );
};

export default PhysicalAnalysis;