import type { ActivityPoint } from '@/types/activity';
import type { UserProfile } from '@/types/profile';

export interface PhysicalPowerComponents {
  power_aero: number[];      // Aerodynamic power per second (W)
  power_rr: number[];        // Rolling resistance power per second (W)
  power_gravity: number[];   // Gravitational power per second (W)
  power_total_calculated: number[]; // Sum of components (W)
  power_total_measured: number[];   // Actual measured power (W)
}

export interface AerodynamicEstimates {
  CdA_estimated: number;     // Drag coefficient * frontal area (m²)
  Crr_estimated: number;     // Rolling resistance coefficient
  confidence_score: number;  // Estimation confidence (0-1)
  segments_used_CdA: number; // Number of segments used for CdA estimation
  segments_used_Crr: number; // Number of segments used for Crr estimation
}

export interface EnvironmentalConditions {
  air_density: number;       // Air density (kg/m³)
  temperature: number;       // Temperature (°C)
  pressure: number;          // Atmospheric pressure (Pa)
  humidity: number;          // Relative humidity (%)
  wind_speed?: number;       // Wind speed (m/s)
  wind_direction?: number;   // Wind direction (degrees)
}

export interface PhysicalPowerAnalysis {
  activity_id: string;
  components: PhysicalPowerComponents;
  estimates: AerodynamicEstimates;
  conditions: EnvironmentalConditions;
  mass_data: {
    cyclist_mass: number;    // Cyclist weight (kg)
    bike_mass: number;       // Bike weight (kg)
    total_mass: number;      // Total system mass (kg)
  };
  validation: {
    power_conservation_error: number; // RMS error between measured and calculated (W)
    components_realistic: boolean;    // All components within realistic ranges
    estimates_realistic: boolean;     // CdA and Crr within realistic ranges
  };
  timestamp: string;
}

export class PhysicalPowerService {
  private static readonly GRAVITY = 9.81; // m/s²
  private static readonly AIR_GAS_CONSTANT = 287.058; // J/(kg·K)

  /**
   * Analyze complete physical power breakdown for an activity
   */
  static analyzeActivityPhysics(
    activityData: ActivityPoint[],
    userProfile?: Partial<UserProfile>,
    environmentalConditions?: Partial<EnvironmentalConditions>
  ): PhysicalPowerAnalysis {
    
    // Validate input data
    if (!activityData || activityData.length === 0) {
      throw new Error('No activity data provided for physical analysis');
    }

    // Calculate default environmental conditions if not provided
    const conditions = this.calculateEnvironmentalConditions(environmentalConditions);
    
    // Calculate system mass
    const massData = this.calculateSystemMass(userProfile);
    
    // Calculate gradients from elevation data
    const gradients = this.calculateGradients(activityData);
    
    // Decompose power into physical components
    const components = this.decomposePowerComponents(
      activityData,
      massData.total_mass,
      conditions.air_density,
      gradients
    );
    
    // Estimate aerodynamic parameters
    const estimates = this.estimateAerodynamicParameters(
      activityData,
      components,
      massData.total_mass,
      conditions.air_density,
      gradients
    );
    
    // Validate results
    const validation = this.validatePhysicalResults(components, estimates);
    
    return {
      activity_id: activityData[0]?.timestamp_seconds?.toString() || 'unknown',
      components,
      estimates,
      conditions,
      mass_data: massData,
      validation,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Decompose total power into three physical components
   * Formula: power_total = power_aero + power_rr + power_gravity
   */
  private static decomposePowerComponents(
    activityData: ActivityPoint[],
    totalMass: number,
    airDensity: number,
    gradients: number[]
  ): PhysicalPowerComponents {
    
    const power_aero: number[] = [];
    const power_rr: number[] = [];
    const power_gravity: number[] = [];
    const power_total_measured: number[] = [];
    
    // Use estimated CdA and Crr for initial calculation (will be refined later)
    const estimatedCdA = 0.30; // Initial guess - typical road bike
    const estimatedCrr = 0.005; // Initial guess - good road tires
    
    activityData.forEach((point, index) => {
      const speedMs = (point.speed_kmh || 0) / 3.6; // Convert km/h to m/s
      const powerMeasured = point.power_watts || 0;
      const gradient = gradients[index] || 0;
      
      // Calculate each component using physics formulas
      
      // 1. Aerodynamic power: P_aero = 0.5 * CdA * ρ * v³
      const power_aero_w = 0.5 * estimatedCdA * airDensity * Math.pow(speedMs, 3);
      
      // 2. Rolling resistance power: P_rr = Crr * m * g * v
      const power_rr_w = estimatedCrr * totalMass * this.GRAVITY * speedMs;
      
      // 3. Gravitational power: P_gravity = m * g * v * sin(θ)
      const angle = Math.atan(gradient);
      const power_gravity_w = totalMass * this.GRAVITY * speedMs * Math.sin(angle);
      
      power_aero.push(Number(power_aero_w.toFixed(2)));
      power_rr.push(Number(power_rr_w.toFixed(2)));
      power_gravity.push(Number(power_gravity_w.toFixed(2)));
      power_total_measured.push(powerMeasured);
    });
    
    // Calculate total from components
    const power_total_calculated = power_aero.map((aero, i) => 
      aero + power_rr[i] + power_gravity[i]
    );
    
    return {
      power_aero,
      power_rr,
      power_gravity,
      power_total_calculated,
      power_total_measured
    };
  }

  /**
   * Estimate CdA and Crr using statistical regression on filtered segments
   */
  private static estimateAerodynamicParameters(
    activityData: ActivityPoint[],
    components: PhysicalPowerComponents,
    totalMass: number,
    airDensity: number,
    gradients: number[]
  ): AerodynamicEstimates {
    
    // Find segments suitable for CdA estimation (flat, fast)
    const cdaSegments = this.findCdAEstimationSegments(activityData, gradients);
    
    // Find segments suitable for Crr estimation (flat, moderate speed)
    const crrSegments = this.findCrrEstimationSegments(activityData, gradients);
    
    let CdA_estimated = 0.30; // Default fallback
    let Crr_estimated = 0.005; // Default fallback
    let confidence_score = 0.5;
    
    // Estimate CdA from flat, high-speed segments
    if (cdaSegments.length >= 3) {
      const cdaValues: number[] = [];
      
      cdaSegments.forEach(segment => {
        const avgPower = segment.avgPower;
        const avgSpeed = segment.avgSpeed / 3.6; // km/h to m/s
        
        // Subtract rolling resistance and gravity components
        const power_rr_segment = Crr_estimated * totalMass * this.GRAVITY * avgSpeed;
        const power_gravity_segment = totalMass * this.GRAVITY * avgSpeed * Math.sin(Math.atan(segment.avgGradient));
        
        const power_aero_segment = avgPower - power_rr_segment - power_gravity_segment;
        
        // Calculate CdA: CdA = (2 * P_aero) / (ρ * v³)
        if (avgSpeed > 0 && power_aero_segment > 0) {
          const cda = (2 * power_aero_segment) / (airDensity * Math.pow(avgSpeed, 3));
          if (cda >= 0.15 && cda <= 0.60) { // Realistic range
            cdaValues.push(cda);
          }
        }
      });
      
      if (cdaValues.length > 0) {
        CdA_estimated = this.calculateMedian(cdaValues);
      }
    }
    
    // Estimate Crr from flat, moderate-speed segments  
    if (crrSegments.length >= 5) {
      const crrValues: number[] = [];
      
      crrSegments.forEach(segment => {
        const avgPower = segment.avgPower;
        const avgSpeed = segment.avgSpeed / 3.6; // km/h to m/s
        
        // Subtract aerodynamic and gravity components
        const power_aero_segment = 0.5 * CdA_estimated * airDensity * Math.pow(avgSpeed, 3);
        const power_gravity_segment = totalMass * this.GRAVITY * avgSpeed * Math.sin(Math.atan(segment.avgGradient));
        
        const power_rr_segment = avgPower - power_aero_segment - power_gravity_segment;
        
        // Calculate Crr: Crr = P_rr / (m * g * v)
        if (avgSpeed > 0 && power_rr_segment > 0) {
          const crr = power_rr_segment / (totalMass * this.GRAVITY * avgSpeed);
          if (crr >= 0.002 && crr <= 0.020) { // Realistic range
            crrValues.push(crr);
          }
        }
      });
      
      if (crrValues.length > 0) {
        Crr_estimated = this.calculateMedian(crrValues);
      }
    }
    
    // Calculate confidence based on number of segments and consistency
    const segmentScore = Math.min(1, (cdaSegments.length + crrSegments.length) / 10);
    const rangeScore = (CdA_estimated >= 0.20 && CdA_estimated <= 0.45 && 
                      Crr_estimated >= 0.003 && Crr_estimated <= 0.008) ? 1 : 0.5;
    confidence_score = (segmentScore + rangeScore) / 2;
    
    return {
      CdA_estimated: Number(CdA_estimated.toFixed(4)),
      Crr_estimated: Number(Crr_estimated.toFixed(5)),
      confidence_score: Number(confidence_score.toFixed(2)),
      segments_used_CdA: cdaSegments.length,
      segments_used_Crr: crrSegments.length
    };
  }

  /**
   * Find segments suitable for CdA estimation (flat terrain, high speed)
   */
  private static findCdAEstimationSegments(
    activityData: ActivityPoint[],
    gradients: number[]
  ): Array<{avgPower: number; avgSpeed: number; avgGradient: number; duration: number}> {
    
    const segments: Array<{avgPower: number; avgSpeed: number; avgGradient: number; duration: number}> = [];
    const windowSize = 30; // 30-second windows
    
    for (let i = 0; i <= activityData.length - windowSize; i += 10) {
      const window = activityData.slice(i, i + windowSize);
      const gradientWindow = gradients.slice(i, i + windowSize);
      
      // Calculate averages for this window
      const avgPower = window.reduce((sum, p) => sum + (p.power_watts || 0), 0) / windowSize;
      const avgSpeed = window.reduce((sum, p) => sum + (p.speed_kmh || 0), 0) / windowSize;
      const avgGradient = gradientWindow.reduce((sum, g) => sum + Math.abs(g), 0) / windowSize;
      
      // Filter criteria for CdA estimation:
      // - Flat terrain (gradient < 2%)
      // - High speed (> 30 km/h)  
      // - Sufficient power (> 100W)
      // - Data quality (no zeros)
      if (avgGradient < 0.02 && 
          avgSpeed > 30 && 
          avgPower > 100 &&
          window.every(p => p.power_watts > 0 && p.speed_kmh > 0)) {
        
        segments.push({
          avgPower,
          avgSpeed, 
          avgGradient,
          duration: windowSize
        });
      }
    }
    
    return segments;
  }

  /**
   * Find segments suitable for Crr estimation (flat terrain, moderate speed)
   */
  private static findCrrEstimationSegments(
    activityData: ActivityPoint[],
    gradients: number[]
  ): Array<{avgPower: number; avgSpeed: number; avgGradient: number; duration: number}> {
    
    const segments: Array<{avgPower: number; avgSpeed: number; avgGradient: number; duration: number}> = [];
    const windowSize = 60; // 60-second windows for better stability
    
    for (let i = 0; i <= activityData.length - windowSize; i += 15) {
      const window = activityData.slice(i, i + windowSize);
      const gradientWindow = gradients.slice(i, i + windowSize);
      
      // Calculate averages for this window
      const avgPower = window.reduce((sum, p) => sum + (p.power_watts || 0), 0) / windowSize;
      const avgSpeed = window.reduce((sum, p) => sum + (p.speed_kmh || 0), 0) / windowSize;
      const avgGradient = gradientWindow.reduce((sum, g) => sum + Math.abs(g), 0) / windowSize;
      
      // Filter criteria for Crr estimation:
      // - Very flat terrain (gradient < 1%)
      // - Moderate speed (15-25 km/h for better Crr signal)
      // - Sufficient power (> 50W)
      // - Data quality (no zeros)
      if (avgGradient < 0.01 && 
          avgSpeed >= 15 && avgSpeed <= 25 && 
          avgPower > 50 &&
          window.every(p => p.power_watts > 0 && p.speed_kmh > 0)) {
        
        segments.push({
          avgPower,
          avgSpeed,
          avgGradient, 
          duration: windowSize
        });
      }
    }
    
    return segments;
  }

  /**
   * Calculate gradients from elevation data
   */
  private static calculateGradients(activityData: ActivityPoint[]): number[] {
    const gradients: number[] = [];
    
    for (let i = 0; i < activityData.length; i++) {
      if (i === 0) {
        gradients.push(0); // First point has no gradient
        continue;
      }
      
      const currentPoint = activityData[i];
      const previousPoint = activityData[i - 1];
      
      const elevationDiff = (currentPoint.altitude_m || 0) - (previousPoint.altitude_m || 0);
      const timeDiff = (currentPoint.timestamp_seconds || i) - (previousPoint.timestamp_seconds || i - 1);
      const speedMs = ((currentPoint.speed_kmh || 0) + (previousPoint.speed_kmh || 0)) / 2 / 3.6;
      
      // Estimate distance from speed and time
      const distance = speedMs * timeDiff;
      
      // Calculate gradient (rise/run)
      const gradient = distance > 0 ? elevationDiff / distance : 0;
      
      // Limit gradient to realistic values (-20% to +20%)
      const limitedGradient = Math.max(-0.20, Math.min(0.20, gradient));
      
      gradients.push(limitedGradient);
    }
    
    return gradients;
  }

  /**
   * Calculate environmental conditions with defaults
   */
  private static calculateEnvironmentalConditions(
    provided?: Partial<EnvironmentalConditions>
  ): EnvironmentalConditions {
    
    const temperature = provided?.temperature ?? 20; // °C
    const pressure = provided?.pressure ?? 101325; // Pa (sea level)
    const humidity = provided?.humidity ?? 50; // %
    
    // Calculate air density using ideal gas law with humidity correction
    const airDensity = this.calculateAirDensity(temperature, pressure, humidity);
    
    return {
      air_density: airDensity,
      temperature,
      pressure,
      humidity,
      wind_speed: provided?.wind_speed ?? 0,
      wind_direction: provided?.wind_direction ?? 0
    };
  }

  /**
   * Calculate air density from temperature, pressure, and humidity
   * Uses ideal gas law with water vapor correction
   */
  private static calculateAirDensity(
    temperature: number, // °C
    pressure: number,    // Pa
    humidity: number     // % relative humidity
  ): number {
    
    const tempKelvin = temperature + 273.15;
    
    // Saturation vapor pressure (Magnus formula)
    const saturationPressure = 610.78 * Math.exp(17.27 * temperature / (temperature + 237.3));
    
    // Partial pressure of water vapor
    const vaporPressure = (humidity / 100) * saturationPressure;
    
    // Partial pressure of dry air
    const dryAirPressure = pressure - vaporPressure;
    
    // Air density calculation with humidity correction
    const dryAirDensity = dryAirPressure / (this.AIR_GAS_CONSTANT * tempKelvin);
    const vaporDensity = vaporPressure / (461.495 * tempKelvin); // Water vapor gas constant
    
    const airDensity = dryAirDensity + vaporDensity;
    
    // Realistic bounds check (0.8 to 1.3 kg/m³)
    return Math.max(0.8, Math.min(1.3, airDensity));
  }

  /**
   * Calculate system mass (cyclist + bike + accessories)
   */
  private static calculateSystemMass(userProfile?: Partial<UserProfile>): {
    cyclist_mass: number;
    bike_mass: number;
    total_mass: number;
  } {
    
    const cyclist_mass = userProfile?.weight || 75; // kg, default
    const bike_mass = userProfile?.bike_weight || 8; // kg, typical road bike
    const accessories_mass = 2; // kg, estimate for clothing, helmet, etc.
    
    return {
      cyclist_mass,
      bike_mass: bike_mass + accessories_mass,
      total_mass: cyclist_mass + bike_mass + accessories_mass
    };
  }

  /**
   * Validate physical results for realism and consistency
   */
  private static validatePhysicalResults(
    components: PhysicalPowerComponents,
    estimates: AerodynamicEstimates
  ): {
    power_conservation_error: number;
    components_realistic: boolean;
    estimates_realistic: boolean;
  } {
    
    // Calculate RMS error between measured and calculated power
    const errors = components.power_total_measured.map((measured, i) => 
      measured - components.power_total_calculated[i]
    ).filter(error => !isNaN(error));
    
    const rmsError = errors.length > 0 ? 
      Math.sqrt(errors.reduce((sum, err) => sum + err * err, 0) / errors.length) : 0;
    
    // Check if components are realistic (no negative power for long periods)
    const negativeAeroCount = components.power_aero.filter(p => p < -50).length;
    const negativeRrCount = components.power_rr.filter(p => p < 0).length;
    const componentsRealistic = negativeAeroCount < components.power_aero.length * 0.1 && 
                               negativeRrCount === 0;
    
    // Check if estimates are in realistic ranges
    const estimatesRealistic = estimates.CdA_estimated >= 0.15 && estimates.CdA_estimated <= 0.60 &&
                              estimates.Crr_estimated >= 0.002 && estimates.Crr_estimated <= 0.020;
    
    return {
      power_conservation_error: Number(rmsError.toFixed(1)),
      components_realistic: componentsRealistic,
      estimates_realistic: estimatesRealistic
    };
  }

  /**
   * Calculate median value from array (robust against outliers)
   */
  private static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Get typical ranges for validation and comparison
   */
  static getTypicalRanges(): {
    CdA: Record<string, [number, number]>;
    Crr: Record<string, [number, number]>;
  } {
    return {
      CdA: {
        time_trial: [0.18, 0.25],
        road_drops: [0.25, 0.35], 
        road_hoods: [0.30, 0.40],
        mountain_bike: [0.35, 0.50],
        upright: [0.40, 0.60]
      },
      Crr: {
        road_smooth: [0.003, 0.005],
        road_rough: [0.005, 0.008],
        gravel: [0.008, 0.015],
        mountain: [0.015, 0.030]
      }
    };
  }

  /**
   * Compare two physical analyses (e.g., different bike configurations)
   */
  static compareAnalyses(
    analysis1: PhysicalPowerAnalysis,
    analysis2: PhysicalPowerAnalysis
  ): {
    cda_difference: number;
    crr_difference: number;
    power_savings: {
      aero_avg: number;
      rr_avg: number;
      total_avg: number;
    };
  } {
    
    const cdaDiff = analysis2.estimates.CdA_estimated - analysis1.estimates.CdA_estimated;
    const crrDiff = analysis2.estimates.Crr_estimated - analysis1.estimates.Crr_estimated;
    
    // Calculate average power differences
    const aeroAvg1 = analysis1.components.power_aero.reduce((a, b) => a + b, 0) / analysis1.components.power_aero.length;
    const aeroAvg2 = analysis2.components.power_aero.reduce((a, b) => a + b, 0) / analysis2.components.power_aero.length;
    
    const rrAvg1 = analysis1.components.power_rr.reduce((a, b) => a + b, 0) / analysis1.components.power_rr.length;
    const rrAvg2 = analysis2.components.power_rr.reduce((a, b) => a + b, 0) / analysis2.components.power_rr.length;
    
    return {
      cda_difference: Number(cdaDiff.toFixed(4)),
      crr_difference: Number(crrDiff.toFixed(5)),
      power_savings: {
        aero_avg: Number((aeroAvg1 - aeroAvg2).toFixed(1)),
        rr_avg: Number((rrAvg1 - rrAvg2).toFixed(1)),
        total_avg: Number((aeroAvg1 - aeroAvg2 + rrAvg1 - rrAvg2).toFixed(1))
      }
    };
  }
}

export default PhysicalPowerService;