import { AnthropometricProfile } from '@/types/profile';
import { BikeFitting, FittingCalculations } from '@/types/fitting';

export interface FittingFormula {
  name: string;
  description: string;
  calculate: (measurements: AnthropometricProfile) => Partial<BikeFitting>;
}

// Professional Bike Fitting Formulas
export const FITTING_FORMULAS = {
  // Saddle Height Formulas
  saddle_height: {
    lemond: (inseam: number) => Math.round(inseam * 0.883), // Classic LeMond formula
    hamley: (inseam: number) => Math.round(inseam * 0.885), // Hamley & Thomas
    holmes: (inseam: number) => Math.round(inseam * 0.887), // Holmes method
    competitive: (inseam: number) => Math.round(inseam * 0.890), // Competitive/aggressive
  },
  
  // Saddle Setback Calculation
  saddle_setback: {
    standard: (inseam: number, discipline: string) => {
      const base = Math.round(inseam * 0.25);
      const disciplineModifier = {
        'crono': 1.15, // More aggressive forward position
        'ruta': 1.05,
        'gravel': 1.0,
        'MTB': 0.95    // More upright
      };
      return Math.round(base * (disciplineModifier[discipline as keyof typeof disciplineModifier] || 1.0));
    }
  },
  
  // Reach Calculation
  reach: {
    calculate: (torso: number, arm: number, flexibility: string, discipline: string, experience: string) => {
      // Base reach from anthropometrics
      let baseReach = (torso + arm) * 0.8;
      
      // Flexibility adjustments
      const flexibilityModifier = {
        'low': 0.92,     // Shorter reach for limited flexibility
        'medium': 1.0,
        'high': 1.08     // Longer reach for high flexibility
      };
      
      // Discipline adjustments
      const disciplineModifier = {
        'crono': 1.08,   // Aggressive aerodynamic position
        'ruta': 1.03,    // Moderately aggressive
        'gravel': 0.98,  // Comfort-oriented
        'MTB': 0.93      // Upright control position
      };
      
      // Experience adjustments
      const experienceModifier = {
        'beginner': 0.95,    // Conservative position
        'intermediate': 1.0,
        'advanced': 1.05     // Can handle aggressive positions
      };
      
      baseReach *= flexibilityModifier[flexibility as keyof typeof flexibilityModifier] || 1.0;
      baseReach *= disciplineModifier[discipline as keyof typeof disciplineModifier] || 1.0;
      baseReach *= experienceModifier[experience as keyof typeof experienceModifier] || 1.0;
      
      return Math.round(baseReach);
    }
  },
  
  // Stack Calculation
  stack: {
    calculate: (torso: number, flexibility: string, discipline: string, experience: string) => {
      // Base stack from torso length
      let baseStack = torso * 8.5; // mm
      
      // Flexibility adjustments
      const flexibilityAdjustment = {
        'low': 35,      // Higher stack for limited flexibility
        'medium': 0,
        'high': -25     // Lower stack for high flexibility
      };
      
      // Discipline adjustments
      const disciplineAdjustment = {
        'crono': -45,   // Very low and aggressive
        'ruta': -20,    // Moderately low
        'gravel': 15,   // Comfort height
        'MTB': 35       // Upright position
      };
      
      // Experience adjustments
      const experienceAdjustment = {
        'beginner': 20,     // Higher for comfort
        'intermediate': 0,
        'advanced': -15     // Lower for performance
      };
      
      baseStack += flexibilityAdjustment[flexibility as keyof typeof flexibilityAdjustment] || 0;
      baseStack += disciplineAdjustment[discipline as keyof typeof disciplineAdjustment] || 0;
      baseStack += experienceAdjustment[experience as keyof typeof experienceAdjustment] || 0;
      
      return Math.round(baseStack);
    }
  },
  
  // Crank Length Calculation
  crank_length: {
    calculate: (inseam: number, discipline: string) => {
      // Standard crank length based on inseam
      let crankLength = 170; // Default
      
      if (inseam < 76) crankLength = 165;
      else if (inseam < 81) crankLength = 170;
      else if (inseam < 87) crankLength = 172.5;
      else if (inseam < 92) crankLength = 175;
      else crankLength = 177.5;
      
      // Discipline adjustments
      if (discipline === 'crono') crankLength += 2.5; // Longer for TT
      if (discipline === 'MTB') crankLength -= 2.5;   // Shorter for clearance
      
      return crankLength;
    }
  },
  
  // Handlebar Width Calculation
  handlebar_width: {
    calculate: (shoulderWidth: number, discipline: string) => {
      let width = shoulderWidth * 10; // Convert cm to mm
      
      // Discipline adjustments
      const disciplineAdjustment = {
        'crono': -20,  // Narrower for aero
        'ruta': 0,     // Standard
        'gravel': 20,  // Wider for control
        'MTB': 100     // Much wider for MTB
      };
      
      width += disciplineAdjustment[discipline as keyof typeof disciplineAdjustment] || 0;
      
      return Math.round(width);
    }
  },
  
  // Cleat Position Calculation
  cleat_position: {
    calculate: (footLength: number, discipline: string) => {
      // KOPS method - cleat behind ball of foot
      const ballOfFootPosition = footLength * 0.445; // 44.5% from heel to ball
      let cleatPosition = ballOfFootPosition;
      
      // Discipline adjustments
      if (discipline === 'crono') cleatPosition -= 2; // Slightly forward for power
      if (discipline === 'MTB') cleatPosition += 3;   // Slightly back for stability
      
      return Math.round(cleatPosition);
    }
  }
};

// Main Fitting Calculator
export class FittingCalculator {
  static calculateCompleteFitting(
    profile: AnthropometricProfile,
    method: 'conservative' | 'standard' | 'aggressive' = 'standard'
  ): BikeFitting {
    const {
      height_cm,
      inseam_cm,
      torso_cm,
      arm_length_cm,
      shoulder_width_cm,
      foot_length_cm,
      weight_kg,
      flexibility_score,
      pelvic_rotation,
      riding_experience,
      discipline
    } = profile;

    // Choose saddle height formula based on method and experience
    let saddleHeightFormula: keyof typeof FITTING_FORMULAS.saddle_height = 'lemond';
    if (method === 'aggressive' || (riding_experience === 'advanced' && discipline === 'crono')) {
      saddleHeightFormula = 'competitive';
    } else if (riding_experience === 'intermediate') {
      saddleHeightFormula = 'hamley';
    } else if (method === 'conservative') {
      saddleHeightFormula = 'lemond';
    }

    // Calculate all measurements
    const saddle_height_mm = FITTING_FORMULAS.saddle_height[saddleHeightFormula](inseam_cm);
    const saddle_setback_mm = FITTING_FORMULAS.saddle_setback.standard(inseam_cm, discipline);
    const reach_objetivo = FITTING_FORMULAS.reach.calculate(
      torso_cm, arm_length_cm, flexibility_score, discipline, riding_experience
    );
    const stack_objetivo = FITTING_FORMULAS.stack.calculate(
      torso_cm, flexibility_score, discipline, riding_experience
    );
    const crank_length_mm = FITTING_FORMULAS.crank_length.calculate(inseam_cm, discipline);
    const handlebar_width_mm = FITTING_FORMULAS.handlebar_width.calculate(shoulder_width_cm, discipline);
    const cleat_position_mm = FITTING_FORMULAS.cleat_position.calculate(foot_length_cm, discipline);

    // Calculate derived measurements
    const handlebar_reach_mm = reach_objetivo;
    const handlebar_drop_mm = Math.round(stack_objetivo * 0.12); // Typical drop is ~12% of stack
    
    // Saddle angle based on flexibility and pelvic rotation
    let saddle_angle_deg = 0;
    if (flexibility_score === 'low') saddle_angle_deg = 1;
    if (parseInt(pelvic_rotation) < 15) saddle_angle_deg += 0.5;
    
    // Additional component calculations
    const stem_length_mm = Math.round(reach_objetivo * 0.18); // ~18% of reach
    const stem_angle_deg = flexibility_score === 'low' ? 17 : 
                          flexibility_score === 'high' ? -6 : 6;
    const spacers_mm = flexibility_score === 'low' ? 30 : 
                      flexibility_score === 'high' ? 5 : 15;

    const fitting: BikeFitting = {
      user_id: '',
      fitting_name: `${discipline} Fitting - ${new Date().toLocaleDateString()}`,
      
      // Core measurements
      stack_objetivo,
      reach_objetivo,
      saddle_height_mm,
      saddle_setback_mm,
      saddle_angle_deg,
      handlebar_reach_mm,
      handlebar_drop_mm,
      crank_length_mm,
      cleat_position_mm,
      
      // Additional components
      stem_length_mm,
      stem_angle_deg,
      spacers_mm,
      handlebar_width_mm,
      
      fitting_type: 'basic',
      fitted_by: `Auto (${saddleHeightFormula.toUpperCase()})`,
      notes: `Calculated using ${method} methodology for ${discipline} discipline`
    };

    return fitting;
  }

  static validateFitting(fitting: BikeFitting, profile: AnthropometricProfile): {
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Validate saddle height against multiple formulas
    const leMondHeight = FITTING_FORMULAS.saddle_height.lemond(profile.inseam_cm);
    const hamleyHeight = FITTING_FORMULAS.saddle_height.hamley(profile.inseam_cm);
    
    if (Math.abs((fitting.saddle_height_mm || 0) - leMondHeight) > 15) {
      warnings.push(`Altura de sillín ${Math.abs((fitting.saddle_height_mm || 0) - leMondHeight)}mm diferente de fórmula LeMond`);
    }

    // Validate reach vs torso length
    const expectedReach = (profile.torso_cm + profile.arm_length_cm) * 0.8;
    if (Math.abs((fitting.reach_objetivo || 0) - expectedReach) > 30) {
      warnings.push('Reach significativamente diferente de proporciones corporales');
    }

    // Validate crank length
    const recommendedCrank = FITTING_FORMULAS.crank_length.calculate(profile.inseam_cm, profile.discipline);
    if (Math.abs((fitting.crank_length_mm || 0) - recommendedCrank) > 5) {
      recommendations.push(`Considera bielas de ${recommendedCrank}mm para tu entrepierna`);
    }

    // Flexibility vs position aggressiveness
    if (profile.flexibility_score === 'low' && (fitting.stack_objetivo || 0) < 500) {
      warnings.push('Posición muy agresiva para flexibilidad limitada');
      recommendations.push('Aumenta stack con espaciadores o potencia con ángulo positivo');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      recommendations
    };
  }

  static compareFittings(current: BikeFitting, previous: BikeFitting): {
    changes: { field: string; old: number; new: number; difference: number }[];
    summary: string;
  } {
    const changes: { field: string; old: number; new: number; difference: number }[] = [];
    
    const compareFields = [
      'stack_objetivo', 'reach_objetivo', 'saddle_height_mm', 'saddle_setback_mm',
      'handlebar_reach_mm', 'handlebar_drop_mm', 'crank_length_mm'
    ];

    compareFields.forEach(field => {
      const currentVal = current[field as keyof BikeFitting] as number || 0;
      const previousVal = previous[field as keyof BikeFitting] as number || 0;
      const difference = currentVal - previousVal;
      
      if (Math.abs(difference) > 1) { // Only significant changes
        changes.push({
          field,
          old: previousVal,
          new: currentVal,
          difference
        });
      }
    });

    let summary = 'Sin cambios significativos';
    if (changes.length > 0) {
      summary = `${changes.length} ajustes realizados`;
    }

    return { changes, summary };
  }
}

export default FittingCalculator;