import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Activity, 
  TrendingUp, 
  Bike, 
  Target, 
  Zap, 
  BarChart3,
  Users,
  Shield,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleViewDemo = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      // Show demo content or redirect to auth
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: <Activity className="h-6 w-6" />,
      title: 'Análisis de Rendimiento',
      description: 'Métricas avanzadas de potencia, velocidad y eficiencia aerodinámica.',
      action: () => navigate(isAuthenticated ? '/analytics' : '/auth')
    },
    {
      icon: <Bike className="h-6 w-6" />,
      title: 'Gestión de Bicicletas',
      description: 'Administra múltiples bicicletas con análisis de componentes.',
      action: () => navigate(isAuthenticated ? '/bikes' : '/auth')
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Bike Fitting',
      description: 'Optimización de posición y medidas para máximo rendimiento.',
      action: () => navigate(isAuthenticated ? '/enhanced-bike-fitting' : '/auth')
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Métricas Avanzadas',
      description: 'CdA, curvas de potencia, análisis de umbral y más.',
      action: () => navigate(isAuthenticated ? '/dashboard' : '/auth')
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Integración Strava',
      description: 'Sincronización automática con tus actividades de Strava.',
      action: () => navigate('/auth')
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Análisis Predictivo',
      description: 'Predicciones de FTP y análisis de carga de entrenamiento.',
      action: () => navigate(isAuthenticated ? '/analytics' : '/auth')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LukSpeed</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/profile')}
                  >
                    Perfil
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/auth')}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    onClick={handleGetStarted}
                  >
                    Empezar Ahora
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              Análisis Profesional de Ciclismo
            </Badge>
            
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Optimiza tu rendimiento ciclista con 
              <span className="text-blue-600"> análisis avanzado</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Conecta con Strava, analiza tus métricas de potencia, aerodinámica y eficiencia. 
              Gestiona múltiples bicicletas y optimiza tu bike fitting con datos precisos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg"
                onClick={handleGetStarted}
              >
                <Activity className="mr-2 h-5 w-5" />
                Empezar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-4 text-lg"
                onClick={handleViewDemo}
              >
                <Play className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">97+</div>
                <div className="text-sm text-gray-600">Métricas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-gray-600">Integrado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">Análisis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para llevar tu ciclismo al siguiente nivel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                onClick={feature.action}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Button variant="ghost" className="p-0 h-auto text-blue-600 hover:text-blue-700">
                    Explorar <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold">
              Integración Completa con Strava
            </h2>
            <p className="text-xl text-blue-100">
              Conecta tu cuenta de Strava y accede instantáneamente a análisis avanzados 
              de todas tus actividades, bicicletas y métricas de rendimiento.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span>Sincronización Automática</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span>Análisis en Tiempo Real</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span>Datos Seguros</span>
              </div>
            </div>

            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4"
              onClick={() => navigate('/auth')}
            >
              <Activity className="mr-2 h-5 w-5" />
              Conectar con Strava
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 border-0 shadow-xl">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                ¿Listo para optimizar tu rendimiento?
              </h2>
              <p className="text-xl text-gray-600">
                Únete a LukSpeed y descubre el potencial completo de tus datos de ciclismo
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-4"
                  onClick={handleGetStarted}
                >
                  Comenzar Análisis Gratuito
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-4"
                  onClick={() => navigate('/auth')}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Ver Características
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">LukSpeed</span>
              </div>
              <p className="text-gray-400">
                Análisis profesional de rendimiento ciclista
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Producto</h3>
              <div className="space-y-2">
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                >
                  Dashboard
                </button>
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate(isAuthenticated ? '/analytics' : '/auth')}
                >
                  Analytics
                </button>
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate(isAuthenticated ? '/bikes' : '/auth')}
                >
                  Bicicletas
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Cuenta</h3>
              <div className="space-y-2">
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate('/auth')}
                >
                  Iniciar Sesión
                </button>
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate('/auth')}
                >
                  Registrarse
                </button>
                {isAuthenticated && (
                  <button 
                    className="block text-gray-400 hover:text-white transition-colors"
                    onClick={() => navigate('/profile')}
                  >
                    Perfil
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Integración</h3>
              <div className="space-y-2">
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate('/auth')}
                >
                  Conectar Strava
                </button>
                <button 
                  className="block text-gray-400 hover:text-white transition-colors"
                  onClick={() => navigate(isAuthenticated ? '/sync' : '/auth')}
                >
                  Sincronización
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LukSpeed. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}