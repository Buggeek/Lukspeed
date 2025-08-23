import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, AlertTriangle, Crown, DollarSign } from 'lucide-react';

export function ComparisonMatrix() {
  const features = [
    {
      category: "Análisis Básico",
      items: [
        { name: "Importación de actividades", lukspeed: "complete", strava: "complete", trainingpeaks: "complete", wko: "complete" },
        { name: "Métricas básicas (velocidad, HR)", lukspeed: "complete", strava: "complete", trainingpeaks: "complete", wko: "complete" },
        { name: "Mapas de ruta", lukspeed: "complete", strava: "complete", trainingpeaks: "complete", wko: "partial" },
      ]
    },
    {
      category: "Métricas Avanzadas de Potencia",
      items: [
        { name: "Potencia Normalizada (NP)", lukspeed: "complete", strava: "none", trainingpeaks: "complete", wko: "complete" },
        { name: "Factor de Intensidad (IF)", lukspeed: "complete", strava: "none", trainingpeaks: "complete", wko: "complete" },
        { name: "Training Stress Score (TSS)", lukspeed: "complete", strava: "none", trainingpeaks: "complete", wko: "complete" },
        { name: "FTP automático por actividad", lukspeed: "complete", strava: "none", trainingpeaks: "partial", wko: "complete" },
        { name: "Curva de potencia crítica", lukspeed: "complete", strava: "partial", trainingpeaks: "complete", wko: "complete" },
      ]
    },
    {
      category: "Análisis Biomecánico",
      items: [
        { name: "Balance L/R automático", lukspeed: "complete", strava: "none", trainingpeaks: "partial", wko: "complete" },
        { name: "Variabilidad de cadencia", lukspeed: "complete", strava: "none", trainingpeaks: "partial", wko: "complete" },
        { name: "Análisis de torque", lukspeed: "complete", strava: "none", trainingpeaks: "none", wko: "partial" },
        { name: "Índice de estabilidad", lukspeed: "complete", strava: "none", trainingpeaks: "none", wko: "none" },
      ]
    },
    {
      category: "Corrección Ambiental",
      items: [
        { name: "Corrección por altitud", lukspeed: "complete", strava: "none", trainingpeaks: "none", wko: "partial" },
        { name: "Cálculo de CdA", lukspeed: "complete", strava: "none", trainingpeaks: "none", wko: "partial" },
        { name: "Densidad del aire", lukspeed: "complete", strava: "none", trainingpeaks: "none", wko: "none" },
        { name: "Corrección por viento", lukspeed: "complete", strava: "none", trainingpeaks: "none", wko: "none" },
      ]
    },
    {
      category: "Análisis Inteligente",
      items: [
        { name: "Clasificación de ciclista (ML)", lukspeed: "complete", strava: "none", trainingpeaks: "none", wko: "none" },
        { name: "Recomendaciones personalizadas", lukspeed: "complete", strava: "partial", trainingpeaks: "partial", wko: "partial" },
        { name: "Análisis de fatiga avanzado", lukspeed: "complete", strava: "none", trainingpeaks: "complete", wko: "complete" },
      ]
    }
  ];

  const platforms = [
    { 
      name: "LukSpeed", 
      key: "lukspeed", 
      price: "GRATIS", 
      priceDetail: "Análisis completo",
      color: "bg-gradient-to-r from-orange-500 to-amber-500",
      textColor: "text-white",
      highlight: true
    },
    { 
      name: "Strava", 
      key: "strava", 
      price: "Gratis/€8", 
      priceDetail: "Premium limitado",
      color: "bg-orange-600",
      textColor: "text-white",
      highlight: false
    },
    { 
      name: "TrainingPeaks", 
      key: "trainingpeaks", 
      price: "$20/mes", 
      priceDetail: "Suscripción mensual",
      color: "bg-blue-600",
      textColor: "text-white",
      highlight: false
    },
    { 
      name: "WKO5", 
      key: "wko", 
      price: "$300", 
      priceDetail: "Pago único",
      color: "bg-purple-600",
      textColor: "text-white",
      highlight: false
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <Check className="h-5 w-5 text-green-600" />;
      case "partial":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "none":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "complete":
        return "Completo";
      case "partial":
        return "Parcial";
      case "none":
        return "No disponible";
      default:
        return "";
    }
  };

  return (
    <div className="py-24 bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
            <Crown className="mr-1 h-3 w-3" />
            Comparación Directa
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            LukSpeed vs
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {' '}la Competencia
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Características que normalmente cuestan €240/año o €300 de pago único, 
            ahora disponibles completamente gratis.
          </p>
        </div>

        {/* Comparison table */}
        <Card className="overflow-hidden shadow-2xl">
          <CardHeader className="bg-white border-b">
            <div className="grid grid-cols-5 gap-4">
              <div className="font-medium text-gray-900">Características</div>
              {platforms.map((platform) => (
                <div key={platform.key} className="text-center">
                  <div className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold ${platform.color} ${platform.textColor} mb-2`}>
                    {platform.highlight && <Crown className="mr-1 h-4 w-4" />}
                    {platform.name}
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${platform.highlight ? 'text-orange-600' : 'text-gray-900'}`}>
                      {platform.price}
                    </div>
                    <div className="text-xs text-gray-600">{platform.priceDetail}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {features.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                {/* Category header */}
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h3 className="font-semibold text-gray-900">{category.category}</h3>
                </div>

                {/* Category items */}
                {category.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex} 
                    className={`grid grid-cols-5 gap-4 px-6 py-4 border-b hover:bg-gray-50 transition-colors ${
                      itemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <div className="font-medium text-gray-900 flex items-center">
                      {item.name}
                    </div>
                    {platforms.map((platform) => (
                      <div key={platform.key} className="flex items-center justify-center">
                        <div className="flex flex-col items-center space-y-1">
                          {getStatusIcon(item[platform.key as keyof typeof item] as string)}
                          <span className="text-xs text-gray-600 hidden sm:block">
                            {getStatusText(item[platform.key as keyof typeof item] as string)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bottom summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <Crown className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-orange-900">LukSpeed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">GRATIS</div>
              <p className="text-sm text-orange-800 mb-4">
                Análisis científico completo, sin limitaciones
              </p>
              <Badge className="bg-green-100 text-green-800">
                Mejor valor del mercado
              </Badge>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-gray-900">TrainingPeaks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">€240/año</div>
              <p className="text-sm text-gray-600 mb-4">
                Análisis avanzado, suscripción requerida
              </p>
              <Badge variant="outline">
                Funcionalidad similar
              </Badge>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-gray-900">WKO5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">€300</div>
              <p className="text-sm text-gray-600 mb-4">
                Software profesional, pago único
              </p>
              <Badge variant="outline">
                Solo Windows/Mac
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-4 text-white shadow-lg">
            <Crown className="mr-3 h-6 w-6" />
            <div className="text-left">
              <div className="text-lg font-bold">¿Por qué pagar €300?</div>
              <div className="text-sm text-orange-100">Obtén análisis profesional gratis con LukSpeed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}