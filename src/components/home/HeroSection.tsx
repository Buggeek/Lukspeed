import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Activity, Zap, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function HeroSection() {
  const { connectStrava } = useAuth();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 px-6 py-24 sm:py-32 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.orange.100),transparent)] opacity-20" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-orange-600/10 ring-1 ring-orange-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-20">
          <div className="relative z-10 mx-auto max-w-2xl lg:col-span-7 lg:max-w-none lg:pt-6 xl:col-span-6">
            {/* Badge */}
            <Badge variant="secondary" className="mb-6 bg-orange-100 text-orange-800 hover:bg-orange-200">
              <Zap className="mr-1 h-3 w-3" />
              Análisis Científico Profesional - Gratis
            </Badge>

            {/* Main headline */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-5xl xl:text-6xl">
              Análisis de Ciclismo{' '}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Más Allá de Strava
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Descubre tu verdadero potencial con métricas científicas avanzadas que revelan insights 
              imposibles de obtener en otras plataformas. Análisis profesional sin costo.
            </p>

            {/* Key differentiators */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Activity className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 sm:text-base">
                  Normalized Power & TSS automático
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Target className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 sm:text-base">
                  Análisis biomecánico profesional
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 sm:text-base">
                  Corrección ambiental automática
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Zap className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 sm:text-base">
                  Perfil científico personalizado
                </span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8"
                onClick={connectStrava}
              >
                Conecta con Strava - Análisis Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                Ver Demo Interactivo
              </Button>
            </div>

            {/* Trust signals */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="mr-2 text-green-500">✓</span>
                No se requiere tarjeta
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-green-500">✓</span>
                Análisis completo gratuito
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-green-500">✓</span>
                Datos seguros y privados
              </div>
            </div>
          </div>

          {/* Right side - Visual elements */}
          <div className="relative mt-16 sm:mt-24 lg:col-span-5 lg:mt-0 xl:col-span-6">
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              {/* Dashboard preview */}
              <div className="relative rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-900/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Análisis Científico</h3>
                  <Badge className="bg-green-100 text-green-800">Live</Badge>
                </div>
                
                {/* Mock metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-orange-50 p-4">
                    <div className="text-2xl font-bold text-orange-600">284W</div>
                    <div className="text-sm text-gray-600">Normalized Power</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="text-2xl font-bold text-blue-600">0.89</div>
                    <div className="text-sm text-gray-600">Intensity Factor</div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="text-2xl font-bold text-green-600">87</div>
                    <div className="text-sm text-gray-600">TSS Score</div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4">
                    <div className="text-2xl font-bold text-purple-600">2.1%</div>
                    <div className="text-sm text-gray-600">L/R Balance</div>
                  </div>
                </div>

                {/* Power curve mini chart */}
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Curva de Potencia</div>
                  <div className="flex items-end space-x-1 h-16">
                    {[0.9, 0.95, 1.0, 0.85, 0.7, 0.6, 0.45, 0.3].map((height, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-sm"
                        style={{ height: `${height * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1s</span>
                    <span>5s</span>
                    <span>30s</span>
                    <span>1m</span>
                    <span>5m</span>
                    <span>20m</span>
                    <span>60m</span>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                FTP: 320W ↗️
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                CdA: 0.24 m²
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}