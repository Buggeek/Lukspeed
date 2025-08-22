export interface AnthropometricProfile {
  // Basic measurements
  height_cm: number;
  inseam_cm: number;
  torso_cm: number;
  arm_length_cm: number;
  shoulder_width_cm: number;
  foot_length_cm: number;
  weight_kg: number;
  
  // Flexibility and biomechanics
  flexibility_score: FlexibilityScore;
  pelvic_rotation: string;
  
  // Cycling experience and discipline
  riding_experience: RidingExperience;
  discipline: CyclingDiscipline;
}

export type FlexibilityScore = 'low' | 'medium' | 'high' | '1' | '2' | '3' | '4' | '5';
export type RidingExperience = 'beginner' | 'intermediate' | 'advanced';
export type CyclingDiscipline = 'ruta' | 'gravel' | 'MTB' | 'crono';

export interface UserProfile extends AnthropometricProfile {
  id?: string;
  user_id: string;
  strava_id?: number;
  strava_access_token?: string;
  strava_refresh_token?: string;
  strava_expires_at?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  units: 'metric' | 'imperial';
  created_at?: string;
  updated_at?: string;
}

export interface BikefitCalculations {
  // Calculated ratios
  torso_to_inseam_ratio: number;
  arm_to_torso_ratio: number;
  
  // Preliminary recommendations
  estimated_saddle_height: number;
  estimated_reach: number;
  estimated_stack: number;
  handlebar_width_recommendation: number;
  
  // Flags and warnings
  measurement_flags: string[];
  fit_recommendations: string[];
}

export const MEASUREMENT_RANGES = {
  height_cm: { min: 140, max: 220 },
  inseam_cm: { min: 65, max: 110 },
  torso_cm: { min: 45, max: 80 },
  arm_length_cm: { min: 55, max: 85 },
  shoulder_width_cm: { min: 30, max: 55 },
  foot_length_cm: { min: 22, max: 32 },
  weight_kg: { min: 40, max: 150 }
};

export const DISCIPLINE_DESCRIPTIONS = {
  ruta: {
    name: 'Ciclismo de Ruta',
    description: 'Posición aerodinámica, enfoque en velocidad y eficiencia',
    geometry: 'Agresiva, reach alto, stack bajo'
  },
  gravel: {
    name: 'Gravel',
    description: 'Comodidad para largas distancias en terrenos mixtos',
    geometry: 'Relajada, mayor stack, control y estabilidad'
  },
  MTB: {
    name: 'Mountain Bike',
    description: 'Control y maniobrabilidad en terrenos técnicos',
    geometry: 'Upright, reach moderado, mayor libertad de movimiento'
  },
  crono: {
    name: 'Contrarreloj/Triatlón',
    description: 'Máxima aerodinámica para esfuerzos sostenidos',
    geometry: 'Muy agresiva, reach máximo, stack mínimo'
  }
};