export interface BikeFitting {
  id?: string;
  user_id: string;
  bike_id?: string;
  fitting_name: string;
  
  // Core fitting measurements (all in mm except angles)
  stack_objetivo?: number; // mm - Altura vertical entre eje pedalier y stack del cuadro ajustado
  reach_objetivo?: number; // mm - Distancia horizontal efectiva a manillar
  saddle_height_mm?: number; // mm - Altura del sillín desde eje pedalier
  saddle_setback_mm?: number; // mm - Distancia del sillín hacia atrás desde eje BB
  saddle_angle_deg?: number; // ° - Ángulo del sillín (inclinación)
  handlebar_reach_mm?: number; // mm - Distancia hasta el centro del manillar
  handlebar_drop_mm?: number; // mm - Caída desde stack al manillar
  crank_length_mm?: number; // mm - Largo de la biela
  cleat_position_mm?: number; // mm - Posición de calas
  
  // Additional components
  stem_length_mm?: number;
  stem_angle_deg?: number;
  spacers_mm?: number;
  handlebar_width_mm?: number;
  
  // Metadata
  fitting_type: FittingType;
  fitted_by?: string; // Name of fitter or 'auto' for algorithm
  fitting_date?: string;
  notes?: string;
  
  created_at?: string;
  updated_at?: string;
}

export type FittingType = 'basic' | 'advanced' | 'professional';

export interface FittingCalculations {
  // Input measurements
  height_cm: number;
  inseam_cm: number;
  torso_cm: number;
  arm_length_cm: number;
  shoulder_width_cm: number;
  weight_kg: number;
  flexibility_score: string;
  pelvic_rotation: number;
  riding_experience: string;
  discipline: string;
  
  // Calculated fitting
  calculated_fitting: BikeFitting;
  
  // Analysis and ratios
  torso_inseam_ratio: number;
  estimated_stack: number;
  estimated_reach: number;
  saddle_height_formula: 'lemond' | 'hamley' | 'holmes' | 'custom';
  
  // Recommendations and flags
  recommendations: FittingRecommendation[];
  warnings: string[];
  confidence_score: number; // 0-100
}

export interface FittingRecommendation {
  category: 'position' | 'component' | 'adjustment' | 'comfort';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  measurement_affected?: string;
  suggested_change?: string;
}

export const FITTING_FORMULAS = {
  saddle_height: {
    lemond: (inseam: number) => Math.round(inseam * 0.883), // Classic LeMond formula
    hamley: (inseam: number) => Math.round(inseam * 0.885), // Hamley & Thomas
    holmes: (inseam: number) => Math.round(inseam * 0.887), // Holmes method
  },
  
  crank_length: {
    standard: (inseam: number) => {
      if (inseam < 75) return 165;
      if (inseam < 80) return 170;
      if (inseam < 88) return 172.5;
      if (inseam < 93) return 175;
      return 177.5;
    }
  },
  
  handlebar_width: (shoulder: number) => Math.round(shoulder * 10), // cm to mm
  
  reach_estimate: (torso: number, arm: number, discipline: string, experience: string) => {
    const base = (torso + arm) * 0.8;
    
    let modifier = 1.0;
    
    // Discipline adjustments
    switch (discipline) {
      case 'crono': modifier += 0.05; break;
      case 'ruta': modifier += 0.02; break;
      case 'gravel': modifier -= 0.02; break;
      case 'MTB': modifier -= 0.05; break;
    }
    
    // Experience adjustments
    switch (experience) {
      case 'beginner': modifier -= 0.05; break;
      case 'intermediate': modifier += 0.0; break;
      case 'advanced': modifier += 0.03; break;
    }
    
    return Math.round(base * modifier);
  },
  
  stack_estimate: (torso: number, flexibility: string, discipline: string) => {
    let base = torso * 8; // Base stack in mm
    
    // Flexibility adjustments
    switch (flexibility) {
      case 'low': base += 30; break;
      case 'medium': base += 0; break;
      case 'high': base -= 20; break;
    }
    
    // Discipline adjustments
    switch (discipline) {
      case 'crono': base -= 40; break;
      case 'ruta': base -= 20; break;
      case 'gravel': base += 10; break;
      case 'MTB': base += 30; break;
    }
    
    return Math.round(base);
  }
};

export const MEASUREMENT_TOLERANCES = {
  saddle_height_mm: { min: -10, max: 10 }, // ±10mm is acceptable
  reach_objetivo: { min: -20, max: 20 }, // ±20mm reach variance
  stack_objetivo: { min: -15, max: 15 }, // ±15mm stack variance
  handlebar_width_mm: { min: -20, max: 20 }, // ±20mm width variance
  crank_length_mm: { exact: [165, 167.5, 170, 172.5, 175, 177.5, 180] } // Standard sizes
};

export const DISCIPLINE_GEOMETRY_TARGETS = {
  ruta: {
    reach_modifier: 1.02,
    stack_modifier: 0.98,
    saddle_setback_modifier: 1.0,
    description: 'Posición aerodinámica para velocidad'
  },
  gravel: {
    reach_modifier: 0.98,
    stack_modifier: 1.05,
    saddle_setback_modifier: 0.98,
    description: 'Comodidad para largas distancias'
  },
  MTB: {
    reach_modifier: 0.95,
    stack_modifier: 1.10,
    saddle_setback_modifier: 0.95,
    description: 'Control y maniobrabilidad'
  },
  crono: {
    reach_modifier: 1.05,
    stack_modifier: 0.92,
    saddle_setback_modifier: 1.05,
    description: 'Máxima aerodinámica'
  }
};