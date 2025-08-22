export interface PowerCurveData {
  duration_5s?: number;
  duration_15s?: number;
  duration_1min?: number;
  duration_5min?: number;
  duration_20min?: number;
  duration_60min?: number;
  critical_power?: number;
  anaerobic_work_capacity?: number;
  ftp_estimated?: number;
  confidence_score?: number;
}

export interface PowerCurvePoint {
  duration: number; // in seconds
  power: number; // in watts
  percentile?: number; // percentile rank
  isPersonalBest?: boolean;
  date?: string;
}

export interface TrainingZone {
  zone: number;
  name: string;
  min: number;
  max: number;
  color: string;
  description: string;
  targetPercentage?: number; // ideal distribution
}

export interface TrainingZones {
  zones: TrainingZone[];
  ftp_base: number;
  auto_calculated: boolean;
  last_calibration: string;
}

export interface CriticalPowerModel {
  critical_power: number; // CP in watts
  anaerobic_capacity: number; // W' in kJ
  r_squared: number; // model fit quality
  confidence_interval: {
    cp_low: number;
    cp_high: number;
    awc_low: number;
    awc_high: number;
  };
}

export interface PowerAnalysisData {
  curve: PowerCurvePoint[];
  zones: TrainingZones;
  model: CriticalPowerModel;
  historicalComparison: {
    current: PowerCurveData;
    previous: PowerCurveData;
    improvement: number; // percentage
  };
  recommendations: TrainingRecommendation[];
}

export interface TrainingRecommendation {
  id: string;
  type: 'workout' | 'recovery' | 'test' | 'zone_focus';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  target_zones?: number[];
  duration_minutes?: number;
  confidence: number;
  created_at: string;
}

export interface MLPrediction {
  prediction_type: 'ftp' | 'fatigue' | 'recovery' | 'zone_drift';
  current_value: number;
  predicted_value: number;
  confidence_interval: {
    low: number;
    high: number;
  };
  confidence_score: number;
  prediction_date: string;
  target_date?: string;
  model_version: string;
  input_features: Record<string, any>;
}

export interface TrainingLoadData {
  date: string;
  tss: number; // Training Stress Score
  ctl: number; // Chronic Training Load (fitness)
  atl: number; // Acute Training Load (fatigue)
  tsb: number; // Training Stress Balance (form)
  fatigue_score: number; // 0-1 scale
  fitness_score: number;
  form_score: number; // -3 to +3 scale
}

export interface PerformanceManagementChart {
  data: TrainingLoadData[];
  current: {
    fitness: number;
    fatigue: number;
    form: number;
  };
  trends: {
    fitness_trend: 'improving' | 'declining' | 'stable';
    fatigue_trend: 'increasing' | 'decreasing' | 'stable';
    form_trend: 'positive' | 'negative' | 'neutral';
  };
  projections: {
    peak_form_date?: string;
    recovery_needed_days?: number;
    next_breakthrough_date?: string;
  };
}

export interface PowerAnalysisConfig {
  intervals: number[]; // durations in seconds
  zone_method: 'coggan_7_zone' | 'custom';
  confidence_threshold: number;
  lookback_days: number;
  colors: {
    [key: string]: string;
  };
}

export interface ZoneDistribution {
  zone: number;
  time_seconds: number;
  percentage: number;
  target_percentage: number;
  variance: number; // actual vs target
}

export interface WorkoutAnalysis {
  zone_distribution: ZoneDistribution[];
  training_load: {
    tss: number;
    intensity_factor: number;
    normalized_power: number;
  };
  power_profile: {
    five_second: number;
    one_minute: number;
    five_minute: number;
    twenty_minute: number;
  };
  efficiency_metrics: {
    variability_index: number; // VI = NP/AP
    decoupling: number; // cardiac drift
    consistency: number; // power consistency
  };
}