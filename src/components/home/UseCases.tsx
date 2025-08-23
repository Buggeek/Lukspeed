import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Quote, Star, Trophy, Target, BarChart3 } from 'lucide-react';

export function UseCases() {
  const testimonials = [
    {
      name: "María González",
      role: "Cat 2 Road Racing",
      avatar: "MG",
      quote: "Descubrí que mi FTP real era 15W mayor usando el análisis de 20min de LukSpeed. El análisis biomecánico me ayudó a corregir un desbalance L/R del 8%.",
      metric: "FTP +15W",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500"
    },
    {
      name: "Carlos Rodríguez",
      role: "Triatleta Amateur",
      avatar: "CR",
      quote: "Las métricas de TSS y NP me permiten planificar mi entrenamiento como un pro, pero sin pagar €300 por WKO5.",
      metric: "€300 ahorrados",
      icon: Target,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Dr. Elena Martín",
      role: "Sports Scientist",
      avatar: "EM",
      quote: "Por fin puedo exportar todos mis datos en formato científico. Las fórmulas están documentadas y son trazables.",
      metric: "100% trazable",
      icon: BarChart3,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const useCaseCategories = [
    {
      title: "Ciclistas Competitivos",
      description: "Análisis de rendimiento para mejorar resultados en carreras",
      benefits: [
        "Optimización de FTP y umbrales",
        "Análisis de potencia crítica",
        "Detección de desbalances biomecánicos",
        "Planificación científica del entrenamiento"
      ],
      icon: Trophy,
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Entusiastas del Entrenamiento",
      description: "Herramientas profesionales sin costos profesionales",
      benefits: [
        "Métricas avanzadas gratuitas",
        "Análisis automatizado de actividades",
        "Seguimiento de progreso científico",
        "Recomendaciones personalizadas"
      ],
      icon: Target,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Analistas de Datos",
      description: "Acceso completo a datos y metodología científica",
      benefits: [
        "Exportación de datos completa",
        "Fórmulas documentadas y verificables",
        "API para análisis personalizado",
        "Código abierto y transparente"
      ],
      icon: BarChart3,
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="py-24 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800">
            <Star className="mr-1 h-3 w-3" />
            Casos de Éxito
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Resultados
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {' '}Comprobados
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Ciclistas de todos los niveles están mejorando su rendimiento con 
            análisis científico que antes solo estaba disponible para equipos profesionales.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-20">
          {testimonials.map((testimonial, index) => {
            const IconComponent = testimonial.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.color} opacity-5`} />
                
                <CardHeader className="relative">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={`bg-gradient-to-br ${testimonial.color} text-white font-bold`}>
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <div className="flex items-start space-x-3">
                    <Quote className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                    <blockquote className="text-gray-700 italic leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${testimonial.color} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-gray-900">{testimonial.metric}</span>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Use case categories */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {useCaseCategories.map((category, index) => {
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
                  <p className="text-gray-600">
                    {category.description}
                  </p>
                </CardHeader>

                <CardContent className="relative">
                  <ul className="space-y-3">
                    {category.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start">
                        <div className={`mt-1 h-2 w-2 rounded-full bg-gradient-to-r ${category.color} flex-shrink-0`} />
                        <span className="ml-3 text-sm text-gray-700 font-medium">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
            <div className="text-sm text-gray-600">Mejora en FTP detectada</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">€300</div>
            <div className="text-sm text-gray-600">Promedio ahorrado vs WKO5</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Análisis automático</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
            <div className="text-sm text-gray-600">Metodología científica</div>
          </div>
        </div>
      </div>
    </div>
  );
}