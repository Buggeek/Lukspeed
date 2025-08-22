import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tebrbispkzjtlilpquaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYnJiaXNwa3pqdGxpbHBxdWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzU1MzYsImV4cCI6MjA3MDYxMTUzNn0.fc45UJE8HIPvUODdQVMFNL2uDQCOD27gLWk24ghtaws';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
  id: string;
  user_id: string;
  strava_id?: number;
  strava_access_token?: string;
  strava_refresh_token?: string;
  strava_expires_at?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number; // cm
  wingspan?: number; // cm
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  ftp?: number;
  max_hr?: number;
  resting_hr?: number;
  cycling_goals?: string[];
  units?: 'metric' | 'imperial';
  privacy_level?: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
}

export interface WeightHistory {
  id: string;
  user_id: string;
  weight: number;
  recorded_date: string;
  notes?: string;
  created_at: string;
}

export interface Bike {
  id: string;
  user_id: string;
  strava_gear_id?: string;
  name: string;
  brand?: string;
  model?: string;
  bike_type?: 'road' | 'mountain' | 'gravel' | 'track' | 'tt' | 'cyclocross' | 'hybrid';
  weight?: number;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  bike_id?: string;
  strava_activity_id: number;
  name: string;
  activity_type?: string;
  start_date: string;
  distance?: number;
  moving_time?: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  average_watts?: number;
  max_watts?: number;
  weighted_power?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_speed?: number;
  max_speed?: number;
  intensity_factor?: number;
  training_stress_score?: number;
  cda?: number;
  crr?: number;
  efficiency_factor?: number;
  fit_file_processed: boolean;
  fit_file_url?: string;
  raw_data?: any;
  sync_status: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncStatus {
  id: string;
  user_id: string;
  total_activities: number;
  processed_activities: number;
  failed_activities: number;
  status: 'idle' | 'importing' | 'processing' | 'completed' | 'error';
  current_activity?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}