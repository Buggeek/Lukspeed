import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { AdvancedFeatures } from '@/components/home/AdvancedFeatures';
import { ComparisonMatrix } from '@/components/home/ComparisonMatrix';
import { UseCases } from '@/components/home/UseCases';
import { EnhancedCTA } from '@/components/home/EnhancedCTA';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Activity, 
  Users, 
  Shield, 
  ArrowRight,
  BookOpen,
  Award,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LukSpeed</span>
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800 text-xs">
                Pro Analytics
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/profile')}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Perfil
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/auth')}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                  >
                    Empezar Gratis
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Advanced Features */}
      <AdvancedFeatures />

      {/* Scientific Methodology Section */}
      <div className="py-24 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
              <BookOpen className="mr-1 h-3 w-3" />
              Metodología Científica
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Basado en
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {' '}Investigación Científica
              </span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Cada métrica y cálculo está respaldado por investigación académica 
              y validado por científicos del deporte.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Academic Sources */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Fuentes Académicas</h3>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li>• Training and Racing with a Power Meter (Coggan & Allen)</li>
                    <li>• Fórmulas validadas por USA Cycling y UCI</li>
                    <li>• Algoritmos peer-reviewed en sports science</li>
                    <li>• Metodología de WKO5 y TrainingPeaks</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Traceable Calculations */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Cálculos Trazables</h3>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li>• Todas las fórmulas están documentadas</li>
                    <li>• Código open-source disponible</li>
                    <li>• Metodología transparente y verificable</li>
                    <li>• Auditado por expertos en ciclismo</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Continuous Validation */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Validación Continua</h3>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li>• Comparación con gold standards (SRM, Quarq)</li>
                    <li>• Testing con atletas profesionales</li>
                    <li>• Actualizaciones basadas en nueva investigación</li>
                    <li>• Validado por científicos del deporte</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Comparison Matrix */}
      <ComparisonMatrix />

      {/* Use Cases & Testimonials */}
      <UseCases />

      {/* Enhanced CTA */}
      <EnhancedCTA />

      {/* Integration Section */}
      <section className="py-24 bg-gradient-to-r from-orange-600 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              <Zap className="mr-1 h-3 w-3" />
              Integración Total
            </Badge>
            
            <h2 className="text-3xl font-bold sm:text-4xl">
              Sincronización Perfecta con Strava
            </h2>
            <p className="text-xl text-orange-100">
              Conecta tu cuenta de Strava y accede instantáneamente a análisis científicos avanzados 
              de todas tus actividades. Transformamos tus datos básicos en insights profesionales.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Activity className="h-6 w-6" />
                </div>
                <span className="font-semibold">Sincronización Automática</span>
                <span className="text-sm text-orange-100">Todas tus actividades al instante</span>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="font-semibold">Análisis en Tiempo Real</span>
                <span className="text-sm text-orange-100">Métricas avanzadas automáticas</span>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="font-semibold">Datos Seguros</span>
                <span className="text-sm text-orange-100">Privacidad garantizada</span>
              </div>
            </div>

            <Button 
              size="lg" 
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 font-semibold"
              onClick={() => navigate('/auth')}
            >
              <Activity className="mr-2 h-5 w-5" />
              Conectar con Strava Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">LukSpeed</span>
              </div>
              <p className="text-gray-400">
                Análisis científico de ciclismo profesional - Gratis para siempre
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Análisis</h3>
              <div className="space-y-2">
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                >
                  Dashboard Científico
                </button>
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate(isAuthenticated ? '/analytics' : '/auth')}
                >
                  Métricas Avanzadas
                </button>
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate(isAuthenticated ? '/bikes' : '/auth')}
                >
                  Análisis Biomecánico
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Plataforma</h3>
              <div className="space-y-2">
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate('/auth')}
                >
                  Conectar Strava
                </button>
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate('/auth')}
                >
                  Empezar Gratis
                </button>
                {isAuthenticated && (
                  <button 
                    className="block text-gray-400 hover:text-white transition-colors"
                    onClick={() => navigate('/profile')}
                  >
                    Mi Perfil
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Soporte</h3>
              <div className="space-y-2">
                <span className="block text-gray-400">Metodología Científica</span>
                <span className="block text-gray-400">Documentación API</span>
                <span className="block text-gray-400">Código Open Source</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400">
                <p>&copy; 2024 LukSpeed. Análisis científico profesional para todos.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  <Zap className="mr-1 h-3 w-3" />
                  100% Gratis
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  <Shield className="mr-1 h-3 w-3" />
                  Datos Seguros
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}