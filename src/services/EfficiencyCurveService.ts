import type { ActivityPoint } from '@/types/activity';

export interface EfficiencyRange {
  rango_velocidad: string;
  eficiencia: number;
  muestras: number;
  velocidad_media: number;
  potencia_media: number;
}

export interface StandardEfficiency {
  eficiencia_estandar_40kmh: number | null;
  potencia_media_40kmh: number | null;
  muestras: number;
  warning?: string;
}

export interface EfficiencyAnalysis {
  curva_eficiencia: EfficiencyRange[];
  eficiencia_40kmh: StandardEfficiency;
  timestamp: string;
  total_samples: number;
}

export class EfficiencyCurveService {
  /**
   * Calcula curva de eficiencia por rangos de velocidad según spec exacta
   * CRITICAL: Implementar exactamente como especificado por el usuario
   */
  static calculateEfficiencyCurve(activityData: ActivityPoint[]): EfficiencyRange[] {
    // 1. FILTRO EXACTO: power > 0 Y speed > 0
    const validPoints = activityData.filter(point => 
      point.power_watts > 0 && point.speed_kmh > 0
    );

    if (validPoints.length === 0) {
      console.warn('No valid power/speed data points found');
      return [];
    }

    // 2. BINS DE VELOCIDAD EXACTOS: [10-15), [15-20), ..., [55-60)
    const speedRanges = [
      [10, 15], [15, 20], [20, 25], [25, 30], [30, 35],
      [35, 40], [40, 45], [45, 50], [50, 55], [55, 60]
    ];

    const efficiencyRanges: EfficiencyRange[] = [];

    speedRanges.forEach(([min, max]) => {
      // 3. FILTRAR POR RANGO DE VELOCIDAD
      const rangePoints = validPoints.filter(point => {
        const speedKmh = point.speed_kmh; // Ya está en km/h
        return speedKmh >= min && speedKmh < max;
      });

      // 4. VALIDAR MÍNIMO 10 SEGUNDOS DE DATOS
      if (rangePoints.length >= 10) {
        // 5. CALCULAR MEDIAS
        const velocidades = rangePoints.map(p => p.speed_kmh);
        const potencias = rangePoints.map(p => p.power_watts);
        
        const velocidad_media = velocidades.reduce((a, b) => a + b, 0) / velocidades.length;
        const potencia_media = potencias.reduce((a, b) => a + b, 0) / potencias.length;

        // 6. CALCULAR EFICIENCIA: velocidad_media / potencia_media
        const eficiencia = velocidad_media / potencia_media;

        // 7. FORMATO JSON EXACTO REQUERIDO
        efficiencyRanges.push({
          rango_velocidad: `${min}-${max}`,
          eficiencia: Number(eficiencia.toFixed(4)),
          muestras: rangePoints.length,
          velocidad_media: Number(velocidad_media.toFixed(2)),
          potencia_media: Number(potencia_media.toFixed(1))
        });
      }
    });

    // 8. ELIMINAR OUTLIERS EXTREMOS (eficiencia > 1.0 o < 0.01)
    return efficiencyRanges.filter(range => 
      range.eficiencia >= 0.01 && range.eficiencia <= 1.0
    );
  }

  /**
   * Calcula eficiencia estandarizada a 40 km/h según spec exacta
   * CRITICAL: Implementar exactamente como especificado por el usuario
   */
  static calculateStandardEfficiency40kmh(activityData: ActivityPoint[]): StandardEfficiency {
    // 1. FILTRO EXACTO: velocidad entre 39.5 y 40.5 km/h Y power > 0
    const targetPoints = activityData.filter(point => {
      const speedKmh = point.speed_kmh; // Ya está en km/h
      return speedKmh >= 39.5 && speedKmh <= 40.5 && point.power_watts > 0;
    });

    // 2. VALIDAR MÍNIMO 10 SEGUNDOS
    if (targetPoints.length < 10) {
      console.warn("Insufficient data for 40km/h efficiency calculation");
      return {
        eficiencia_estandar_40kmh: null,
        potencia_media_40kmh: null,
        muestras: targetPoints.length,
        warning: "Menos de 10 segundos de datos en el rango 39.5-40.5 km/h"
      };
    }

    // 3. CALCULAR POTENCIA MEDIA
    const potencias = targetPoints.map(p => p.power_watts);
    const potencia_media = potencias.reduce((a, b) => a + b, 0) / potencias.length;

    // 4. CALCULAR EFICIENCIA ESTÁNDAR: 40 / potencia_media
    const eficiencia_estandar_40kmh = 40 / potencia_media;

    return {
      eficiencia_estandar_40kmh: Number(eficiencia_estandar_40kmh.toFixed(4)),
      potencia_media_40kmh: Number(potencia_media.toFixed(1)),
      muestras: targetPoints.length
    };
  }

  /**
   * Combina ambos cálculos para una actividad completa
   */
  static analyzeActivityEfficiency(activityData: ActivityPoint[]): EfficiencyAnalysis {
    return {
      curva_eficiencia: this.calculateEfficiencyCurve(activityData),
      eficiencia_40kmh: this.calculateStandardEfficiency40kmh(activityData),
      timestamp: new Date().toISOString(),
      total_samples: activityData.length
    };
  }

  /**
   * Compara eficiencias entre dos actividades
   */
  static compareEfficiencies(
    activity1: EfficiencyAnalysis,
    activity2: EfficiencyAnalysis
  ): {
    curve_comparison: { rango: string; delta: number }[];
    standard_40kmh_comparison: { delta: number; improvement_percentage: number };
  } {
    const curve_comparison = activity1.curva_eficiencia.map(range1 => {
      const range2 = activity2.curva_eficiencia.find(r => r.rango_velocidad === range1.rango_velocidad);
      return {
        rango: range1.rango_velocidad,
        delta: range2 ? Number((range2.eficiencia - range1.eficiencia).toFixed(4)) : 0
      };
    });

    const eff1 = activity1.eficiencia_40kmh.eficiencia_estandar_40kmh;
    const eff2 = activity2.eficiencia_40kmh.eficiencia_estandar_40kmh;
    
    let standard_40kmh_comparison = { delta: 0, improvement_percentage: 0 };
    
    if (eff1 && eff2) {
      const delta = eff2 - eff1;
      const improvement = ((eff2 - eff1) / eff1) * 100;
      standard_40kmh_comparison = {
        delta: Number(delta.toFixed(4)),
        improvement_percentage: Number(improvement.toFixed(2))
      };
    }

    return {
      curve_comparison,
      standard_40kmh_comparison
    };
  }

  /**
   * Valida la calidad de los datos para análisis de eficiencia
   */
  static validateDataQuality(activityData: ActivityPoint[]): {
    valid: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const validPoints = activityData.filter(p => p.power_watts > 0 && p.speed_kmh > 0);
    const validRatio = validPoints.length / activityData.length;

    if (validRatio < 0.8) {
      warnings.push(`Solo ${(validRatio * 100).toFixed(1)}% de los datos son válidos (power > 0, speed > 0)`);
    }

    const speedRange = {
      min: Math.min(...validPoints.map(p => p.speed_kmh)),
      max: Math.max(...validPoints.map(p => p.speed_kmh))
    };

    if (speedRange.max < 30) {
      warnings.push('Velocidad máxima baja (<30 km/h). Curva de eficiencia limitada.');
      recommendations.push('Incluir esfuerzos a mayor velocidad para análisis completo');
    }

    if (speedRange.min > 15) {
      warnings.push('Velocidad mínima alta (>15 km/h). Faltan datos de baja intensidad.');
      recommendations.push('Incluir períodos de calentamiento/recuperación');
    }

    // Check for 40km/h data
    const points40kmh = validPoints.filter(p => p.speed_kmh >= 39.5 && p.speed_kmh <= 40.5);
    if (points40kmh.length < 10) {
      warnings.push('Datos insuficientes cerca de 40 km/h para métrica estándar');
      recommendations.push('Incluir esfuerzos sostenidos alrededor de 40 km/h');
    }

    return {
      valid: warnings.length < 3, // Considerar válido si hay menos de 3 warnings críticos
      warnings,
      recommendations
    };
  }
}

export default EfficiencyCurveService;