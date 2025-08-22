import { useState, useEffect } from 'react';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { StravaConnectButton } from '@/components/strava/StravaConnectButton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { DashboardData } from '@/types';
import { mockDashboardData } from '@/lib/mock-data';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => {
      setDashboardData(mockDashboardData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleStravaConnect = () => {
    setIsStravaConnected(true);
    // In a real app, this would trigger data sync
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setDashboardData(mockDashboardData);
      setIsLoading(false);
    }, 1000);
  };

  if (!isStravaConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <StravaConnectButton onConnect={handleStravaConnect} />
      </div>
    );
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <MetricsCards
        totalActivities={dashboardData.totalActivities}
        totalDistance={dashboardData.totalDistance}
        totalTime={dashboardData.totalTime}
        avgPower={dashboardData.avgPower}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TrendsChart data={dashboardData.performanceTrends} />
        <RecentActivities activities={dashboardData.recentActivities} />
      </div>
    </div>
  );
}