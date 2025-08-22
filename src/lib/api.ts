import { User, CyclistProfile, Bicycle, Activity, DashboardData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async initiateStravaOAuth(): Promise<{ auth_url: string }> {
    return this.request('/auth/strava/connect', { method: 'POST' });
  }

  async handleStravaCallback(code: string): Promise<User> {
    return this.request('/auth/strava/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // User Profile
  async getUserProfile(): Promise<User> {
    return this.request('/users/profile');
  }

  async updateUserProfile(profile: Partial<User>): Promise<User> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Cyclist Profile
  async getCyclistProfile(): Promise<CyclistProfile> {
    return this.request('/users/cyclist-profile');
  }

  async updateCyclistProfile(profile: Partial<CyclistProfile>): Promise<CyclistProfile> {
    return this.request('/users/cyclist-profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Bicycles
  async getBicycles(): Promise<Bicycle[]> {
    return this.request('/bicycles');
  }

  async createBicycle(bicycle: Partial<Bicycle>): Promise<Bicycle> {
    return this.request('/bicycles', {
      method: 'POST',
      body: JSON.stringify(bicycle),
    });
  }

  async updateBicycle(id: string, bicycle: Partial<Bicycle>): Promise<Bicycle> {
    return this.request(`/bicycles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bicycle),
    });
  }

  async deleteBicycle(id: string): Promise<void> {
    return this.request(`/bicycles/${id}`, { method: 'DELETE' });
  }

  // Activities
  async getActivities(page = 1, limit = 20): Promise<{ activities: Activity[]; total: number }> {
    return this.request(`/activities?page=${page}&limit=${limit}`);
  }

  async getActivity(id: string): Promise<Activity> {
    return this.request(`/activities/${id}`);
  }

  async syncActivities(): Promise<{ synced: number }> {
    return this.request('/activities/sync', { method: 'POST' });
  }

  // Analytics
  async getDashboardData(): Promise<DashboardData> {
    return this.request('/analytics/dashboard');
  }

  async getPerformanceTrends(days = 30): Promise<{ date: string; power: number; speed: number; distance: number }[]> {
    return this.request(`/analytics/trends?days=${days}`);
  }
}

export const apiClient = new APIClient();