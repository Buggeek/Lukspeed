// Advanced Predictive Models for LukSpeed Analytics
import type { Activity } from '@/types';

// Training Load Models (CTL/ATL/TSB)
export interface TrainingLoadMetrics {
  ctl: number; // Chronic Training Load (42-day exponential average)
  atl: number; // Acute Training Load (7-day exponential average)
  tsb: number; // Training Stress Balance (CTL - ATL)
  form: 'excellent' | 'good' | 'neutral' | 'tired' | 'overreached';
  fitness_trend: 'increasing' | 'stable' | 'decreasing';
  fatigue_trend: 'fresh' | 'building' | 'high' | 'extreme';
}

// FTP Prediction Model
export interface FTPPrediction {
  current_ftp: number;
  predicted_ftp: number;
  confidence: number;
  prediction_horizon_days: number;
  improvement_rate: number; // watts per week
  plateau_risk: number; // 0-1 probability
  recommended_test_date: string;
}

// Performance Prediction
export interface PerformancePrediction {
  target_duration: number; // seconds
  predicted_power: number;
  confidence_interval: { lower: number; upper: number };
  limiting_factors: string[];
  improvement_potential: number; // percentage
}

// Segment Analysis
export interface SegmentAnalysis {
  segment_id: string;
  segment_name: string;
  best_effort: {
    date: string;
    power: number;
    time: number;
    conditions: string;
  };
  recent_efforts: Array<{
    date: string;
    power: number;
    time: number;
    relative_performance: number; // vs best effort
  }>;
  performance_trend: 'improving' | 'stable' | 'declining';
  pacing_analysis: {
    strategy: 'even' | 'fast_start' | 'negative_split' | 'surging';
    efficiency_score: number;
    optimal_pacing: number[]; // power targets by segment thirds
  };
}

// Tactical Analysis
export interface TacticalAnalysis {
  attack_frequency: number; // attacks per hour
  response_capability: number; // success rate responding to attacks
  energy_distribution: {
    endurance: number; // % time in Z1-Z2
    tempo: number; // % time in Z3
    threshold: number; // % time in Z4
    vo2max: number; // % time in Z5
    neuromuscular: number; // % time in Z6+
  };
  drafting_benefit: number; // average power savings %
  positioning_analysis: {
    front_third: number; // % time
    middle_third: number;
    back_third: number;
  };
}

/**
 * Calculate Training Load Metrics using exponential weighted moving averages
 */
export function calculateTrainingLoad(activities: Activity[]): TrainingLoadMetrics {
  if (activities.length === 0) {
    return {
      ctl: 0,
      atl: 0,
      tsb: 0,
      form: 'neutral',
      fitness_trend: 'stable',
      fatigue_trend: 'fresh'
    };
  }

  // Sort activities by date (most recent first)
  const sortedActivities = activities
    .filter(a => a.training_stress_score && a.training_stress_score > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedActivities.length === 0) {
    return {
      ctl: 0,
      atl: 0,
      tsb: 0,
      form: 'neutral',
      fitness_trend: 'stable',
      fatigue_trend: 'fresh'
    };
  }

  // Exponential smoothing constants
  const ctlAlpha = 2 / (42 + 1); // 42-day CTL
  const atlAlpha = 2 / (7 + 1);  // 7-day ATL

  let ctl = 0;
  let atl = 0;

  // Calculate exponential moving averages
  for (let i = 0; i < Math.min(sortedActivities.length, 90); i++) {
    const tss = sortedActivities[i].training_stress_score || 0;
    const dayWeight = Math.pow(1 - ctlAlpha, i);
    const weekWeight = Math.pow(1 - atlAlpha, i);
    
    ctl += tss * ctlAlpha * dayWeight;
    if (i < 14) { // Only consider last 2 weeks for ATL
      atl += tss * atlAlpha * weekWeight;
    }
  }

  const tsb = ctl - atl;

  // Determine form based on TSB
  let form: TrainingLoadMetrics['form'];
  if (tsb > 20) form = 'excellent';
  else if (tsb > 5) form = 'good';
  else if (tsb > -10) form = 'neutral';
  else if (tsb > -30) form = 'tired';
  else form = 'overreached';

  // Determine trends
  const recentCTL = sortedActivities.slice(0, 7).reduce((sum, a) => sum + (a.training_stress_score || 0), 0) / 7;
  const previousCTL = sortedActivities.slice(7, 14).reduce((sum, a) => sum + (a.training_stress_score || 0), 0) / 7;
  
  const fitness_trend = recentCTL > previousCTL * 1.05 ? 'increasing' : 
                       recentCTL < previousCTL * 0.95 ? 'decreasing' : 'stable';

  const fatigue_trend = atl > 100 ? 'extreme' : atl > 60 ? 'high' : atl > 30 ? 'building' : 'fresh';

  return {
    ctl: Number(ctl.toFixed(1)),
    atl: Number(atl.toFixed(1)),
    tsb: Number(tsb.toFixed(1)),
    form,
    fitness_trend,
    fatigue_trend
  };
}

/**
 * Predict FTP based on recent training data and power curve analysis
 */
export function predictFTP(activities: Activity[], currentFTP: number): FTPPrediction {
  if (activities.length < 5) {
    return {
      current_ftp: currentFTP,
      predicted_ftp: currentFTP,
      confidence: 0.3,
      prediction_horizon_days: 28,
      improvement_rate: 0,
      plateau_risk: 0.5,
      recommended_test_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  // Get recent high-intensity efforts
  const recentActivities = activities
    .filter(a => a.average_power && a.average_power > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  // Calculate trend in normalized power for threshold efforts
  const thresholdEfforts = recentActivities.filter(a => 
    a.normalized_power && 
    a.normalized_power > currentFTP * 0.85 && 
    a.duration && 
    a.duration > 1200 // > 20 minutes
  );

  if (thresholdEfforts.length < 3) {
    return {
      current_ftp: currentFTP,
      predicted_ftp: currentFTP,
      confidence: 0.4,
      prediction_horizon_days: 21,
      improvement_rate: 0,
      plateau_risk: 0.6,
      recommended_test_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  // Linear regression on recent threshold efforts
  const effortData = thresholdEfforts.map((activity, index) => ({
    x: index, // weeks ago (reversed)
    y: activity.normalized_power || 0
  })).reverse();

  const n = effortData.length;
  const sumX = effortData.reduce((sum, point) => sum + point.x, 0);
  const sumY = effortData.reduce((sum, point) => sum + point.y, 0);
  const sumXY = effortData.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = effortData.reduce((sum, point) => sum + point.x * point.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Project 4 weeks into future
  const weeksAhead = 4;
  const predictedNP = intercept + slope * (n + weeksAhead);
  const predictedFTP = Math.max(currentFTP * 0.95, predictedNP * 0.95); // NP ≈ 105% of FTP

  // Calculate confidence based on data consistency
  const residuals = effortData.map(point => Math.abs(point.y - (intercept + slope * point.x)));
  const meanResidual = residuals.reduce((sum, r) => sum + r, 0) / residuals.length;
  const confidence = Math.max(0.1, Math.min(0.95, 1 - (meanResidual / currentFTP)));

  // Improvement rate in watts per week
  const improvementRate = slope;

  // Plateau risk based on recent consistency and improvement rate
  const plateauRisk = improvementRate < 0.5 ? 0.8 : improvementRate < 1.5 ? 0.4 : 0.2;

  // Recommend test date based on improvement trend
  const testDays = improvementRate > 2 ? 14 : improvementRate > 1 ? 21 : 28;
  const recommendedTestDate = new Date(Date.now() + testDays * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  return {
    current_ftp: currentFTP,
    predicted_ftp: Number(predictedFTP.toFixed(0)),
    confidence: Number(confidence.toFixed(2)),
    prediction_horizon_days: 28,
    improvement_rate: Number(improvementRate.toFixed(1)),
    plateau_risk: Number(plateauRisk.toFixed(2)),
    recommended_test_date: recommendedTestDate
  };
}

/**
 * Predict performance for a target duration
 */
export function predictPerformance(
  activities: Activity[], 
  targetDuration: number, 
  currentFTP: number
): PerformancePrediction {
  // Power-duration relationship modeling
  const efforts = activities
    .filter(a => a.max_power && a.duration && a.duration > 60)
    .map(a => ({
      duration: a.duration!,
      power: a.max_power!
    }))
    .sort((a, b) => a.duration - b.duration);

  if (efforts.length < 3) {
    // Fallback to standard power-duration curve
    const predictedPower = estimatePowerForDuration(targetDuration, currentFTP);
    return {
      target_duration: targetDuration,
      predicted_power: predictedPower,
      confidence_interval: {
        lower: predictedPower * 0.92,
        upper: predictedPower * 1.08
      },
      limiting_factors: ['Insufficient data'],
      improvement_potential: 0.1
    };
  }

  // Find similar duration efforts
  const similarEfforts = efforts.filter(e => 
    Math.abs(e.duration - targetDuration) < targetDuration * 0.2
  );

  if (similarEfforts.length > 0) {
    const avgPower = similarEfforts.reduce((sum, e) => sum + e.power, 0) / similarEfforts.length;
    const stdDev = Math.sqrt(
      similarEfforts.reduce((sum, e) => sum + Math.pow(e.power - avgPower, 2), 0) / similarEfforts.length
    );

    return {
      target_duration: targetDuration,
      predicted_power: Number(avgPower.toFixed(0)),
      confidence_interval: {
        lower: Number((avgPower - stdDev).toFixed(0)),
        upper: Number((avgPower + stdDev).toFixed(0))
      },
      limiting_factors: analyzeLimitingFactors(targetDuration, avgPower, currentFTP),
      improvement_potential: calculateImprovementPotential(avgPower, currentFTP, targetDuration)
    };
  }

  // Interpolate from power curve
  const predictedPower = estimatePowerForDuration(targetDuration, currentFTP);
  return {
    target_duration: targetDuration,
    predicted_power: predictedPower,
    confidence_interval: {
      lower: predictedPower * 0.9,
      upper: predictedPower * 1.1
    },
    limiting_factors: analyzeLimitingFactors(targetDuration, predictedPower, currentFTP),
    improvement_potential: calculateImprovementPotential(predictedPower, currentFTP, targetDuration)
  };
}

/**
 * Analyze segments for performance insights
 */
export function analyzeSegments(activities: Activity[]): SegmentAnalysis[] {
  // Mock implementation - in real app, would analyze GPS segments
  const mockSegments: SegmentAnalysis[] = [
    {
      segment_id: 'climb_1',
      segment_name: 'Alto de La Muela',
      best_effort: {
        date: '2024-01-15',
        power: 342,
        time: 1247,
        conditions: 'Viento suave, 18°C'
      },
      recent_efforts: [
        { date: '2024-01-20', power: 338, time: 1261, relative_performance: 0.97 },
        { date: '2024-01-25', power: 345, time: 1239, relative_performance: 1.02 },
        { date: '2024-01-30', power: 340, time: 1253, relative_performance: 0.98 }
      ],
      performance_trend: 'stable',
      pacing_analysis: {
        strategy: 'even',
        efficiency_score: 0.89,
        optimal_pacing: [320, 335, 350] // Negative split recommendation
      }
    }
  ];

  return mockSegments;
}

// Helper functions
function estimatePowerForDuration(duration: number, ftp: number): number {
  // Simplified power-duration curve
  if (duration <= 5) return ftp * 5.5; // Neuromuscular
  if (duration <= 60) return ftp * 2.5; // Anaerobic
  if (duration <= 300) return ftp * 1.18; // VO2max
  if (duration <= 1200) return ftp * 1.05; // Threshold
  return ftp * 0.85; // Tempo/Endurance
}

function analyzeLimitingFactors(duration: number, power: number, ftp: number): string[] {
  const factors: string[] = [];
  
  if (duration <= 300 && power < ftp * 1.15) {
    factors.push('VO2 max capacity');
  }
  if (duration > 1200 && power < ftp * 0.9) {
    factors.push('Endurance base');
  }
  if (duration <= 60 && power < ftp * 2.2) {
    factors.push('Anaerobic power');
  }
  
  return factors.length > 0 ? factors : ['Pacing strategy'];
}

function calculateImprovementPotential(power: number, ftp: number, duration: number): number {
  const expectedPower = estimatePowerForDuration(duration, ftp);
  return Math.max(0, Math.min(0.3, (expectedPower - power) / power));
}

/**
 * Analyze tactical patterns in race/group ride data
 */
export function analyzeTacticalPatterns(activity: Activity): TacticalAnalysis {
  // Mock tactical analysis - in real implementation would analyze power spikes, positioning data
  return {
    attack_frequency: 2.3,
    response_capability: 0.78,
    energy_distribution: {
      endurance: 0.45,
      tempo: 0.25,
      threshold: 0.18,
      vo2max: 0.08,
      neuromuscular: 0.04
    },
    drafting_benefit: 0.15,
    positioning_analysis: {
      front_third: 0.25,
      middle_third: 0.55,
      back_third: 0.20
    }
  };
}