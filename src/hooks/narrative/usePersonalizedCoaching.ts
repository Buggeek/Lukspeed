import { useMemo } from 'react';
import type { MetricNarrative } from '@/types/narrative';

export interface Recommendation {
  id: string;
  icon: string;
  title: string;
  explanation: string;
  expectedImprovement: string;
  trainingPlan: string;
  priority: 'high' | 'medium' | 'low';
  category: 'power' | 'aerodynamics' | 'technique' | 'efficiency';
  actionable: string;
  timeframe: string;
}

export function usePersonalizedCoaching(metrics: MetricNarrative[]): Recommendation[] {
  return useMemo(() => {
    const recommendations: Recommendation[] = [];
    
    // Análisis de FTP/Power
    const ftpMetric = metrics.find(m => m.type === 'power');
    if (ftpMetric) {
      if (ftpMetric.change < 2 && ftpMetric.change > -2) {
        recommendations.push({
          id: 'ftp_plateau',
          icon: '⚡',
          title: 'Rompe tu Meseta de Potencia',
          explanation: 'Tu FTP se mantiene estable. Es momento de estresar el sistema con nuevos estímulos para generar adaptaciones.',
          expectedImprovement: '+8-15W en 4 semanas',
          trainingPlan: 'sweet_spot_progression',
          priority: 'high',
          category: 'power',
          actionable: 'Implementa bloques de Sweet Spot (88-94% FTP) 3x por semana, incrementando 5% cada semana.',
          timeframe: '4 semanas'
        });
      } else if (ftpMetric.change > 5) {
        recommendations.push({
          id: 'ftp_consolidate',
          icon: '🎯',
          title: 'Consolida tu Mejora',
          explanation: 'Excelente progreso en potencia. Ahora enfócate en mantener y aplicar esta nueva capacidad.',
          expectedImprovement: 'Mantener +10-15W consistente',
          trainingPlan: 'threshold_maintenance',
          priority: 'medium',
          category: 'power',
          actionable: 'Incluye intervalos de umbral (95-105% FTP) 2x por semana para fijar las ganancias.',
          timeframe: '3 semanas'
        });
      } else if (ftpMetric.change < -3) {
        recommendations.push({
          id: 'ftp_recovery',
          icon: '🔄',
          title: 'Recupera tu Nivel Base',
          explanation: 'Tu potencia ha descendido. Posible sobreentrenamiento o falta de estímulo específico.',
          expectedImprovement: 'Recuperar 10-20W perdidos',
          trainingPlan: 'base_rebuild',
          priority: 'high',
          category: 'power',
          actionable: 'Reduce intensidad 50% por 1 semana, luego progresión gradual de volumen aeróbico.',
          timeframe: '6 semanas'
        });
      }
    }
    
    // Análisis Aerodinámico
    const aeroMetric = metrics.find(m => m.type === 'aerodynamics');
    if (aeroMetric) {
      if (aeroMetric.change > -1) { // CdA hasn't improved much (lower is better)
        recommendations.push({
          id: 'aero_optimization',
          icon: '🏃‍♂️',
          title: 'Optimización Aerodinámica',
          explanation: 'Tu CdA tiene potencial de mejora significativo. Pequeños ajustes pueden generar grandes ganancias.',
          expectedImprovement: '1-3 km/h más rápido a misma potencia',
          trainingPlan: 'position_optimization',
          priority: 'medium',
          category: 'aerodynamics',
          actionable: 'Sesión de bike fitting + práctica de posición aero 20min cada salida.',
          timeframe: '2 semanas'
        });
      } else if (aeroMetric.change < -3) {
        recommendations.push({
          id: 'aero_maintain',
          icon: '✨',
          title: 'Mantén tu Ventaja Aero',
          explanation: 'Excelente mejora aerodinámica. Conserva esta posición para maximizar tu velocidad.',
          expectedImprovement: 'Mantener 2-3 km/h de ventaja',
          trainingPlan: 'aero_maintenance',
          priority: 'low',
          category: 'aerodynamics',
          actionable: 'Revisa posición cada 2 semanas y mantén flexibilidad con yoga específico.',
          timeframe: 'Continuo'
        });
      }
    }
    
    // Análisis de Técnica
    const techniqueMetric = metrics.find(m => m.type === 'technique');
    if (techniqueMetric) {
      if (techniqueMetric.change < 1) {
        recommendations.push({
          id: 'technique_improvement',
          icon: '🔄',
          title: 'Refina tu Técnica de Pedaleo',
          explanation: 'Tu consistencia técnica puede mejorar. Un pedaleo más suave significa menos fatiga.',
          expectedImprovement: '+5-8% en consistencia',
          trainingPlan: 'cadence_drills',
          priority: 'medium',
          category: 'technique',
          actionable: 'Ejercicios de cadencia: 5x3min a 100-110 RPM, 2 veces por semana.',
          timeframe: '3 semanas'
        });
      } else if (techniqueMetric.change > 4) {
        recommendations.push({
          id: 'technique_advanced',
          icon: '🎖️',
          title: 'Técnica de Elite',
          explanation: 'Tu técnica es excepcional. Explora entrenamientos de potencia específicos.',
          expectedImprovement: 'Aprovechar técnica para +5% potencia',
          trainingPlan: 'power_technique_fusion',
          priority: 'low',
          category: 'technique',
          actionable: 'Intervalos de potencia manteniendo 90+ RPM cadencia consistente.',
          timeframe: '2 semanas'
        });
      }
    }
    
    // Análisis de Eficiencia
    const efficiencyMetric = metrics.find(m => m.type === 'efficiency');
    if (efficiencyMetric) {
      if (efficiencyMetric.change < 1) {
        recommendations.push({
          id: 'efficiency_boost',
          icon: '🔋',
          title: 'Maximiza tu Eficiencia',
          explanation: 'Tu aprovechamiento energético puede optimizarse para rendir más con menos esfuerzo.',
          expectedImprovement: '+3-5% en eficiencia energética',
          trainingPlan: 'metabolic_efficiency',
          priority: 'medium',
          category: 'efficiency',
          actionable: 'Entrenamientos en zona 2 (60-70% FTP) para mejorar metabolismo de grasas.',
          timeframe: '4 semanas'
        });
      }
    }
    
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 3); // Limit to top 3 recommendations
  }, [metrics]);
}