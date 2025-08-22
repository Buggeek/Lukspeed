export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  strava_id?: string;
  strava_access_token?: string;
  strava_refresh_token?: string;
  strava_token_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CyclistProfile {
  id: string;
  user_id: string;
  height_cm?: number;
  inseam_cm?: number;
  torso_cm?: number;
  arm_length_cm?: number;
  cycling_experience?: 'beginner' | 'intermediate' | 'advanced';
  flexibility?: 'low' | 'medium' | 'high';
  primary_goal?: 'racing' | 'endurance' | 'comfort';
  created_at: string;
  updated_at: string;
}

export interface Bicycle {
  id: string;
  user_id: string;
  strava_gear_id?: string;
  brand?: string;
  model?: string;
  type?: 'road' | 'mtb' | 'gravel';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Fitting {
  id: string;
  bicycle_id: string;
  saddle_height_mm?: number;
  saddle_setback_mm?: number;
  saddle_angle_deg?: number;
  handlebar_reach_mm?: number;
  handlebar_drop_mm?: number;
  crank_length_mm?: number;
  frame_stack_mm?: number;
  frame_reach_mm?: number;
  saddle_model?: string;
  handlebar_model?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ComponentConfiguration {
  id: string;
  bicycle_id: string;
  fitting_id?: string;
  component_type: 'helmet' | 'jersey' | 'wheel' | 'tire' | 'sensor' | 'others';
  brand?: string;
  model?: string;
  pressure_psi?: number;
  width_mm?: number;
  notes?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  bicycle_id?: string;
  fitting_id?: string;
  name?: string;
  type?: string;
  distance_m?: number;
  moving_time_s?: number;
  elapsed_time_s?: number;
  total_elevation_gain_m?: number;
  average_speed_ms?: number;
  max_speed_ms?: number;
  average_power?: number;
  max_power?: number;
  normalized_power?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  calories?: number;
  has_aerosensor_data: boolean;
  ambient_conditions_json?: Record<string, unknown>;
  start_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityDataPoint {
  id: number;
  activity_id: string;
  timestamp: string;
  power?: number;
  heart_rate?: number;
  cadence?: number;
  speed?: number;
  altitude?: number;
  distance?: number;
  temperature?: number;
  left_right_balance?: number;
  left_power?: number;
  right_power?: number;
  created_at: string;
}

export interface ActivityMetrics {
  id: string;
  activity_id: string;
  avg_power?: number;
  max_power?: number;
  avg_speed?: number;
  max_speed?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_cadence?: number;
  normalized_power?: number;
  intensity_factor?: number;
  training_stress_score?: number;
  cda_estimated?: number;
  crr_estimated?: number;
  mechanical_efficiency?: number;
  aerodynamic_efficiency?: number;
}

export interface DashboardData {
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
  avgPower: number;
  recentActivities: Activity[];
  performanceTrends: {
    date: string;
    power: number;
    speed: number;
    distance: number;
  }[];
}