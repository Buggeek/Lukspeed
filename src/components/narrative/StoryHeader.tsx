import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Award } from 'lucide-react';
import { QuickStat } from './QuickStat';

interface StoryHeaderProps {
  mainInsight?: string;
  secondaryInsights?: string[];
  quickStats?: {
    power: { value: string; change: string };
    aero: { value: string; change: string };
    technique: { value: string; change: string };
  };
}

export function StoryHeader({ 
  mainInsight = "Hoy fuiste un 4.3% más eficiente que tu promedio histórico",
  secondaryInsights = [
    "Tu potencia sostenida de 20 min fue la mejor del mes",
    "Consistencia técnica mejoró significativamente"
  ],
  quickStats = {
    power: { value: "287W", change: "+4.5%" },
    aero: { value: "0.324", change: "-2.4%" },
    technique: { value: "91.3%", change: "+3.7%" }
  }
}: StoryHeaderProps) {
  return (
    <section className="px-4 pt-8 pb-6 bg-gradient-to-br from-white to-orange-50">
      <div className="max-w-md mx-auto text-center">
        
        {/* Main Insight */}
        <div className="mb-6">
          <Badge className="bg-green-100 text-green-800 mb-3">
            <TrendingUp className="mr-1 h-3 w-3" />
            Progreso Destacado
          </Badge>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
            "{mainInsight}"
          </h1>
          
          {/* Secondary Insights */}
          <div className="space-y-2">
            {secondaryInsights.map((insight, index) => (
              <div key={index} className="flex items-center justify-center text-sm text-gray-600">
                <Award className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <QuickStat 
            icon="⚡" 
            value={quickStats.power.value} 
            change={quickStats.power.change} 
            label="Fuerza"
            isPositive={quickStats.power.change.includes('+')}
          />
          <QuickStat 
            icon="🌪️" 
            value={quickStats.aero.value} 
            change={quickStats.aero.change} 
            label="Aero"
            isPositive={quickStats.aero.change.includes('-')} // For CdA, lower is better
          />
          <QuickStat 
            icon="🔄" 
            value={quickStats.technique.value} 
            change={quickStats.technique.change} 
            label="Técnica"
            isPositive={quickStats.technique.change.includes('+')}
          />
        </div>
        
      </div>
    </section>
  );
}