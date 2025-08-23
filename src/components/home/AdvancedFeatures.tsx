import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Battery, 
  Settings, 
  TrendingUp, 
  Heart, 
  Activity, 
  Thermometer, 
  Brain,
  Zap,
  Target,
  BarChart3,
  Wind,
  User
} from 'lucide-react';

export function AdvancedFeatures() {
  const featureCategories = [
    {
      icon: Battery,
      title: "Métricas de Entrenamiento Avanzadas",
      description: "Análisis científico automático de tus datos de potencia",
      color: "from-orange-500 to-red-500",
      features: [
        "FTP estimado por actividad (3 métodos científicos)",
        "Potencia Normalizada (NP) y Factor de Intensidad (IF)",
        "Training Stress Score (TSS) automático",
        "Distribución precisa de zonas de potencia (Z1-Z6)",
        "Curva de potencia crítica (1s a 60min)"
      ]
    },
    {
      icon: Settings,
      title: "Análisis Biomecánico Único",
      description: "Insights imposibles de obtener en otras plataformas",
      color: "from-blue-500 to-cyan-500",
      features: [
        "Balance potencia izquierda/derecha",
        "Variabilidad de cadencia y torque",
        "Índice de estabilidad biomecánica",
        "Detección de microaceleraciones",
        "Análisis de simetría por segmentos"
      ]
    },
    {
      icon: TrendingUp,
      title: "Eficiencia Científica",
      description: "Optimización aerodinámica y de rendimiento",
      color: "from-green-500 to-emerald-500",
      features: [
        "Eficiencia aerodinámica (CdA calculation)",
        "Análisis por tipo de terreno",
        "Corrección por densidad del aire y altitud",
        "Watts por km/h optimizado",
        "Detección de pérdidas de eficiencia"
      ]
    },
    {
      icon: Heart,
      title: "Análisis Cardíaco Avanzado",
      description: "Métricas cardiovasculares y de fatiga",
      color: "from-pink-500 to-rose-500",
      features: [
        "Deriva cardíaca (HR drift detection)",
        "Watts por latido (eficiencia cardiovascular)",
        "Desacoplamiento aeróbico automático",
        "HRR utilizado (% del rango máximo)",
        "Análisis de fatiga en tiempo real"
      ]
    },
    {
      icon: Thermometer,
      title: "Corrección Ambiental",
      description: "Análisis científico de condiciones externas",
      color: "from-purple-500 to-violet-500",
      features: [
        "Densidad del aire calculada automáticamente",
        "Potencia corregida por altitud y clima",
        "Penalización por viento aparente",
        "Impacto de temperatura y humedad",
        "Normalización por condiciones ideales"
      ]
    },
    {
      icon: Brain,
      title: "Perfil Científico del Ciclista",
      description: "ML-based analysis y recomendaciones personalizadas",
      color: "from-indigo-500 to-blue-600",
      features: [
        "Clasificación automática (sprinter/escalador/rodador)",
        "Análisis de fatiga energética",
        "Impacto estimado del equipamiento",
        "Recomendaciones de entrenamiento personalizadas",
        "Predicción de rendimiento por condiciones"
      ]
    }
  ];

  return (
    <div className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-800">
            <Zap className="mr-1 h-3 w-3" />
            Características Profesionales
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Análisis Científico
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {' '}de Nivel Profesional
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Métricas avanzadas utilizadas por científicos del deporte, equipos profesionales y 
            ciclistas de élite. Ahora disponibles gratuitamente para todos.
          </p>
        </div>

        {/* Features grid */}
        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {featureCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  
                  <CardHeader className="relative">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.color} text-white mb-4 w-fit`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {category.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative">
                    <ul className="space-y-3">
                      {category.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <div className={`mt-1 h-2 w-2 rounded-full bg-gradient-to-r ${category.color} flex-shrink-0`} />
                          <span className="ml-3 text-sm text-gray-700 font-medium">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center rounded-full bg-orange-50 px-6 py-3 text-sm font-medium text-orange-800">
            <Target className="mr-2 h-4 w-4" />
            <span>Todas estas métricas se calculan automáticamente en cada actividad</span>
          </div>
        </div>
      </div>
    </div>
  );
}