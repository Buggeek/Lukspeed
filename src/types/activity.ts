export interface ActivityStream {
  id: string;
  activity_id: string;
  user_id: string;
  timestamp_offset: number; // seconds from start
  
  // Power data
  power?: number; // watts
  power_3s?: number;
  power_30s?: number;
  
  // Heart rate
  heart_rate?: number; // BPM
  heart_rate_zones?: number; // 1-5
  
  // Speed and distance
  speed?: number; // m/s
  distance?: number; // meters cumulative
  
  // Cadence
  cadence?: number; // RPM
  
  // GPS and elevation
  latitude?: number;
  longitude?: number;
  altitude?: number;
  grade?: number; // percentage
  
  // Environmental
  temperature?: number; // celsius
  
  // Smoothed data
  velocity_smooth?: number;
  power_smooth?: number;
  
  created_at: string;
}

export interface ActivityMetrics {
  id: string;
  activity_id: string;
  user_id: string;
  
  // Power metrics
  normalized_power?: number; // NP watts
  intensity_factor?: number; // IF
  training_stress_score?: number; // TSS
  work?: number; // kilojoules
  
  // Power zone distribution (seconds)
  power_zone_1_time: number;
  power_zone_2_time: number;
  power_zone_3_time: number;
  power_zone_4_time: number;
  power_zone_5_time: number;
  power_zone_6_time: number;
  power_zone_7_time: number;
  
  // Heart rate metrics
  avg_heart_rate?: number;
  max_heart_rate?: number;
  hr_zone_1_time: number;
  hr_zone_2_time: number;
  hr_zone_3_time: number;
  hr_zone_4_time: number;
  hr_zone_5_time: number;
  
  // Power peaks (watts)
  power_5s?: number;
  power_15s?: number;
  power_30s?: number;
  power_1min?: number;
  power_5min?: number;
  power_10min?: number;
  power_20min?: number;
  power_60min?: number;
  
  // Efficiency metrics
  aerobic_efficiency?: number; // power/HR
  power_variability?: number; // coefficient of variation
  
  // Speed metrics
  avg_speed?: number; // m/s
  max_speed?: number; // m/s
  
  // Elevation
  elevation_gain?: number; // meters
  elevation_loss?: number; // meters
  
  // Processing metadata
  fit_file_processed: boolean;
  metrics_calculated_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ProcessingQueueItem {
  id: string;
  user_id: string;
  activity_id: string;
  strava_activity_id: number;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  priority: number;
  
  // File info
  fit_file_url?: string;
  fit_file_size?: number;
  fit_file_downloaded: boolean;
  
  // Processing steps
  step_download: boolean;
  step_parse: boolean;
  step_store_streams: boolean;
  step_calculate_metrics: boolean;
  
  // Error handling
  error_message?: string;
  retry_count: number;
  max_retries: number;
  
  // Timestamps
  created_at: string;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
}

export interface UserTrainingSettings {
  id: string;
  user_id: string;
  
  // Power zones (watts)
  ftp?: number;
  power_zone_1_max?: number; // Active Recovery
  power_zone_2_max?: number; // Endurance
  power_zone_3_max?: number; // Tempo
  power_zone_4_max?: number; // Lactate Threshold
  power_zone_5_max?: number; // VO2 Max
  power_zone_6_max?: number; // Anaerobic Capacity
  
  // Heart rate zones (BPM)
  max_heart_rate?: number;
  resting_heart_rate?: number;
  hr_zone_1_max?: number;
  hr_zone_2_max?: number;
  hr_zone_3_max?: number;
  hr_zone_4_max?: number;
  hr_zone_5_max?: number;
  
  // Auto-sync settings
  auto_sync_enabled: boolean;
  sync_fit_files: boolean;
  calculate_metrics_auto: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface PowerZones {
  zone1: { min: number; max: number; name: string; };
  zone2: { min: number; max: number; name: string; };
  zone3: { min: number; max: number; name: string; };
  zone4: { min: number; max: number; name: string; };
  zone5: { min: number; max: number; name: string; };
  zone6: { min: number; max: number; name: string; };
  zone7: { min: number; max: number; name: string; };
}

export interface HeartRateZones {
  zone1: { min: number; max: number; name: string; };
  zone2: { min: number; max: number; name: string; };
  zone3: { min: number; max: number; name: string; };
  zone4: { min: number; max: number; name: string; };
  zone5: { min: number; max: number; name: string; };
}

// Enhanced Strava activity interface
export interface StravaActivity {
  id: number;
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  start_latlng?: [number, number];
  end_latlng?: [number, number];
  location_city?: string;
  location_state?: string;
  location_country?: string;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  gear_id?: string;
  from_accepted_tag: boolean;
  upload_id?: number;
  external_id?: string;
  
  // Power data
  has_power: boolean;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number; // NP from Strava
  kilojoules?: number;
  device_watts?: boolean;
  
  // Heart rate
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  
  // Speed
  average_speed?: number; // m/s
  max_speed?: number; // m/s
  
  // Cadence  
  average_cadence?: number;
  
  // Temperature
  average_temp?: number;
  
  // Efforts and segments
  segment_efforts?: any[];
  splits_metric?: any[];
  splits_standard?: any[];
  laps?: any[];
  
  // Device info
  device_name?: string;
  embed_token?: string;
  
  // Calculated fields (added by our system)
  intensity_factor?: number;
  training_stress_score?: number;
  power_variability?: number;
  aerobic_efficiency?: number;
  
  // Processing status
  fit_file_processed?: boolean;
  streams_available?: boolean;
}

export interface FitFileData {
  activity_id: string;
  streams: ActivityStream[];
  laps?: any[];
  records?: any[];
  sessions?: any[];
  events?: any[];
  device_info?: any[];
}

export interface StreamType {
  type: 'time' | 'distance' | 'latlng' | 'altitude' | 'velocity_smooth' | 'heartrate' | 'cadence' | 'watts' | 'temp' | 'moving' | 'grade_smooth';
  data: any[];
  series_type: string;
  original_size: number;
  resolution: string;
}

export interface StravaStreams {
  [key: string]: StreamType;
}