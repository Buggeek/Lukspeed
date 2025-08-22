import { Activity, DashboardData } from '@/types';

// Mock data for development and testing
export const mockDashboardData: DashboardData = {
  totalActivities: 45,
  totalDistance: 1245.8,
  totalTime: 82800, // seconds
  avgPower: 245,
  recentActivities: [
    {
      id: '1',
      user_id: 'user1',
      name: 'Morning Ride',
      activity_type: 'Ride',
      start_date: '2025-08-10T07:30:00Z',
      distance_m: 35200,
      moving_time_s: 3600,
      elevation_gain_m: 450,
      processed: true,
      created_at: '2025-08-10T07:30:00Z',
    },
    {
      id: '2',
      user_id: 'user1',
      name: 'Hill Intervals',
      activity_type: 'Ride',
      start_date: '2025-08-08T18:00:00Z',
      distance_m: 28500,
      moving_time_s: 2700,
      elevation_gain_m: 680,
      processed: true,
      created_at: '2025-08-08T18:00:00Z',
    },
    {
      id: '3',
      user_id: 'user1',
      name: 'Recovery Ride',
      activity_type: 'Ride',
      start_date: '2025-08-06T16:15:00Z',
      distance_m: 22100,
      moving_time_s: 2400,
      elevation_gain_m: 180,
      processed: true,
      created_at: '2025-08-06T16:15:00Z',
    },
  ],
  performanceTrends: [
    { date: '2025-07-14', power: 235, speed: 32.5, distance: 28.2 },
    { date: '2025-07-21', power: 240, speed: 33.1, distance: 31.5 },
    { date: '2025-07-28', power: 238, speed: 32.8, distance: 29.8 },
    { date: '2025-08-04', power: 245, speed: 34.2, distance: 35.1 },
    { date: '2025-08-11', power: 248, speed: 34.8, distance: 37.2 },
  ],
};

export const mockBicycles = [
  {
    id: '1',
    user_id: 'user1',
    name: 'Canyon Aeroad',
    brand: 'Canyon',
    model: 'Aeroad CF SLX',
    year: 2023,
    type: 'Road',
    is_active: true,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    name: 'Specialized Tarmac',
    brand: 'Specialized',
    model: 'Tarmac SL7',
    year: 2022,
    type: 'Road',
    is_active: false,
    created_at: '2025-01-20T14:30:00Z',
  },
];

export const mockCyclistProfile = {
  id: '1',
  user_id: 'user1',
  height_cm: 178,
  weight_kg: 72.5,
  inseam_cm: 82,
  torso_length_cm: 58,
  arm_length_cm: 62,
  experience_level: 'Advanced',
  flexibility_level: 'Good',
  created_at: '2025-01-10T12:00:00Z',
};