// Advanced Cycling Metrics Types - Phase 1 Implementation
export interface VO2MaxAnalysis {
  estimated_vo2_max: number;
  vo2_at_threshold: number;
  aerobic_capacity_score: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  vo2_efficiency: number;
  metabolic_flexibility: number;
}

export interface ThresholdAnalysis {
  vt1_power: number;
  vt1_heart_rate: number;
  vt2_power: number;
  vt2_heart_rate: number;
  anaerobic_threshold: number;
  aerobic_threshold: number;
  threshold_detection_confidence: number;
  lactate_shuttle_efficiency: number;
}

export interface HRVAnalysis {
  rmssd: number;
  pnn50: number;
  stress_score: number;
  recovery_status: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  autonomic_balance: number;
  hrv_trend: 'improving' | 'stable' | 'declining';
  parasympathetic_activity: number;
  sympathetic_activity: number;
}

export interface BiomechanicalAnalysis {
  torque_effectiveness: number;
  pedal_smoothness: number;
  power_phase_angle: number;
  peak_power_phase_angle: number;
  left_torque_effectiveness: number;
  right_torque_effectiveness: number;
  biomechanical_efficiency_score: number;
  muscle_activation_symmetry: number;
}

export interface AerodynamicAnalysis {
  cda_dynamic: number;
  drag_coefficient: number;
  frontal_area: number;
  yaw_angle_effect: number;
  rolling_resistance_dynamic: number;
  aerodynamic_efficiency_score: number;
  wind_relative_speed: number;
  aero_power_savings: number;
}

export interface PowerDurationCurveAdvanced {
  critical_power: number;
  w_prime: number;
  anaerobic_work_capacity: number;
  power_duration_model: {
    a: number; // Asymptote (CP)
    b: number; // Curvature constant
    c: number; // W' parameter
  };
  neuromuscular_power: number;
  vo2_max_power: number;
  lactate_threshold_power: number;
  aerobic_threshold_power: number;
  endurance_ratio: number;
}

export interface AdvancedMetricsSnapshot {
  timestamp: string;
  vo2_analysis: VO2MaxAnalysis;
  threshold_analysis: ThresholdAnalysis;
  hrv_analysis: HRVAnalysis;
  biomechanical_analysis: BiomechanicalAnalysis;
  aerodynamic_analysis: AerodynamicAnalysis;
  power_curve_analysis: PowerDurationCurveAdvanced;
  overall_performance_score: number;
  training_readiness_score: number;
  fatigue_resistance_index: number;
}

// Comparison data structure
export interface MetricComparison {
  current: number;
  previous_4weeks: number;
  previous_3months: number;
  previous_year: number;
  percentile_rank: number;
  optimal_range: { min: number; max: number };
  status: 'excellent' | 'good' | 'average' | 'needs_improvement' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
}

// Time series data for trend analysis
export interface MetricTimeSeries {
  date: string;
  value: number;
  confidence: number;
  context: 'training' | 'competition' | 'recovery' | 'test';
}