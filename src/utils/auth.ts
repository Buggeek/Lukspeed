// Authentication utilities for LukSpeed
export const isStravaConnected = (): boolean => {
  return localStorage.getItem('strava_connected') === 'true';
};

export const disconnectStrava = (): void => {
  localStorage.removeItem('strava_connected');
};

export const simulateStravaConnection = (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem('strava_connected', 'true');
      resolve(true);
    }, 2000);
  });
};

// Mock user data for demo purposes
export const getMockUserData = () => {
  return {
    name: "Alex Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    stravaProfile: {
      activities: 247,
      followers: 156,
      following: 89,
      totalDistance: "12,450 km",
      totalElevation: "145,230 m"
    },
    currentStats: {
      ftp: 315,
      weight: 72,
      recentActivities: 12,
      weeklyTSS: 485
    }
  };
};