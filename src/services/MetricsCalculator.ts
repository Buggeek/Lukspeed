import { TimelineDataPoint, TimelineAlert, SmoothingOptions } from '@/types/timeline';

export class MetricsCalculator {
  /**
   * Calculate acceleration from velocity data
   * a(t) = (v(t) - v(t-1)) / dt
   */
  static calculateAcceleration(
    speedPoints: number[], 
    timePoints: number[]
  ): number[] {
    const acceleration: number[] = [0]; // First point has 0 acceleration
    
    for (let i = 1; i < speedPoints.length; i++) {
      const deltaV = (speedPoints[i] - speedPoints[i - 1]) / 3.6; // Convert km/h to m/s
      const deltaT = timePoints[i] - timePoints[i - 1];
      
      if (deltaT > 0) {
        acceleration.push(deltaV / deltaT);
      } else {
        acceleration.push(0);
      }
    }
    
    return acceleration;
  }

  /**
   * Calculate torque from power and cadence
   * τ = P / ω where ω = 2πN/60 (angular velocity in rad/s)
   */
  static calculateTorque(powerPoints: number[], cadencePoints: number[]): number[] {
    return powerPoints.map((power, i) => {
      const cadence = cadencePoints[i];
      if (cadence > 0) {
        const angularVelocity = (2 * Math.PI * cadence) / 60; // rad/s
        return power / angularVelocity; // N⋅m
      }
      return 0;
    });
  }

  /**
   * Calculate efficiency (speed per watt)
   * Efficiency = v / P (m/s per watt)
   */
  static calculateEfficiency(speedPoints: number[], powerPoints: number[]): number[] {
    return speedPoints.map((speed, i) => {
      const power = powerPoints[i];
      if (power > 0) {
        const speedMs = speed / 3.6; // Convert km/h to m/s
        return speedMs / power;
      }
      return 0;
    });
  }

  /**
   * Apply smoothing to data points using moving average
   */
  static applySmoothingMovingAverage(
    data: number[], 
    windowSize: number
  ): number[] {
    const smoothed: number[] = [];
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length - 1, i + halfWindow);
      
      let sum = 0;
      let count = 0;
      
      for (let j = start; j <= end; j++) {
        sum += data[j];
        count++;
      }
      
      smoothed.push(count > 0 ? sum / count : data[i]);
    }
    
    return smoothed;
  }

  /**
   * Apply Gaussian smoothing
   */
  static applySmoothingGaussian(
    data: number[], 
    windowSize: number,
    sigma: number = windowSize / 3
  ): number[] {
    const smoothed: number[] = [];
    const halfWindow = Math.floor(windowSize / 2);
    
    // Generate Gaussian weights
    const weights: number[] = [];
    let weightSum = 0;
    
    for (let i = -halfWindow; i <= halfWindow; i++) {
      const weight = Math.exp(-(i * i) / (2 * sigma * sigma));
      weights.push(weight);
      weightSum += weight;
    }
    
    // Normalize weights
    for (let i = 0; i < weights.length; i++) {
      weights[i] /= weightSum;
    }
    
    // Apply smoothing
    for (let i = 0; i < data.length; i++) {
      let smoothedValue = 0;
      
      for (let j = 0; j < weights.length; j++) {
        const dataIndex = i - halfWindow + j;
        if (dataIndex >= 0 && dataIndex < data.length) {
          smoothedValue += data[dataIndex] * weights[j];
        }
      }
      
      smoothed.push(smoothedValue);
    }
    
    return smoothed;
  }

  /**
   * Detect alerts based on thresholds
   */
  static detectAlerts(
    dataPoints: TimelineDataPoint[],
    accelerationThreshold: number = 2.0,
    efficiencyThreshold: number = 0.05,
    powerDropThreshold: number = 0.3
  ): TimelineAlert[] {
    const alerts: TimelineAlert[] = [];
    
    dataPoints.forEach((point, index) => {
      // Acceleration spike alert
      if (Math.abs(point.acceleration) > accelerationThreshold) {
        alerts.push({
          timestamp: point.timestamp,
          type: 'acceleration_spike',
          severity: Math.abs(point.acceleration) > accelerationThreshold * 2 ? 'high' : 'medium',
          message: `Pico de aceleración: ${point.acceleration.toFixed(2)} m/s²`,
          value: Math.abs(point.acceleration),
          threshold: accelerationThreshold
        });
      }
      
      // Low efficiency alert
      if (point.efficiency < efficiencyThreshold && point.power > 100) {
        alerts.push({
          timestamp: point.timestamp,
          type: 'low_efficiency',
          severity: 'medium',
          message: `Eficiencia baja: ${point.efficiency.toFixed(4)} m/s/W`,
          value: point.efficiency,
          threshold: efficiencyThreshold
        });
      }
      
      // Power drop alert
      if (index > 0) {
        const prevPoint = dataPoints[index - 1];
        const powerDropRatio = (prevPoint.power - point.power) / prevPoint.power;
        
        if (powerDropRatio > powerDropThreshold && prevPoint.power > 200) {
          alerts.push({
            timestamp: point.timestamp,
            type: 'power_drop',
            severity: powerDropRatio > 0.5 ? 'high' : 'medium',
            message: `Caída de potencia: ${(powerDropRatio * 100).toFixed(1)}%`,
            value: powerDropRatio,
            threshold: powerDropThreshold
          });
        }
      }
      
      // Data gap alert (missing data points)
      if (index > 0) {
        const prevPoint = dataPoints[index - 1];
        const timeDiff = point.timestamp - prevPoint.timestamp;
        
        if (timeDiff > 5) { // Gap > 5 seconds
          alerts.push({
            timestamp: prevPoint.timestamp + 1,
            type: 'data_gap',
            severity: timeDiff > 30 ? 'high' : 'low',
            message: `Gap de datos: ${timeDiff}s sin registros`,
            value: timeDiff,
            threshold: 5
          });
        }
      }
    });
    
    return alerts;
  }

  /**
   * Calculate cumulative distance from speed data
   */
  static calculateCumulativeDistance(
    speedPoints: number[], 
    timePoints: number[]
  ): number[] {
    const distances: number[] = [0];
    let cumulativeDistance = 0;
    
    for (let i = 1; i < speedPoints.length; i++) {
      const avgSpeed = (speedPoints[i] + speedPoints[i - 1]) / 2; // km/h
      const deltaTime = timePoints[i] - timePoints[i - 1]; // seconds
      const deltaDistance = (avgSpeed / 3.6) * deltaTime; // meters
      
      cumulativeDistance += deltaDistance;
      distances.push(cumulativeDistance);
    }
    
    return distances;
  }

  /**
   * Apply smoothing based on options
   */
  static applySmoothing(
    data: number[], 
    options: SmoothingOptions
  ): number[] {
    if (!options.enabled) {
      return [...data]; // Return copy of original data
    }
    
    switch (options.method) {
      case 'gaussian':
        return this.applySmoothingGaussian(data, options.windowSize);
      case 'savgol':
        // Simplified Savitzky-Golay (fallback to moving average)
        return this.applySmoothingMovingAverage(data, options.windowSize);
      case 'moving_average':
      default:
        return this.applySmoothingMovingAverage(data, options.windowSize);
    }
  }

  /**
   * Calculate statistical summary for a data series
   */
  static calculateStats(data: number[]) {
    if (data.length === 0) {
      return {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        std: 0,
        q25: 0,
        q75: 0
      };
    }
    
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const std = Math.sqrt(variance);
    
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean,
      median: sorted[Math.floor(sorted.length / 2)],
      std,
      q25: sorted[Math.floor(sorted.length * 0.25)],
      q75: sorted[Math.floor(sorted.length * 0.75)]
    };
  }
}
// ========================================
// PHYSICAL POWER & EFFICIENCY INTEGRATION
// ========================================

import { EfficiencyCurveService, type EfficiencyAnalysis } from './EfficiencyCurveService';
import { PhysicalPowerService, type PhysicalPowerAnalysis } from './PhysicalPowerService';

// Enhanced metrics interface with physical components
export interface CalculatedMetrics {
  peaks: {
    power: number;
    speed: number;
    cadence: number;
    heartrate: number;
    acceleration: number;
    torque: number;
  };
  averages: {
    power: number;
    speed: number;
    cadence: number;
    heartrate: number;
  };
  derived: {
    averageEfficiency: number;
    segmentCount: number;
    totalElevationGain: number;
  };
  // Efficiency calculations
  efficiency?: EfficiencyAnalysis;
  // NEW: Physical power components
  physicalComponents?: PhysicalPowerAnalysis;
}

export function calculatePeaks(data: TimelineDataPoint[]) {
  if (data.length === 0) {
    return {
      power: 0,
      speed: 0,
      cadence: 0,
      heartrate: 0,
      acceleration: 0,
      torque: 0
    };
  }

  const peaks = {
    power: Math.max(...data.map(d => d.power_watts || 0)),
    speed: Math.max(...data.map(d => d.speed_kmh || 0)),
    cadence: Math.max(...data.map(d => d.cadence_rpm || 0)),
    heartrate: Math.max(...data.map(d => d.heartrate_bpm || 0)),
    acceleration: Math.max(...data.map(d => Math.abs(d.acceleration_ms2 || 0))),
    torque: Math.max(...data.map(d => d.torque_nm || 0))
  };

  return peaks;
}

export function calculateAverages(data: TimelineDataPoint[]) {
  if (data.length === 0) {
    return {
      power: 0,
      speed: 0,
      cadence: 0,
      heartrate: 0
    };
  }

  const validData = data.filter(d => 
    (d.power_watts || 0) > 0 && 
    (d.speed_kmh || 0) > 0
  );

  if (validData.length === 0) {
    return {
      power: 0,
      speed: 0,
      cadence: 0,
      heartrate: 0
    };
  }

  return {
    power: validData.reduce((sum, d) => sum + (d.power_watts || 0), 0) / validData.length,
    speed: validData.reduce((sum, d) => sum + (d.speed_kmh || 0), 0) / validData.length,
    cadence: validData.reduce((sum, d) => sum + (d.cadence_rpm || 0), 0) / validData.length,
    heartrate: validData.reduce((sum, d) => sum + (d.heartrate_bpm || 0), 0) / validData.length
  };
}

export function calculateDerived(data: TimelineDataPoint[]) {
  if (data.length === 0) {
    return {
      averageEfficiency: 0,
      segmentCount: 0,
      totalElevationGain: 0
    };
  }

  // Calculate average efficiency
  const validEfficiencyData = data.filter(d => 
    (d.efficiency_mps_per_watt || 0) > 0
  );
  
  const averageEfficiency = validEfficiencyData.length > 0 ? 
    validEfficiencyData.reduce((sum, d) => sum + (d.efficiency_mps_per_watt || 0), 0) / validEfficiencyData.length : 0;

  // Calculate elevation gain
  let totalElevationGain = 0;
  for (let i = 1; i < data.length; i++) {
    const elevationDiff = (data[i].altitude_m || 0) - (data[i-1].altitude_m || 0);
    if (elevationDiff > 0) {
      totalElevationGain += elevationDiff;
    }
  }

  return {
    averageEfficiency,
    segmentCount: data.length,
    totalElevationGain
  };
}

/**
 * Enhanced metrics calculation including efficiency and physical power analysis
 */
export function calculateEnhancedMetrics(data: TimelineDataPoint[]): CalculatedMetrics {
  const peaks = calculatePeaks(data);
  const averages = calculateAverages(data);
  const derived = calculateDerived(data);
  
  // Calculate efficiency metrics and physical power components
  let efficiency: EfficiencyAnalysis | undefined;
  let physicalComponents: PhysicalPowerAnalysis | undefined;
  
  try {
    // Convert timeline data to activity points for analysis
    const activityPoints = data.map(point => ({
      timestamp_seconds: point.timestamp_seconds,
      power_watts: point.power_watts || 0,
      speed_kmh: point.speed_kmh || 0,
      cadence_rpm: point.cadence_rpm || 0,
      heartrate_bpm: point.heartrate_bpm || 0,
      altitude_m: point.altitude_m || 0,
      acceleration_ms2: point.acceleration_ms2 || 0,
      torque_nm: point.torque_nm || 0,
      efficiency_mps_per_watt: point.efficiency_mps_per_watt || 0,
      distance_m: point.distance_m || 0
    }));

    // Calculate efficiency metrics
    efficiency = EfficiencyCurveService.analyzeActivityEfficiency(activityPoints);
    
    // Calculate physical power components
    physicalComponents = PhysicalPowerService.analyzeActivityPhysics(
      activityPoints,
      undefined, // User profile - would be passed from context
      undefined  // Environmental conditions - would be passed from context
    );
    
  } catch (error) {
    console.warn('Failed to calculate advanced metrics:', error);
  }

  return {
    peaks,
    averages,
    derived,
    efficiency,
    physicalComponents
  };
}
