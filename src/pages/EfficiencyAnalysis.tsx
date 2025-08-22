import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, Target, TrendingUp } from 'lucide-react';
import { EfficiencyDashboard } from '@/components/EfficiencyDashboard';
import { useActivityData } from '@/hooks/useActivityData';
import { useEfficiency } from '@/hooks/useEfficiency';
import { useAuth } from '@/hooks/useAuth';

export default function EfficiencyAnalysisPage() {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: activityData,
    loading: dataLoading,
    error: dataError
  } = useActivityData({
    activityId: activityId || '',
    smoothingWindow: 5,
    autoRefresh: false
  });

  const {
    efficiencyData,
    isLoading: efficiencyLoading,
    error: efficiencyError,
    recalculate,
    saveToDatabase,
    dataQuality
  } = useEfficiency({
    activityId,
    activityData,
    autoCalculate: true
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleRecalculate = async () => {
    try {
      await recalculate();
      // Optionally save to database
      if (efficiencyData) {
        await saveToDatabase();
      }
    } catch (error) {
      console.error('Error recalculating efficiency:', error);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Debes iniciar sesión para ver el análisis de eficiencia.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activityId) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">ID de actividad no encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = dataLoading || efficiencyLoading;
  const error = dataError || efficiencyError;

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calculator className="h-8 w-8" />
              Análisis de Eficiencia
            </h1>
            <p className="text-muted-foreground">
              Cálculos precisos de eficiencia aerodinámica por rangos de velocidad
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRecalculate}
            disabled={isLoading}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Recalcular
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="space-y-2">
                <p className="font-medium">Calculando Eficiencia</p>
                <p className="text-sm text-muted-foreground">
                  Procesando curvas por rangos de velocidad y eficiencia estándar a 40 km/h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Efficiency Analysis Results */}
      {!isLoading && (
        <>
          {/* Quick Stats */}
          {efficiencyData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rangos Analizados</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {efficiencyData.curva_eficiencia.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    de 10 posibles rangos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eficiencia Máxima</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {efficiencyData.curva_eficiencia.length > 0 
                      ? Math.max(...efficiencyData.curva_eficiencia.map(r => r.eficiencia)).toFixed(4)
                      : 'N/A'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    km/h por watt
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estándar 40 km/h</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {efficiencyData.eficiencia_40kmh.eficiencia_estandar_40kmh?.toFixed(4) || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {efficiencyData.eficiencia_40kmh.muestras}s de datos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Datos Procesados</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(efficiencyData.total_samples / 60)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    minutos de actividad
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Efficiency Dashboard */}
          <EfficiencyDashboard 
            efficiencyData={efficiencyData}
            dataQuality={dataQuality}
          />

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información sobre los Cálculos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Curva de Eficiencia por Rangos:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Se analizan bins de 5 km/h: [10-15), [15-20), etc.</li>
                    <li>• Solo datos válidos: potencia > 0 y velocidad > 0</li>
                    <li>• Mínimo 10 segundos por rango para inclusión</li>
                    <li>• Eficiencia = velocidad_media ÷ potencia_media</li>
                    <li>• Valores típicos: 0.2-0.6 km/h por watt</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Eficiencia Estándar a 40 km/h:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Filtra velocidades entre 39.5-40.5 km/h</li>
                    <li>• Calcula potencia media en ese rango</li>
                    <li>• Fórmula: 40 ÷ potencia_media</li>
                    <li>• Métrica estándar para comparación</li>
                    <li>• Requiere mínimo 10 segundos de datos</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Interpretación:</strong> Mayor eficiencia indica mejor posición aerodinámica, 
                  menor resistencia al viento, y/o mejor técnica de pedaleo. Los valores pueden variar 
                  según condiciones del terreno, viento, y configuración de la bicicleta.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}