import React from 'react';
import { StoryHeader } from '@/components/narrative/StoryHeader';
import { MetricStoryCard } from '@/components/narrative/MetricStoryCard';
import { useMetricNarrative } from '@/hooks/narrative/useMetricNarrative';
import { PersonalizedRecommendations } from '@/components/narrative/PersonalizedRecommendations';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NarrativeDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Use real data if authenticated, otherwise mock data
  const metrics = useMetricNarrative(isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🚴‍♂️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Narrativo
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            Conecta tu cuenta para ver el análisis personalizado de tu progreso ciclista
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
          >
            Conectar con Strava
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      
      {/* Navigation Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900">Tu Progreso</h1>
              <p className="text-xs text-gray-500">Última actividad hace 2 horas</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Calendar className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Story Header - Main narrative summary */}
      <StoryHeader />
      
      {/* Metric Story Cards - Individual narratives */}
      <div className="pb-8">
        <div className="px-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Análisis Detallado
          </h2>
          <p className="text-sm text-gray-600">
            Toca cada métrica para conocer más detalles
          </p>
        </div>
        
        <div className="space-y-0">
          {metrics.map((metric, index) => (
            <MetricStoryCard 
              key={`${metric.type}-${index}`} 
              metric={metric} 
            />
          ))}
        </div>
      </div>

      {/* Personalized Recommendations */}
      <PersonalizedRecommendations metrics={metrics} />

      {/* Action Recommendations */}
      <div className="px-4 pb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Próximo Objetivo
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Basado en tu progreso actual, te recomendamos enfocar en:
            </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>Mantener entrenamientos de resistencia para consolidar FTP</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                <span>Conservar posición aerodinámica actual en competencias</span>
              </div>
            </div>
            <Button 
              className="mt-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
              onClick={() => navigate('/training-plan')}
            >
              Ver Plan de Entrenamiento
            </Button>
          </div>
        </div>
      </div>
      
    </div>
  );
}