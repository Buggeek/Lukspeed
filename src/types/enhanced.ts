// Enhanced type definitions for LukSpeed v2.0
export interface AdvancedMetrics {
  normalized_power: number;
  intensity_factor: number;
  training_stress_score: number;
  variability_index: number;
  efficiency_factor: number;
  work: number;
  weighted_avg_power: number;
  peak_1s: number;
  peak_5s: number;
  peak_15s: number;
  peak_1m: number;
  peak_5m: number;
  peak_20m: number;
  peak_60m: number;
  left_right_balance?: number;
  avg_left_pco?: number;
  avg_right_pco?: number;
}

export interface PowerCurveData {
  duration: number; // in seconds
  power: number;
  date: string;
  activity_id: string;
}

export interface TrainingLoad {
  date: string;
  daily_tss: number;
  acute_load: number; // 7-day rolling average
  chronic_load: number; // 42-day rolling average
  training_balance: number;
  form: number;
  fitness: number;
  fatigue: number;
  ramp_rate: number;
}

export interface ActivitySegment {
  id: string;
  activity_id: string;
  segment_start: number;
  segment_end: number;
  segment_type: 'climb' | 'sprint' | 'tt' | 'recovery' | 'strava_segment';
  distance: number;
  duration: number;
  elevation_change: number;
  avg_power: number;
  max_power: number;
  normalized_power: number;
  avg_hr?: number;
  max_hr?: number;
  avg_cadence?: number;
  avg_speed: number;
  work: number;
  intensity_factor: number;
  variability_index: number;
  gradient: number;
  segment_name?: string;
  strava_segment_id?: string;
  pr_rank?: number;
  kom_rank?: number;
}

export interface EnhancedActivity {
  id: string;
  user_id: string;
  strava_id?: string;
  name: string;
  description?: string;
  type: string;
  start_date: string;
  duration: number;
  distance: number;
  elevation_gain: number;
  
  // Basic metrics
  avg_power?: number;
  max_power?: number;
  avg_hr?: number;
  max_hr?: number;
  avg_cadence?: number;
  max_cadence?: number;
  avg_speed: number;
  max_speed: number;
  calories?: number;
  
  // Advanced metrics
  advanced_metrics?: AdvancedMetrics;
  
  // Environmental data
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  wind_direction?: number;
  
  // Segments and analysis
  segments: ActivitySegment[];
  power_curve?: PowerCurveData[];
  
  created_at: string;
  updated_at: string;
}

export interface AnthropometricData {
  id: string;
  user_id: string;
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: 'male' | 'female' | 'other';
  inseam: number; // cm
  torso_length: number; // cm
  arm_length: number; // cm
  shoulder_width: number; // cm
  shoulder_height: number; // cm
  elbow_height: number; // cm
  hand_length: number; // cm
  foot_length: number; // cm
  knee_height: number; // cm
  hip_width: number; // cm
  sit_bone_width: number; // cm
  flexibility_score: number; // 1-10 scale
  injury_history?: string;
  dominant_leg: 'left' | 'right';
  riding_experience: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  primary_discipline: 'road' | 'mountain' | 'cyclocross' | 'track' | 'triathlon' | 'gravel';
  flexibility_notes?: string;
  measurement_date: string;
  measured_by?: string;
}

export interface BikePosition {
  id: string;
  bicycle_id: string;
  user_id: string;
  saddle_height: number; // mm
  saddle_setback: number; // mm
  saddle_angle: number; // degrees
  handlebar_drop: number; // mm
  handlebar_reach: number; // mm
  stem_length: number; // mm
  stem_angle: number; // degrees
  handlebar_width: number; // mm
  hood_position: number; // mm
  brake_reach: number; // mm
  crank_length: number; // mm
  cleat_fore_aft: number; // mm
  cleat_angle: number; // degrees
  q_factor: number; // mm
  
  // Calculated angles
  knee_angle_max?: number;
  knee_angle_min?: number;
  hip_angle?: number;
  back_angle?: number;
  shoulder_angle?: number;
  elbow_angle?: number;
  wrist_angle?: number;
  
  fit_date: string;
  fitter_name?: string;
  fit_notes?: string;
  comfort_rating?: number; // 1-10 scale
  power_rating?: number; // 1-10 scale
  is_active: boolean;
}

export interface FitSession {
  id: string;
  user_id: string;
  bicycle_id: string;
  session_date: string;
  fitter_id?: string;
  session_type: 'initial' | 'follow_up' | 'maintenance' | 'injury_related';
  goals: string[];
  issues_addressed: string[];
  measurements_taken: string[];
  adjustments_made: string[];
  before_position?: Partial<BikePosition>;
  after_position?: Partial<BikePosition>;
  comfort_improvement?: number;
  power_improvement?: number;
  follow_up_required: boolean;
  session_notes?: string;
  photos?: string[];
  video_analysis?: string;
  cost?: number;
}

export interface PowerZone {
  id: string;
  user_id: string;
  zone_name: string;
  zone_number: number;
  lower_bound: number; // watts
  upper_bound: number; // watts
  percentage_ftp: number;
  description: string;
  color_code: string;
  effective_date: string;
  created_at: string;
}

export interface DashboardConfig {
  id: string;
  user_id: string;
  layout_config: Record<string, unknown>;
  metric_preferences: string[];
  chart_preferences: Record<string, unknown>;
  notification_settings: Record<string, boolean>;
  privacy_settings: Record<string, boolean>;
  theme_preference: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  units_system: 'metric' | 'imperial';
  default_sport: string;
  data_retention_days: number;
  sharing_preferences: Record<string, boolean>;
}

export interface PerformanceInsight {
  id: string;
  user_id: string;
  activity_id?: string;
  insight_type: 'performance' | 'training' | 'recovery' | 'equipment' | 'technique';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  actionable_advice: string[];
  confidence_score: number; // 0-1
  generated_at: string;
  acknowledged: boolean;
}

export interface ComparisonResult {
  activities: EnhancedActivity[];
  metrics_comparison: Record<string, number[]>;
  statistical_significance: Record<string, boolean>;
  performance_trend: 'improving' | 'declining' | 'stable';
  key_differences: string[];
  recommendations: string[];
}