import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Check, Shield, Clock, Download, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function EnhancedCTA() {
  const { connectStrava } = useAuth();

  const steps = [
    {
      number: "1",
      icon: Zap,
      title: "Conecta tu cuenta de Strava",
      description: "30 segundos para sincronizar todas tus actividades",
      color: "from-orange-500 to-red-500"
    },
    {
      number: "2",
      icon: Download,
      title: "Sube tu primera actividad FIT",
      description: "Análisis automático de métricas avanzadas",
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "3",
      icon: Check,
      title: "Recibe análisis completo instantáneo",
      description: "NP, TSS, CdA, balance L/R y más métricas",
      color: "from-green-500 to-emerald-500"
    },
    {
      number: "4",
      icon: ArrowRight,
      title: "Descubre insights revolucionarios",
      description: "Optimiza tu entrenamiento con ciencia",
      color: "from-purple-500 to-violet-500"
    }
  ];

  const trustSignals = [
    {
      icon: Check,
      text: "No se requiere tarjeta de crédito",
      color: "text-green-600"
    },
    {
      icon: Check,
      text: "Análisis completo gratuito",
      color: "text-green-600"
    },
    {
      icon: Shield,
      text: "Datos seguros y privados",
      color: "text-blue-600"
    },
    {
      icon: Download,
      text: "Exportación completa disponible",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="py-24 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Main CTA Card */}
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-white">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 via-amber-600/5 to-yellow-600/5" />
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 opacity-10" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 opacity-10" />

            <CardContent className="relative p-12">
              <div className="text-center space-y-8">
                {/* Badge */}
                <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2 text-sm font-medium">
                  <Zap className="mr-1 h-4 w-4" />
                  ¡Empieza tu Análisis Científico Gratis!
                </Badge>

                {/* Main headline */}
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                    De Strava a
                    <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      {' '}Ciencia Profesional
                    </span>
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    En menos de 2 minutos, transforma tus datos básicos de Strava en análisis 
                    científico profesional que normalmente cuesta €300.
                  </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
                  {steps.map((step, index) => {
                    const IconComponent = step.icon;
                    return (
                      <div key={index} className="relative">
                        <div className="text-center space-y-4">
                          {/* Step number and icon */}
                          <div className="relative">
                            <div className={`mx-auto h-16 w-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg mb-3`}>
                              {step.number}
                            </div>
                            <div className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                          </div>
                          
                          {/* Step content */}
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-2">
                              {step.title}
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {/* Arrow connector (except last item) */}
                        {index < steps.length - 1 && (
                          <div className="hidden lg:block absolute top-8 -right-3 text-gray-300">
                            <ArrowRight className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={connectStrava}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Conectar con Strava
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-10 py-4 text-lg border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50"
                  >
                    Ver Demo Interactivo
                  </Button>
                </div>

                {/* Trust signals */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-gray-100">
                  {trustSignals.map((signal, index) => {
                    const IconComponent = signal.icon;
                    return (
                      <div key={index} className="flex items-center justify-center space-x-2">
                        <IconComponent className={`h-5 w-5 ${signal.color}`} />
                        <span className="text-sm text-gray-700 font-medium">
                          {signal.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom urgency */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg border border-orange-100">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">
                <span className="text-orange-600 font-bold">Gratis para siempre</span> - 
                Análisis que normalmente cuesta €20/mes en TrainingPeaks
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}