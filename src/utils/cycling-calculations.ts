// Advanced Cycling Calculations - Implementation of all 50 metrics from David's analysis
import { BaseVariables, DerivedMetrics, AnalysisIndicators, PowerBreakdown, ClimbingAnalysis, EfficiencyTrends, BiomechanicalAnalysis } from '@/types/advanced-metrics';

// Constants for calculations
const GRAVITY = 9.81; // m/s²
const AIR_DENSITY = 1.225; // kg/m³ at sea level, 15°C
const ROLLING_RESISTANCE_COEFF = 0.004; // typical road bike
const DRIVETRAIN_EFFICIENCY = 0.97; // 97% efficiency

export class CyclingCalculations {
  
  // Base Calculations
  static calculateNormalizedPower(powerData: number[]): number {
    if (powerData.length === 0) return 0;
    
    // 30-second rolling average, then fourth power
    const rollingAverages = this.calculateRollingAverage(powerData, 30);
    const fourthPowers = rollingAverages.map(p => Math.pow(p, 4));
    const avgFourthPower = fourthPowers.reduce((sum, p) => sum + p, 0) / fourthPowers.length;
    
    return Math.pow(avgFourthPower, 0.25);
  }

  static calculateIntensityFactor(normalizedPower: number, ftp: number): number {
    return ftp > 0 ? normalizedPower / ftp : 0;
  }

  static calculateTrainingStressScore(normalizedPower: number, duration: number, ftp: number): number {
    const intensityFactor = this.calculateIntensityFactor(normalizedPower, ftp);
    return (duration * normalizedPower * intensityFactor) / (ftp * 3600) * 100;
  }

  static calculateVariabilityIndex(normalizedPower: number, averagePower: number): number {
    return averagePower > 0 ? normalizedPower / averagePower : 1;
  }

  static calculateEfficiencyFactor(normalizedPower: number, averageHeartRate: number): number {
    return averageHeartRate > 0 ? normalizedPower / averageHeartRate : 0;
  }

  // Climbing Calculations
  static calculateVAM(elevationGain: number, duration: number): number {
    // Vertical Ascent Meters per hour
    const hours = duration / 3600;
    return hours > 0 ? elevationGain / hours : 0;
  }

  static calculatePowerToWeight(power: number, weight: number): number {
    return weight > 0 ? power / weight : 0;
  }

  static calculateClimbingEfficiency(power: number, speed: number, grade: number, weight: number): number {
    // Theoretical minimum power vs actual power
    const theoreticalPower = this.calculateGravitationalPower(speed, grade, weight);
    const totalTheoretical = theoreticalPower + this.calculateRollingResistancePower(speed, weight) + 
                           this.calculateAerodynamicPower(speed);
    
    return totalTheoretical > 0 ? (totalTheoretical / power) * 100 : 0;
  }

  // Power Breakdown Calculations
  static calculateAerodynamicPower(speed: number, dragCoeff: number = 0.88, frontalArea: number = 0.4): number {
    const speedMs = speed / 3.6; // Convert km/h to m/s
    return 0.5 * AIR_DENSITY * dragCoeff * frontalArea * Math.pow(speedMs, 3);
  }

  static calculateRollingResistancePower(speed: number, weight: number): number {
    const speedMs = speed / 3.6;
    return ROLLING_RESISTANCE_COEFF * weight * GRAVITY * speedMs;
  }

  static calculateGravitationalPower(speed: number, grade: number, weight: number): number {
    const speedMs = speed / 3.6;
    const gradeRadians = Math.atan(grade / 100);
    return weight * GRAVITY * Math.sin(gradeRadians) * speedMs;
  }

  static calculatePowerBreakdown(speed: number, grade: number, weight: number): PowerBreakdown {
    const aerodynamicPower = this.calculateAerodynamicPower(speed);
    const rollingResistancePower = this.calculateRollingResistancePower(speed, weight);
    const gravitationalPower = this.calculateGravitationalPower(speed, grade, weight);
    const accelerationPower = 0; // Would need acceleration data
    const mechanicalLosses = (aerodynamicPower + rollingResistancePower + gravitationalPower) * (1 - DRIVETRAIN_EFFICIENCY);
    
    return {
      aerodynamic_power: aerodynamicPower,
      rolling_resistance_power: rollingResistancePower,
      gravitational_power: gravitationalPower,
      acceleration_power: accelerationPower,
      mechanical_losses: mechanicalLosses,
      total_power_demand: aerodynamicPower + rollingResistancePower + gravitationalPower + accelerationPower + mechanicalLosses
    };
  }

  // Biomechanical Calculations
  static calculateCadenceVariability(cadenceData: number[]): number {
    if (cadenceData.length === 0) return 0;
    
    const mean = cadenceData.reduce((sum, c) => sum + c, 0) / cadenceData.length;
    const variance = cadenceData.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / cadenceData.length;
    const standardDeviation = Math.sqrt(variance);
    
    return mean > 0 ? (standardDeviation / mean) * 100 : 0; // Coefficient of Variation
  }

  static calculatePedalingEfficiency(powerData: number[], cadenceData: number[]): number {
    // Simplified pedaling efficiency based on power smoothness
    if (powerData.length === 0) return 0;
    
    const powerVariability = this.calculateCadenceVariability(powerData); // Reuse CV calculation
    return Math.max(0, 100 - powerVariability); // Higher variability = lower efficiency
  }

  // Performance Analysis
  static classifyPowerProfile(peakPowers: { '5s': number; '60s': number; '300s': number; '1200s': number }, weight: number): string {
    const sprint = peakPowers['5s'] / weight;
    const vo2max = peakPowers['300s'] / weight;
    const threshold = peakPowers['1200s'] / weight;
    
    if (sprint > 15 && vo2max < 6) return 'sprinter';
    if (threshold > 5.5 && sprint < 12) return 'climber';
    if (threshold > 4.5 && vo2max > 5.5) return 'time_trialist';
    return 'all_rounder';
  }

  static calculateClimbingProfile(vam: number, powerToWeight: number): string {
    if (vam > 1800 && powerToWeight > 6.0) return 'pure_climber';
    if (vam > 1600 && powerToWeight > 5.5) return 'power_climber';
    if (vam > 1400 && powerToWeight > 5.0) return 'tempo_climber';
    return 'recreational_climber';
  }

  // Fatigue Analysis
  static calculatePowerDecayRate(powerData: number[], timeData: number[]): number {
    if (powerData.length < 2) return 0;
    
    // Simple linear regression to find power decline over time
    const n = powerData.length;
    const sumX = timeData.reduce((sum, t) => sum + t, 0);
    const sumY = powerData.reduce((sum, p) => sum + p, 0);
    const sumXY = timeData.reduce((sum, t, i) => sum + t * powerData[i], 0);
    const sumXX = timeData.reduce((sum, t) => sum + t * t, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgPower = sumY / n;
    
    return avgPower > 0 ? (slope / avgPower) * 100 : 0; // Percentage decline per unit time
  }

  static calculateHeartRateDrift(hrData: number[], timeData: number[]): number {
    if (hrData.length < 2) return 0;
    
    // Calculate HR drift over time using linear regression
    const n = hrData.length;
    const sumX = timeData.reduce((sum, t) => sum + t, 0);
    const sumY = hrData.reduce((sum, hr) => sum + hr, 0);
    const sumXY = timeData.reduce((sum, t, i) => sum + t * hrData[i], 0);
    const sumXX = timeData.reduce((sum, t) => sum + t * t, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope * 3600; // Convert to bpm per hour
  }

  // Efficiency Calculations
  static calculateGrossEfficiency(mechanicalPower: number, metabolicPower: number): number {
    return metabolicPower > 0 ? (mechanicalPower / metabolicPower) * 100 : 0;
  }

  static calculateDeltaEfficiency(powerChange: number, energyChange: number): number {
    return energyChange > 0 ? (powerChange / energyChange) * 100 : 0;
  }

  // Helper Methods
  private static calculateRollingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);
      const window = data.slice(start, end);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(average);
    }
    
    return result;
  }

  // Zone Classification
  static classifyPowerZone(power: number, ftp: number): number {
    const percentage = (power / ftp) * 100;
    
    if (percentage < 55) return 1; // Active Recovery
    if (percentage < 75) return 2; // Endurance
    if (percentage < 90) return 3; // Tempo
    if (percentage < 105) return 4; // Lactate Threshold
    if (percentage < 120) return 5; // VO2 Max
    if (percentage < 150) return 6; // Anaerobic Capacity
    return 7; // Neuromuscular Power
  }

  // Comprehensive Analysis
  static calculateComprehensiveMetrics(
    baseVariables: BaseVariables,
    powerData: number[],
    cadenceData: number[],
    hrData: number[],
    timeData: number[],
    ftp: number
  ): { derived: DerivedMetrics; indicators: AnalysisIndicators } {
    
    const derived: DerivedMetrics = {
      intensity_factor: this.calculateIntensityFactor(baseVariables.normalized_power, ftp),
      training_stress_score: this.calculateTrainingStressScore(baseVariables.normalized_power, baseVariables.duration, ftp),
      variability_index: this.calculateVariabilityIndex(baseVariables.normalized_power, baseVariables.average_power),
      efficiency_factor: this.calculateEfficiencyFactor(baseVariables.normalized_power, baseVariables.average_heart_rate),
      vam: this.calculateVAM(baseVariables.elevation_gain, baseVariables.duration),
      power_to_weight: this.calculatePowerToWeight(baseVariables.normalized_power, baseVariables.weight_total),
      climbing_efficiency: this.calculateClimbingEfficiency(baseVariables.power, baseVariables.speed, baseVariables.grade, baseVariables.weight_total),
      work_total: (baseVariables.average_power * baseVariables.duration) / 1000, // kJ
      energy_expenditure: ((baseVariables.average_power * baseVariables.duration) / 1000) / baseVariables.weight_total,
      power_hr_ratio: baseVariables.average_heart_rate > 0 ? baseVariables.average_power / baseVariables.average_heart_rate : 0,
      cadence_power_ratio: baseVariables.average_power > 0 ? baseVariables.average_cadence / baseVariables.average_power : 0
    };

    const indicators: AnalysisIndicators = {
      aerobic_power_threshold: ftp,
      anaerobic_power_reserve: baseVariables.max_power - ftp,
      power_profile_classification: this.classifyPowerProfile({
        '5s': baseVariables.power_3s,
        '60s': baseVariables.power_60s,
        '300s': baseVariables.power_300s,
        '1200s': baseVariables.power_1200s
      }, baseVariables.weight_total) as any,
      climbing_power_profile: this.calculateClimbingProfile(derived.vam, derived.power_to_weight) as any,
      grade_efficiency_coefficient: derived.climbing_efficiency / 100,
      vam_percentile: Math.min(100, (derived.vam / 2000) * 100), // Simplified percentile
      cadence_variability: this.calculateCadenceVariability(cadenceData),
      power_balance: 50, // Would need L/R power data
      pedaling_efficiency: this.calculatePedalingEfficiency(powerData, cadenceData),
      power_decay_rate: this.calculatePowerDecayRate(powerData, timeData),
      heart_rate_drift: this.calculateHeartRateDrift(hrData, timeData),
      performance_sustainability: Math.max(0, 100 - Math.abs(indicators.power_decay_rate))
    };

    return { derived, indicators };
  }
}