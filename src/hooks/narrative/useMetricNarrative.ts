import { useMemo } from 'react';
import type { ActivityData, MetricNarrative } from '@/types/narrative';
import { useRealMetricData } from './useRealMetricData';

// Helper function to calculate percentage change
function calculateChange(current: number, baseline: number): number {
  if (baseline === 0) return 0;
  return ((current - baseline) / baseline) * 100;
}

// Interpretation functions for each metric type
function interpretPowerChange(change: number): string {
  if (change > 5) return "Tu motor está más fuerte";
  if (change > 2) return "Mejora gradual de fuerza";  
  if (change > 0) return "Mantiene buen nivel";
  if (change > -2) return "Nivel estable";
  if (change > -5) return "Ligera disminución";
  return "Necesitas más entrenamiento";
}

function generatePowerContext(change: number, current: number): string {
  if (change > 3) {
    return "Puedes mantener más potencia por más tiempo. Ideal para subidas largas y contra-relojes.";
  } else if (change > 0) {
    return "Tu resistencia se mantiene sólida. Continúa con el entrenamiento actual.";
  } else if (change > -3) {
    return "Mantén la consistencia en tus entrenamientos para recuperar el nivel anterior.";
  } else {
    return "Considera aumentar el volumen de entrenamiento de resistencia.";
  }
}

function interpretAeroChange(change: number): string {
  // For CdA, lower values are better, so we invert the logic
  if (change < -3) return "Cortas el viento mucho mejor";
  if (change < -1) return "Mejora aerodinámica notable";
  if (change < 0) return "Ligera mejora aerodinámica";
  if (change < 1) return "Posición aerodinámica estable";
  if (change < 3) return "Posición menos aerodinámica";
  return "Revisa tu posición en la bici";
}

function generateAeroContext(change: number): string {
  if (change < -2) {
    return "Tu posición mejoró significativamente. Ganarás velocidad a la misma potencia en terreno plano.";
  } else if (change < 0) {
    return "Pequeña mejora en tu eficiencia aerodinámica. Cada detalle cuenta en carreras largas.";
  } else if (change < 2) {
    return "Mantén tu posición actual. Considera ajustes menores si buscas más velocidad.";
  } else {
    return "Tu posición podría mejorarse. Considera una sesión de bike fitting.";
  }
}

function interpretTechniqueChange(change: number): string {
  if (change > 5) return "Pedaleo mucho más suave";
  if (change > 2) return "Técnica mejorada notablemente";
  if (change > 0) return "Pedaleo más consistente";  
  if (change > -2) return "Técnica estable";
  if (change > -5) return "Menos consistencia técnica";
  return "Trabaja en tu técnica de pedaleo";
}

function generateTechniqueContext(change: number): string {
  if (change > 3) {
    return "Menos energía desperdiciada. Tu técnica se vuelve más profesional y eficiente.";
  } else if (change > 0) {
    return "Tu pedaleo se vuelve más fluido. Continúa trabajando en la consistencia.";
  } else if (change > -3) {
    return "Mantén el foco en cadencia constante durante los entrenamientos.";
  } else {
    return "Considera ejercicios específicos de técnica de pedaleo y cadencia.";
  }
}

function interpretEfficiencyChange(change: number): string {
  if (change > 3) return "Menos cansancio, más velocidad";
  if (change > 1) return "Mejor aprovechamiento energético";
  if (change > 0) return "Eficiencia en mejora";
  if (change > -1) return "Eficiencia estable";
  if (change > -3) return "Ligero descenso en eficiencia";
  return "Revisa tu estrategia de entrenamiento";
}

function generateEfficiencyContext(change: number): string {
  if (change > 2) {
    return "Cada pedalada cuenta más. Llegarás menos fatigado a los sprints finales.";
  } else if (change > 0) {
    return "Tu cuerpo se adapta mejor al esfuerzo. Sigues optimizando tu rendimiento.";
  } else if (change > -2) {
    return "Mantén el balance entre intensidad y recuperación en tus entrenamientos.";
  } else {
    return "Considera revisar tu plan de entrenamiento y tiempos de recuperación.";
  }
}

export function useMetricNarrative(useRealData: boolean = true): MetricNarrative[] {
  const realActivityData = useRealMetricData();
  
  return useMemo(() => {
    const activityData = useRealData ? realActivityData : null;
    
    if (!activityData) {
      // Return mock data for demonstration
      return [
        {
          type: 'power',
          icon: '⚡',
          title: 'Fuerza Ciclista',
          value: '287',
          unit: 'W',
          change: 4.5,
          interpretation: "Tu motor está más fuerte",
          context: "Puedes mantener más potencia por más tiempo. Ideal para subidas largas y contra-relojes.",
          history: [280, 275, 282, 278, 285, 283, 287, 287],
          colorScheme: 'power',
          actionable: "Continúa con entrenamientos de resistencia. Tu FTP está en tendencia positiva."
        },
        {
          type: 'aerodynamics',
          icon: '🌪️',
          title: 'Eficiencia Aerodinámica',
          value: '0.324',
          unit: 'm²',
          change: -2.4,
          interpretation: "Cortas el viento mejor",
          context: "Tu posición mejoró. Ganarás ~1.2 km/h a la misma potencia en terreno plano.",
          history: [0.335, 0.340, 0.332, 0.338, 0.328, 0.330, 0.326, 0.324],
          colorScheme: 'aerodynamics',
          actionable: "Excelente progreso aerodinámico. Mantén esta posición en competencias."
        },
        {
          type: 'technique',
          icon: '🔄',
          title: 'Consistencia Técnica',
          value: '91.3',
          unit: '%',
          change: 3.7,
          interpretation: "Pedaleo más suave",
          context: "Menos energía desperdiciada. Tu técnica se vuelve más profesional y eficiente.",
          history: [85.2, 87.1, 88.3, 86.9, 89.1, 90.2, 90.8, 91.3],
          colorScheme: 'technique',
          actionable: "Tu técnica mejora constantemente. Enfócate en mantener cadencia estable."
        },
        {
          type: 'efficiency',
          icon: '🔋',
          title: 'Aprovechamiento Energético',
          value: '94.1',
          unit: '%',
          change: 2.3,
          interpretation: "Menos cansancio, más velocidad",
          context: "Cada pedalada cuenta más. Llegarás menos fatigado a los sprints finales.",
          history: [90.5, 91.2, 92.1, 91.8, 92.8, 93.2, 93.5, 94.1],
          colorScheme: 'efficiency',
          actionable: "Eficiencia excelente. Puedes aumentar ligeramente la intensidad de entrenamientos."
        }
      ];
    }

    const narratives: MetricNarrative[] = [];

    // FTP/Power Narrative
    if (activityData.ftp) {
      const change = calculateChange(activityData.ftp.current, activityData.ftp.average);
      narratives.push({
        type: 'power',
        icon: '⚡',
        title: 'Fuerza Ciclista',
        value: activityData.ftp.current.toString(),
        unit: 'W',
        change: change,
        interpretation: interpretPowerChange(change),
        context: generatePowerContext(change, activityData.ftp.current),
        history: activityData.ftp.history || [],
        colorScheme: 'power',
        actionable: change > 0 
          ? "Continúa con entrenamientos de resistencia. Tu FTP está en tendencia positiva."
          : "Considera aumentar el volumen de trabajo en zona de umbral."
      });
    }

    // Aerodynamics Narrative  
    if (activityData.cda) {
      const change = calculateChange(activityData.cda.current, activityData.cda.average);
      narratives.push({
        type: 'aerodynamics',
        icon: '🌪️',
        title: 'Eficiencia Aerodinámica',
        value: activityData.cda.current.toFixed(3),
        unit: 'm²',
        change: change,
        interpretation: interpretAeroChange(change),
        context: generateAeroContext(change),
        history: activityData.cda.history || [],
        colorScheme: 'aerodynamics',
        actionable: change < 0
          ? "Excelente progreso aerodinámico. Mantén esta posición en competencias."
          : "Considera ajustes en tu posición para mejorar la aerodinámica."
      });
    }

    // Technique Narrative
    if (activityData.technique) {
      const change = calculateChange(activityData.technique.consistency, activityData.technique.average);
      narratives.push({
        type: 'technique',
        icon: '🔄',
        title: 'Consistencia Técnica',
        value: (activityData.technique.consistency * 100).toFixed(1),
        unit: '%',
        change: change,
        interpretation: interpretTechniqueChange(change),
        context: generateTechniqueContext(change),
        history: activityData.technique.history || [],
        colorScheme: 'technique',
        actionable: change > 0
          ? "Tu técnica mejora constantemente. Enfócate en mantener cadencia estable."
          : "Dedica tiempo específico a ejercicios de técnica de pedaleo."
      });
    }

    // Efficiency Narrative
    if (activityData.efficiency) {
      const change = calculateChange(activityData.efficiency.current, activityData.efficiency.average);
      narratives.push({
        type: 'efficiency',
        icon: '🔋',
        title: 'Aprovechamiento Energético',
        value: (activityData.efficiency.current * 100).toFixed(1),
        unit: '%',
        change: change,
        interpretation: interpretEfficiencyChange(change),
        context: generateEfficiencyContext(change),
        history: activityData.efficiency.history || [],
        colorScheme: 'efficiency',
        actionable: change > 0
          ? "Eficiencia excelente. Puedes aumentar ligeramente la intensidad de entrenamientos."
          : "Revisa el balance entre carga de trabajo y recuperación."
      });
    }

    return narratives;
  }, [realActivityData, useRealData]);
}