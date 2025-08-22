import { supabase } from '@/lib/supabase';
import type { TrainingZone, TrainingZones } from '@/types/powerAnalysis';

export class ZoneCalculator {
  private static instance: ZoneCalculator;
  
  public static getInstance(): ZoneCalculator {
    if (!ZoneCalculator.instance) {
      ZoneCalculator.instance = new ZoneCalculator();
    }
    return ZoneCalculator.instance;
  }

  /**
   * Calculate training zones using Coggan 7-zone model
   */
  public calculateCogganZones(ftp: number): TrainingZone[] {
    const zones: TrainingZone[] = [
      {
        zone: 1,
        name: 'Active Recovery',
        min: 0,
        max: Math.round(ftp * 0.55),
        color: '#4ade80',
        description: 'Very easy spinning, active recovery',
        targetPercentage: 15
      },
      {
        zone: 2,
        name: 'Endurance',
        min: Math.round(ftp * 0.56),
        max: Math.round(ftp * 0.75),
        color: '#22d3ee',
        description: 'Base endurance training, aerobic development',
        targetPercentage: 35
      },
      {
        zone: 3,
        name: 'Tempo',
        min: Math.round(ftp * 0.76),
        max: Math.round(ftp * 0.90),
        color: '#fbbf24',
        description: 'Steady, moderately hard effort',
        targetPercentage: 20
      },
      {
        zone: 4,
        name: 'Lactate Threshold',
        min: Math.round(ftp * 0.91),
        max: Math.round(ftp * 1.05),
        color: '#f97316',
        description: 'Sustainable hard effort, FTP range',
        targetPercentage: 15
      },
      {
        zone: 5,
        name: 'VO2max',
        min: Math.round(ftp * 1.06),
        max: Math.round(ftp * 1.20),
        color: '#ef4444',
        description: 'Maximal aerobic power intervals',
        targetPercentage: 8
      },
      {
        zone: 6,
        name: 'Anaerobic Capacity',
        min: Math.round(ftp * 1.21),
        max: Math.round(ftp * 1.50),
        color: '#a855f7',
        description: 'Short, high-intensity efforts',
        targetPercentage: 5
      },
      {
        zone: 7,
        name: 'Neuromuscular Power',
        min: Math.round(ftp * 1.51),
        max: 9999,
        color: '#ec4899',
        description: 'All-out sprint power',
        targetPercentage: 2
      }
    ];

    return zones;
  }

  /**
   * Auto-calibrate zones based on power data distribution
   */
  public async autoCalibrate(
    userId: string,
    powerData: number[],
    baseFTP: number
  ): Promise<TrainingZones> {
    try {
      // Use base Coggan zones as starting point
      const zones = this.calculateCogganZones(baseFTP);
      
      // Analyze power distribution to detect drift
      const driftAnalysis = this.analyzeZoneDrift(powerData, zones);
      
      // Store calibrated zones
      const { data, error } = await supabase
        .from('app_dbd0941867_training_zones')
        .upsert({
          user_id: userId,
          zone_1_min: zones[0].min,
          zone_1_max: zones[0].max,
          zone_2_min: zones[1].min,
          zone_2_max: zones[1].max,
          zone_3_min: zones[2].min,
          zone_3_max: zones[2].max,
          zone_4_min: zones[3].min,
          zone_4_max: zones[3].max,
          zone_5_min: zones[4].min,
          zone_5_max: zones[4].max,
          zone_6_min: zones[5].min,
          zone_6_max: zones[5].max,
          zone_7_min: zones[6].min,
          zone_7_max: zones[6].max,
          ftp_base: baseFTP,
          auto_calculated: true,
          last_calibration: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        zones,
        ftp_base: baseFTP,
        auto_calculated: true,
        last_calibration: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error auto-calibrating zones:', error);
      throw error;
    }
  }

  /**
   * Classify power values into zones
   */
  public classifyPower(power: number, zones: TrainingZone[]): number {
    for (const zone of zones) {
      if (power >= zone.min && power <= zone.max) {
        return zone.zone;
      }
    }
    return zones[zones.length - 1].zone; // Default to highest zone
  }

  /**
   * Calculate zone distribution for a workout
   */
  public calculateZoneDistribution(
    powerData: number[],
    zones: TrainingZone[]
  ): { zone: number; time_seconds: number; percentage: number }[] {
    const zoneCounts = Array(zones.length).fill(0);
    
    powerData.forEach(power => {
      const zone = this.classifyPower(power, zones);
      zoneCounts[zone - 1]++;
    });

    const totalPoints = powerData.length;
    
    return zoneCounts.map((count, index) => ({
      zone: index + 1,
      time_seconds: count,
      percentage: totalPoints > 0 ? (count / totalPoints) * 100 : 0
    }));
  }

  /**
   * Detect zone drift over time
   */
  private analyzeZoneDrift(
    powerData: number[],
    zones: TrainingZone[]
  ): {
    drift_detected: boolean;
    drift_magnitude: number;
    recalibration_needed: boolean;
  } {
    // Simplified drift detection - check if power distribution
    // significantly deviates from expected zone targets
    
    const distribution = this.calculateZoneDistribution(powerData, zones);
    const targetDistribution = zones.map(z => z.targetPercentage || 0);
    
    let totalVariance = 0;
    distribution.forEach((actual, index) => {
      const expected = targetDistribution[index];
      const variance = Math.abs(actual.percentage - expected);
      totalVariance += variance;
    });
    
    const avgVariance = totalVariance / zones.length;
    const driftDetected = avgVariance > 10; // 10% threshold
    
    return {
      drift_detected: driftDetected,
      drift_magnitude: avgVariance,
      recalibration_needed: avgVariance > 15
    };
  }

  /**
   * Get zone color for visualization
   */
  public getZoneColor(zone: number): string {
    const colors = {
      1: '#4ade80', // Green - Recovery
      2: '#22d3ee', // Cyan - Endurance
      3: '#fbbf24', // Yellow - Tempo
      4: '#f97316', // Orange - Threshold
      5: '#ef4444', // Red - VO2max
      6: '#a855f7', // Purple - Anaerobic
      7: '#ec4899'  // Pink - Neuromuscular
    };
    
    return colors[zone as keyof typeof colors] || '#64748b';
  }

  /**
   * Validate FTP estimate against power curve
   */
  public validateFTP(
    ftpEstimate: number,
    powerCurve: { duration: number; power: number }[]
  ): {
    valid: boolean;
    confidence: number;
    recommendation: string;
  } {
    // Find 20-minute and 60-minute power if available
    const power20min = powerCurve.find(p => Math.abs(p.duration - 1200) < 60)?.power;
    const power60min = powerCurve.find(p => Math.abs(p.duration - 3600) < 120)?.power;
    
    if (power20min) {
      const expectedFTP = power20min * 0.95;
      const deviation = Math.abs(ftpEstimate - expectedFTP) / expectedFTP;
      
      if (deviation < 0.05) {
        return {
          valid: true,
          confidence: 0.95,
          recommendation: 'FTP estimate looks accurate based on 20-minute power'
        };
      } else if (deviation < 0.10) {
        return {
          valid: true,
          confidence: 0.80,
          recommendation: 'FTP estimate is reasonable but consider retesting'
        };
      } else {
        return {
          valid: false,
          confidence: 0.60,
          recommendation: 'FTP estimate may be inaccurate. Recommend 20-minute test'
        };
      }
    }
    
    return {
      valid: true,
      confidence: 0.70,
      recommendation: 'Insufficient data for validation. Consider FTP test'
    };
  }
}

export default ZoneCalculator;