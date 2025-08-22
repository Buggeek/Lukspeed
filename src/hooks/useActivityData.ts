import { useState, useEffect } from 'react';
import type { ActivityPoint } from '@/types/activity';

interface UseActivityDataProps {
  activityId?: string;
}

interface UseActivityDataReturn {
  activityData: ActivityPoint[] | null;
  isLoading: boolean;
  error: string | null;
}

export const useActivityData = ({ activityId }: UseActivityDataProps): UseActivityDataReturn => {
  const [activityData, setActivityData] = useState<ActivityPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activityId) {
      setActivityData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Mock data generation for now - in real implementation this would fetch from database
    const generateMockActivityData = (): ActivityPoint[] => {
      const points: ActivityPoint[] = [];
      const duration = 3600; // 1 hour in seconds
      
      for (let i = 0; i < duration; i++) {
        const time = i;
        const speed = 35 + Math.sin(time / 300) * 10 + Math.random() * 5; // 30-50 km/h
        const power = 250 + Math.sin(time / 200) * 50 + Math.random() * 40; // 200-340W
        const altitude = 100 + Math.sin(time / 600) * 50; // Rolling hills
        const cadence = 85 + Math.random() * 10; // 85-95 rpm
        const heartrate = 140 + Math.random() * 20; // 140-160 bpm

        points.push({
          timestamp_seconds: time,
          power_watts: power,
          speed_kmh: speed,
          altitude_m: altitude,
          cadence_rpm: cadence,
          heartrate_bpm: heartrate,
          distance_m: (speed / 3.6) * i, // Cumulative distance
          acceleration_ms2: 0,
          torque_nm: power / ((2 * Math.PI * cadence) / 60),
          efficiency_mps_per_watt: (speed / 3.6) / power
        });
      }
      
      return points;
    };

    // Simulate async data loading
    setTimeout(() => {
      try {
        const mockData = generateMockActivityData();
        setActivityData(mockData);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load activity data');
        setIsLoading(false);
      }
    }, 1000);

  }, [activityId]);

  return {
    activityData,
    isLoading,
    error
  };
};

export default useActivityData;