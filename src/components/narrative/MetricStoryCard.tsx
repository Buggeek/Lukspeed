import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, Info } from 'lucide-react';
import { VariationBadge } from './VariationBadge';
import { SparklineChart } from './SparklineChart';
import type { MetricNarrative } from '@/types/narrative';

interface MetricStoryCardProps {
  metric: MetricNarrative;
}

export function MetricStoryCard({ metric }: MetricStoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getColorScheme = (type: string) => {
    switch (type) {
      case 'power':
        return {
          gradient: 'from-orange-500 to-red-500',
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          chart: '#FF6B35'
        };
      case 'aerodynamics':
        return {
          gradient: 'from-teal-500 to-cyan-500',
          bg: 'bg-teal-50',
          text: 'text-teal-700',
          chart: '#00C4A7'
        };
      case 'technique':
        return {
          gradient: 'from-purple-500 to-indigo-500',
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          chart: '#8B5CF6'
        };
      case 'efficiency':
        return {
          gradient: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50',
          text: 'text-green-700',
          chart: '#10B981'
        };
      default:
        return {
          gradient: 'from-gray-500 to-slate-500',
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          chart: '#6B7280'
        };
    }
  };

  const colors = getColorScheme(metric.type);
  
  return (
    <Card 
      className="mx-4 mb-4 cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-98 border-0 shadow-md"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-5">
        
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-2xl`}>
              {metric.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                {metric.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  {metric.value}
                </span>
                <span className="text-sm text-gray-500">
                  {metric.unit}
                </span>
                <VariationBadge change={metric.change} size="sm" />
              </div>
            </div>
          </div>
          <ChevronDown 
            className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
          />
        </div>

        {/* Interpretation */}
        <div className="mb-4">
          <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            "{metric.interpretation}"
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {metric.context}
          </p>
        </div>

        {/* Sparkline */}
        <div className="mb-2">
          <SparklineChart 
            data={metric.history} 
            height={40} 
            color={colors.chart}
            className="mb-2"
          />
          <div className="text-xs text-gray-500 text-center">
            Evolución últimas 8 semanas
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
            <div className={`p-4 rounded-xl ${colors.bg} border-l-4 border-l-current ${colors.text}`}>
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">¿Qué significa esto?</h4>
                  <p className="text-sm leading-relaxed">
                    {metric.actionable || 
                     `Esta métrica indica tu progreso en ${metric.title.toLowerCase()}. 
                      Continúa monitoreando para ver tendencias a largo plazo.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}