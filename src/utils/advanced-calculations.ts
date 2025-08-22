// Advanced Cycling Calculations - Phase 1 Implementation
import type { 
  VO2MaxAnalysis, 
  ThresholdAnalysis, 
  HRVAnalysis, 
  BiomechanicalAnalysis,
  AerodynamicAnalysis,
  PowerDurationCurveAdvanced 
} from '@/types/advanced-metrics';

/**
 * VO2 Max Estimation using Coggan's Formula
 * VO2max = 15.3 × (MAP/weight) where MAP is Maximum Aerobic Power
 */
export function calculateVO2Max(
  maxAerobicPower: number, 
  weight: number,
  age: number,
  gender: 'male' | 'female'
): VO2MaxAnalysis {
  const estimatedVO2Max = 15.3 * (maxAerobicPower / weight);
  
  // Age and gender corrections
  const ageFactor = gender === 'male' ? 
    Math.max(0.8, 1 - (age - 25) * 0.01) : 
    Math.max(0.75, 1 - (age - 25) * 0.012);
  
  const correctedVO2Max = estimatedVO2Max * ageFactor;
  
  // VO2 at threshold (typically 85-90% of VO2max)
  const vo2AtThreshold = correctedVO2Max * 0.87;
  
  // Performance categories based on age and gender
  const getPerformanceCategory = (vo2: number): VO2MaxAnalysis['aerobic_capacity_score'] => {
    const maleThresholds = { excellent: 55, good: 48, average: 40, below_average: 35 };
    const femaleThresholds = { excellent: 50, good: 43, average: 36, below_average: 31 };
    
    const thresholds = gender === 'male' ? maleThresholds : femaleThresholds;
    
    if (vo2 >= thresholds.excellent) return 'excellent';
    if (vo2 >= thresholds.good) return 'good';
    if (vo2 >= thresholds.average) return 'average';
    if (vo2 >= thresholds.below_average) return 'below_average';
    return 'poor';
  };
  
  return {
    estimated_vo2_max: Number(correctedVO2Max.toFixed(1)),
    vo2_at_threshold: Number(vo2AtThreshold.toFixed(1)),
    aerobic_capacity_score: getPerformanceCategory(correctedVO2Max),
    vo2_efficiency: Number((maxAerobicPower / correctedVO2Max).toFixed(2)),
    metabolic_flexibility: Number((vo2AtThreshold / correctedVO2Max).toFixed(3))
  };
}

/**
 * Automatic Threshold Detection using Heart Rate and Power Data
 * Implements Dmax method for VT1 and modified Dmax for VT2
 */
export function detectThresholds(
  powerData: number[],
  heartRateData: number[],
  timeData: number[]
): ThresholdAnalysis {
  if (powerData.length !== heartRateData.length || powerData.length < 10) {
    throw new Error('Invalid data for threshold detection');
  }
  
  // Sort data by power for analysis
  const sortedData = powerData
    .map((power, i) => ({ power, hr: heartRateData[i], time: timeData[i] }))
    .sort((a, b) => a.power - b.power);
  
  // VT1 Detection (Aerobic Threshold) - First deflection point
  const vt1Index = findFirstDeflectionPoint(sortedData.map(d => d.hr), sortedData.map(d => d.power));
  const vt1 = sortedData[vt1Index];
  
  // VT2 Detection (Anaerobic Threshold) - Second deflection point
  const vt2Index = findSecondDeflectionPoint(sortedData.map(d => d.hr), sortedData.map(d => d.power));
  const vt2 = sortedData[vt2Index];
  
  // Confidence calculation based on data quality
  const confidence = calculateThresholdConfidence(sortedData);
  
  return {
    vt1_power: Number(vt1.power.toFixed(0)),
    vt1_heart_rate: Number(vt1.hr.toFixed(0)),
    vt2_power: Number(vt2.power.toFixed(0)),
    vt2_heart_rate: Number(vt2.hr.toFixed(0)),
    anaerobic_threshold: Number(vt2.power.toFixed(0)),
    aerobic_threshold: Number(vt1.power.toFixed(0)),
    threshold_detection_confidence: Number(confidence.toFixed(2)),
    lactate_shuttle_efficiency: Number(((vt2.power - vt1.power) / vt1.power).toFixed(3))
  };
}

/**
 * HRV Analysis using RMSSD and pNN50 calculations
 */
export function calculateHRV(rrIntervals: number[]): HRVAnalysis {
  if (rrIntervals.length < 50) {
    throw new Error('Insufficient RR intervals for HRV analysis');
  }
  
  // Calculate successive differences
  const successiveDiffs = [];
  for (let i = 1; i < rrIntervals.length; i++) {
    successiveDiffs.push(rrIntervals[i] - rrIntervals[i - 1]);
  }
  
  // RMSSD calculation
  const squaredDiffs = successiveDiffs.map(diff => diff * diff);
  const meanSquaredDiff = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / squaredDiffs.length;
  const rmssd = Math.sqrt(meanSquaredDiff);
  
  // pNN50 calculation
  const nn50Count = successiveDiffs.filter(diff => Math.abs(diff) > 50).length;
  const pnn50 = (nn50Count / successiveDiffs.length) * 100;
  
  // Stress score calculation (inverse relationship with HRV)
  const normalizedRMSSD = Math.min(100, Math.max(10, rmssd));
  const stressScore = 100 - (normalizedRMSSD - 10) * (90 / 90);
  
  // Recovery status determination
  const getRecoveryStatus = (rmssd: number, pnn50: number): HRVAnalysis['recovery_status'] => {
    if (rmssd > 45 && pnn50 > 15) return 'excellent';
    if (rmssd > 35 && pnn50 > 10) return 'good';
    if (rmssd > 25 && pnn50 > 5) return 'moderate';
    if (rmssd > 15 && pnn50 > 2) return 'poor';
    return 'critical';
  };
  
  return {
    rmssd: Number(rmssd.toFixed(1)),
    pnn50: Number(pnn50.toFixed(1)),
    stress_score: Number(stressScore.toFixed(1)),
    recovery_status: getRecoveryStatus(rmssd, pnn50),
    autonomic_balance: Number((rmssd / 50).toFixed(2)),
    hrv_trend: rmssd > 30 ? 'improving' : rmssd > 20 ? 'stable' : 'declining',
    parasympathetic_activity: Number((pnn50 / 20).toFixed(2)),
    sympathetic_activity: Number((1 - pnn50 / 20).toFixed(2))
  };
}

/**
 * Biomechanical Analysis - Torque Effectiveness and Pedal Smoothness
 */
export function calculateBiomechanics(
  leftPowerPhase: number[],
  rightPowerPhase: number[],
  leftPeakPowerPhase: number[],
  rightPeakPowerPhase: number[]
): BiomechanicalAnalysis {
  // Torque Effectiveness (TE) - percentage of positive torque
  const leftTE = leftPowerPhase.reduce((sum, phase) => sum + (phase > 0 ? phase : 0), 0) / leftPowerPhase.length;
  const rightTE = rightPowerPhase.reduce((sum, phase) => sum + (phase > 0 ? phase : 0), 0) / rightPowerPhase.length;
  const torqueEffectiveness = (leftTE + rightTE) / 2;
  
  // Pedal Smoothness (PS) - consistency of power application
  const leftPS = 1 - (standardDeviation(leftPowerPhase) / mean(leftPowerPhase));
  const rightPS = 1 - (standardDeviation(rightPowerPhase) / mean(rightPowerPhase));
  const pedalSmoothness = (leftPS + rightPS) / 2;
  
  // Power Phase Angle - optimal range is 65-75 degrees
  const avgPowerPhaseAngle = (mean(leftPowerPhase) + mean(rightPowerPhase)) / 2;
  const avgPeakPowerPhaseAngle = (mean(leftPeakPowerPhase) + mean(rightPeakPowerPhase)) / 2;
  
  // Biomechanical efficiency score
  const efficiencyScore = (torqueEffectiveness * 0.4 + pedalSmoothness * 0.4 + 
    (1 - Math.abs(avgPowerPhaseAngle - 70) / 70) * 0.2) * 100;
  
  return {
    torque_effectiveness: Number((torqueEffectiveness * 100).toFixed(1)),
    pedal_smoothness: Number((pedalSmoothness * 100).toFixed(1)),
    power_phase_angle: Number(avgPowerPhaseAngle.toFixed(1)),
    peak_power_phase_angle: Number(avgPeakPowerPhaseAngle.toFixed(1)),
    left_torque_effectiveness: Number((leftTE * 100).toFixed(1)),
    right_torque_effectiveness: Number((rightTE * 100).toFixed(1)),
    biomechanical_efficiency_score: Number(efficiencyScore.toFixed(1)),
    muscle_activation_symmetry: Number((1 - Math.abs(leftTE - rightTE) / Math.max(leftTE, rightTE)).toFixed(3))
  };
}

/**
 * Dynamic CdA Calculation using power and environmental data
 */
export function calculateDynamicCdA(
  power: number,
  speed: number,
  weight: number,
  grade: number,
  windSpeed: number = 0,
  temperature: number = 20,
  pressure: number = 101325
): AerodynamicAnalysis {
  // Air density calculation (temperature and pressure corrected)
  const airDensity = (pressure / (287.05 * (temperature + 273.15)));
  
  // Rolling resistance power
  const crr = 0.004; // typical road bike coefficient
  const rollPower = crr * weight * 9.81 * Math.cos(Math.atan(grade / 100)) * speed;
  
  // Gravitational power
  const gravitationalPower = weight * 9.81 * Math.sin(Math.atan(grade / 100)) * speed;
  
  // Aerodynamic power (residual after subtracting other components)
  const aeroPower = power - rollPower - gravitationalPower;
  
  // Relative wind speed
  const relativeWindSpeed = speed + windSpeed;
  
  // Dynamic CdA calculation
  const cdaDynamic = (2 * aeroPower) / (airDensity * Math.pow(relativeWindSpeed, 3));
  
  // Drag coefficient and frontal area estimation
  const estimatedFrontalArea = 0.4; // typical cyclist frontal area
  const dragCoefficient = cdaDynamic / estimatedFrontalArea;
  
  return {
    cda_dynamic: Number(cdaDynamic.toFixed(4)),
    drag_coefficient: Number(dragCoefficient.toFixed(3)),
    frontal_area: Number(estimatedFrontalArea.toFixed(2)),
    yaw_angle_effect: Number((windSpeed / relativeWindSpeed).toFixed(3)),
    rolling_resistance_dynamic: Number((rollPower / power).toFixed(3)),
    aerodynamic_efficiency_score: Number(Math.max(0, 100 - (cdaDynamic - 0.25) * 1000).toFixed(1)),
    wind_relative_speed: Number(relativeWindSpeed.toFixed(1)),
    aero_power_savings: Number((power * 0.1).toFixed(1)) // Potential 10% savings with optimization
  };
}

/**
 * Advanced Power Duration Curve with Critical Power Model
 */
export function calculateAdvancedPowerCurve(
  powerData: { duration: number; power: number }[]
): PowerDurationCurveAdvanced {
  // Sort by duration
  const sortedData = powerData.sort((a, b) => a.duration - b.duration);
  
  // Critical Power Model: P(t) = CP + W'/(t)
  // Where CP is critical power and W' is anaerobic work capacity
  
  // Use durations > 3 minutes for CP calculation
  const cpData = sortedData.filter(d => d.duration >= 180);
  
  if (cpData.length < 3) {
    throw new Error('Insufficient data for critical power analysis');
  }
  
  // Linear regression on 1/time vs power
  const xValues = cpData.map(d => 1 / d.duration);
  const yValues = cpData.map(d => d.power);
  
  const n = xValues.length;
  const sumX = xValues.reduce((sum, x) => sum + x, 0);
  const sumY = yValues.reduce((sum, y) => sum + y, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const criticalPower = intercept;
  const wPrime = slope;
  
  // Key power benchmarks
  const neuromuscularPower = sortedData.find(d => d.duration <= 15)?.power || 0;
  const vo2MaxPower = sortedData.find(d => d.duration >= 300 && d.duration <= 360)?.power || 0;
  const lactateThresholdPower = sortedData.find(d => d.duration >= 1200)?.power || criticalPower;
  
  return {
    critical_power: Number(criticalPower.toFixed(0)),
    w_prime: Number(wPrime.toFixed(0)),
    anaerobic_work_capacity: Number(wPrime.toFixed(0)),
    power_duration_model: {
      a: Number(criticalPower.toFixed(1)),
      b: Number(slope.toFixed(1)),
      c: Number(wPrime.toFixed(1))
    },
    neuromuscular_power: Number(neuromuscularPower.toFixed(0)),
    vo2_max_power: Number(vo2MaxPower.toFixed(0)),
    lactate_threshold_power: Number(lactateThresholdPower.toFixed(0)),
    aerobic_threshold_power: Number((lactateThresholdPower * 0.85).toFixed(0)),
    endurance_ratio: Number((criticalPower / neuromuscularPower).toFixed(3))
  };
}

// Helper functions
function findFirstDeflectionPoint(hrData: number[], powerData: number[]): number {
  // Simplified implementation - would use more sophisticated algorithms in production
  const derivatives = [];
  for (let i = 1; i < hrData.length - 1; i++) {
    const derivative = (hrData[i + 1] - hrData[i - 1]) / (powerData[i + 1] - powerData[i - 1]);
    derivatives.push(derivative);
  }
  
  // Find first significant change in derivative
  let maxChange = 0;
  let maxIndex = 0;
  for (let i = 1; i < derivatives.length; i++) {
    const change = Math.abs(derivatives[i] - derivatives[i - 1]);
    if (change > maxChange) {
      maxChange = change;
      maxIndex = i;
    }
  }
  
  return Math.max(0, maxIndex);
}

function findSecondDeflectionPoint(hrData: number[], powerData: number[]): number {
  const firstPoint = findFirstDeflectionPoint(hrData, powerData);
  const secondHalfHR = hrData.slice(firstPoint + Math.floor(hrData.length / 4));
  const secondHalfPower = powerData.slice(firstPoint + Math.floor(powerData.length / 4));
  
  const secondDeflection = findFirstDeflectionPoint(secondHalfHR, secondHalfPower);
  return firstPoint + Math.floor(hrData.length / 4) + secondDeflection;
}

function calculateThresholdConfidence(data: Array<{ power: number; hr: number }>): number {
  // Simplified confidence calculation based on data quality
  const powerRange = Math.max(...data.map(d => d.power)) - Math.min(...data.map(d => d.power));
  const hrRange = Math.max(...data.map(d => d.hr)) - Math.min(...data.map(d => d.hr));
  
  const powerConfidence = Math.min(1, powerRange / 200); // Normalize to 200W range
  const hrConfidence = Math.min(1, hrRange / 50); // Normalize to 50 bpm range
  
  return (powerConfidence + hrConfidence) / 2;
}

function standardDeviation(values: number[]): number {
  const avg = mean(values);
  const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squaredDiffs));
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}