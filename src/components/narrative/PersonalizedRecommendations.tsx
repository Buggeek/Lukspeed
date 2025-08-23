import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react';
import { usePersonalizedCoaching, type Recommendation } from '@/hooks/narrative/usePersonalizedCoaching';
import type { MetricNarrative } from '@/types/narrative';

interface PersonalizedRecommendationsProps {
  metrics: MetricNarrative[];
}

export function PersonalizedRecommendations({ metrics }: PersonalizedRecommendationsProps) {
  const recommendations = usePersonalizedCoaching(metrics);

  if (!recommendations.length) {
    return (
      <section className="mt-8 px-4">
        <Card className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            ¡Rendimiento Óptimo!
          </h3>
          <p className="text-green-700 text-sm">
            Todas tus métricas están en excelente estado. Mantén tu entrenamiento actual.
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mt-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          🎯 Recomendaciones Personalizadas
        </h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          IA Coach
        </Badge>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard 
            key={recommendation.id} 
            recommendation={recommendation}
            isFirst={index === 0}
          />
        ))}
      </div>
      
      {/* Summary Card */}
      <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <div className="text-2xl mb-3">📈</div>
          <h3 className="font-semibold text-blue-900 mb-2">
            Potencial de Mejora Estimado
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-blue-700 font-medium">Potencia</div>
              <div className="text-blue-600">+8-15W</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium">Velocidad</div>
              <div className="text-blue-600">+1-2 km/h</div>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3">
            Siguiendo las recomendaciones durante 4-6 semanas
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  isFirst?: boolean;
}

function RecommendationCard({ recommendation, isFirst }: RecommendationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'power':
        return 'from-orange-500 to-red-500';
      case 'aerodynamics':
        return 'from-teal-500 to-cyan-500';
      case 'technique':
        return 'from-purple-500 to-indigo-500';
      case 'efficiency':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <Card className={`overflow-hidden border-0 shadow-md ${isFirst ? 'ring-2 ring-blue-200' : ''}`}>
      <CardContent className="p-0">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getCategoryColor(recommendation.category)} p-4 text-white`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{recommendation.icon}</span>
              <Badge className={`${getPriorityColor(recommendation.priority)} text-xs`}>
                {recommendation.priority === 'high' ? 'Prioridad Alta' : 
                 recommendation.priority === 'medium' ? 'Prioridad Media' : 'Opcional'}
              </Badge>
            </div>
            {isFirst && (
              <Badge className="bg-white/20 text-white border-white/30">
                Recomendado
              </Badge>
            )}
          </div>
          <h3 className="font-bold text-lg mb-1">
            {recommendation.title}
          </h3>
          <p className="text-white/90 text-sm">
            {recommendation.explanation}
          </p>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Expected Improvement */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Mejora Esperada</span>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
              <div className="text-green-800 font-medium">
                {recommendation.expectedImprovement}
              </div>
              <div className="text-green-600 text-xs mt-1">
                en {recommendation.timeframe}
              </div>
            </div>
          </div>

          {/* Actionable Steps */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Plan de Acción</span>
            </div>
            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
              {recommendation.actionable}
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{recommendation.timeframe}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Plan: {recommendation.trainingPlan}</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            size="sm"
          >
            <Target className="mr-2 h-4 w-4" />
            Ver Plan Detallado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}