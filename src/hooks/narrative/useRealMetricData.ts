import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { ActivityData, FTPData, AerodynamicsData, TechniqueData, EfficiencyData } from '@/types/narrative';

// Mock real data calculation functions - In production, these would connect to Supabase
function calculateFTP(activity: any): number {
  // Simulated FTP calculation based on 20-minute power test
  if (!activity) return 287;
  return Math.round(activity.averagePower * 0.95); // FTP = 95% of 20min power
}

function calculateAverageFTP(activities: any[]): number {
  if (!activities.length) return 275;
  const ftps = activities.map(calculateFTP);
  return Math.round(ftps.reduce((a, b) => a + b, 0) / ftps.length);
}

function getFTPHistory(activities: any[]): number[] {
  if (!activities.length) {
    return [280, 275, 282, 278, 285, 283, 287, 287];
  }
  return activities.slice(0, 8).map(calculateFTP).reverse();
}

function calculateCdA(activity: any): number {
  // Aerodynamic drag coefficient calculation
  if (!activity) return 0.324;
  
  // Simplified CdA based on speed, power, and environmental factors
  const speed = activity.averageSpeed || 40; // km/h
  const power = activity.averagePower || 250; // watts
  const headwind = activity.windSpeed || 0; // km/h
  
  // CdA = Power / (0.5 * air_density * (speed + headwind)^3)
  const airDensity = 1.225; // kg/m³ at sea level
  const speedMs = (speed + headwind) / 3.6; // Convert to m/s
  
  if (speedMs > 0) {
    return Math.max(0.250, Math.min(0.400, power / (0.5 * airDensity * Math.pow(speedMs, 3) * 100)));
  }
  
  return 0.324;
}

function calculateCadenceConsistency(activity: any): number {
  // Calculate cadence variability as consistency percentage
  if (!activity) return 0.913;
  
  const cadence = activity.averageCadence || 90;
  const cadenceVariability = activity.cadenceVariability || 8.7;
  
  // Convert variability to consistency (lower variability = higher consistency)
  return Math.max(0.7, Math.min(1.0, 1 - (cadenceVariability / 100)));
}

function calculateLRBalance(activity: any): number {
  // Left/Right power balance
  if (!activity) return 0.502; // 50.2% left
  return activity.leftRightBalance || 0.500;
}

function calculateTorqueEffectiveness(activity: any): number {
  // Torque effectiveness percentage
  if (!activity) return 0.891;
  return activity.torqueEffectiveness || 0.850;
}

function calculateEfficiency(activity: any): number {
  // Overall cycling efficiency
  if (!activity) return 0.941;
  
  const power = activity.averagePower || 250;
  const heartRate = activity.averageHeartRate || 150;
  const cadence = activity.averageCadence || 90;
  
  // Simplified efficiency calculation
  const powerToHRRatio = power / heartRate;
  const cadenceEfficiency = Math.min(1, cadence / 90); // Optimal around 90 RPM
  
  return Math.max(0.7, Math.min(1.0, (powerToHRRatio * cadenceEfficiency) / 2));
}

function calculateMetabolicEfficiency(activity: any): number {
  // Metabolic efficiency calculation
  if (!activity) return 0.223; // ~22.3% gross efficiency
  
  const power = activity.averagePower || 250;
  const heartRate = activity.averageHeartRate || 150;
  
  // Estimate metabolic power from heart rate (simplified)
  const estimatedMetabolicPower = (heartRate - 60) * 10; // Very simplified
  
  if (estimatedMetabolicPower > 0) {
    return Math.max(0.15, Math.min(0.25, power / estimatedMetabolicPower));
  }
  
  return 0.223;
}

export function useRealMetricData(): ActivityData | null {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    if (!isAuthenticated || !user) {
      return null;
    }

    // Mock activity data - In production, fetch from Supabase
    const mockLatestActivity = {
      id: 'activity_001',
      averagePower: 295,
      averageSpeed: 42.3,
      averageHeartRate: 162,
      averageCadence: 88,
      windSpeed: 5,
      cadenceVariability: 7.2,
      leftRightBalance: 0.508,
      torqueEffectiveness: 0.896,
      date: new Date().toISOString()
    };

    const mockHistoricalActivities = Array.from({ length: 30 }, (_, i) => ({
      id: `activity_${i + 2}`,
      averagePower: 280 + Math.random() * 30,
      averageSpeed: 38 + Math.random() * 8,
      averageHeartRate: 155 + Math.random() * 15,
      averageCadence: 85 + Math.random() * 10,
      windSpeed: Math.random() * 10,
      cadenceVariability: 6 + Math.random() * 5,
      leftRightBalance: 0.495 + Math.random() * 0.02,
      torqueEffectiveness: 0.85 + Math.random() * 0.08,
      date: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString()
    }));

    const allActivities = [mockLatestActivity, ...mockHistoricalActivities];

    return {
      id: mockLatestActivity.id,
      date: mockLatestActivity.date,
      
      ftp: {
        current: calculateFTP(mockLatestActivity),
        average: calculateAverageFTP(mockHistoricalActivities),
        best: Math.max(...allActivities.map(calculateFTP)),
        history: getFTPHistory(mockHistoricalActivities),
        change: ((calculateFTP(mockLatestActivity) - calculateAverageFTP(mockHistoricalActivities)) / calculateAverageFTP(mockHistoricalActivities)) * 100
      },
      
      cda: {
        current: calculateCdA(mockLatestActivity),
        average: mockHistoricalActivities.reduce((acc, act) => acc + calculateCdA(act), 0) / mockHistoricalActivities.length,
        best: Math.min(...allActivities.map(calculateCdA)),
        history: mockHistoricalActivities.slice(0, 8).map(calculateCdA).reverse(),
        change: ((calculateCdA(mockLatestActivity) - (mockHistoricalActivities.reduce((acc, act) => acc + calculateCdA(act), 0) / mockHistoricalActivities.length)) / (mockHistoricalActivities.reduce((acc, act) => acc + calculateCdA(act), 0) / mockHistoricalActivities.length)) * 100
      },
      
      technique: {
        consistency: calculateCadenceConsistency(mockLatestActivity),
        average: mockHistoricalActivities.reduce((acc, act) => acc + calculateCadenceConsistency(act), 0) / mockHistoricalActivities.length,
        best: Math.max(...allActivities.map(calculateCadenceConsistency)),
        history: mockHistoricalActivities.slice(0, 8).map(calculateCadenceConsistency).reverse(),
        change: ((calculateCadenceConsistency(mockLatestActivity) - (mockHistoricalActivities.reduce((acc, act) => acc + calculateCadenceConsistency(act), 0) / mockHistoricalActivities.length)) / (mockHistoricalActivities.reduce((acc, act) => acc + calculateCadenceConsistency(act), 0) / mockHistoricalActivities.length)) * 100
      },
      
      efficiency: {
        current: calculateEfficiency(mockLatestActivity),
        average: mockHistoricalActivities.reduce((acc, act) => acc + calculateEfficiency(act), 0) / mockHistoricalActivities.length,
        best: Math.max(...allActivities.map(calculateEfficiency)),
        history: mockHistoricalActivities.slice(0, 8).map(calculateEfficiency).reverse(),
        change: ((calculateEfficiency(mockLatestActivity) - (mockHistoricalActivities.reduce((acc, act) => acc + calculateEfficiency(act), 0) / mockHistoricalActivities.length)) / (mockHistoricalActivities.reduce((acc, act) => acc + calculateEfficiency(act), 0) / mockHistoricalActivities.length)) * 100
      }
    };
  }, [user, isAuthenticated]);
}