import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ResponsiveGrid, AdaptiveCard } from '@/components/ui/responsive-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Heart, 
  Timer, 
  Mountain,
  Activity,
  Target,
  Calendar,
  Award,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import { PowerCurveChart } from '@/components/charts/PowerCurveChart';
import { TrainingLoadChart } from '@/components/charts/TrainingLoadChart';
import { ComprehensiveActivity } from '@/types/advanced-metrics';

export default function ResponsiveDashboard() {
  const [isLiveActivity, setIsLiveActivity] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState({
    power: 245,
    heartRate: 152,
    cadence: 88,
    speed: 32.5,
    distance: 12.4,
    elevation: 156
  });

  // Mock data for charts
  const powerCurveData = [
    { duration: 5, power: 1200, date: '2024-01-15' },
    { duration: 15, power: 890, date: '2024-01-14' },
    { duration: 60, power: 420, date: '2024-01-13' },
    { duration: 300, power: 380, date: '2024-01-12' },
    { duration: 1200, power: 310, date: '2024-01-11' },
    { duration: 3600, power: 280, date: '2024-01-10' }
  ];

  const trainingLoadData = [
    { date: '2024-01-10', daily_tss: 85, fitness: 42.5, fatigue: 38.2, form: 4.3, training_balance: 0.8 },
    { date: '2024-01-11', daily_tss: 120, fitness: 44.1, fatigue: 42.8, form: 1.3, training_balance: 0.6 },
    { date: '2024-01-12', daily_tss: 95, fitness: 45.2, fatigue: 41.5, form: 3.7, training_balance: 0.7 },
    { date: '2024-01-13', daily_tss: 140, fitness: 47.8, fatigue: 48.2, form: -0.4, training_balance: 0.4 },
    { date: '2024-01-14', daily_tss: 75, fitness: 48.1, fatigue: 45.1, form: 3.0, training_balance: 0.8 },
    { date: '2024-01-15', daily_tss: 110, fitness: 49.5, fatigue: 47.8, form: 1.7, training_balance: 0.6 }
  ];

  // Simulate live activity updates
  useEffect(() => {
    if (isLiveActivity) {
      const interval = setInterval(() => {
        setCurrentMetrics(prev => ({
          power: prev.power + (Math.random() - 0.5) * 20,
          heartRate: prev.heartRate + (Math.random() - 0.5) * 5,
          cadence: prev.cadence + (Math.random() - 0.5) * 4,
          speed: prev.speed + (Math.random() - 0.5) * 2,
          distance: prev.distance + 0.1,
          elevation: prev.elevation + (Math.random() - 0.5) * 2
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLiveActivity]);

  return (
    <ResponsiveContainer size="full" className="pb-20 lg:pb-8">
      {/* Live Activity Header - Only shown when active */}
      {isLiveActivity && (
        <div className="mb-6">
          <AdaptiveCard className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold text-green-900">Live Activity</h3>
                  <p className="text-sm text-green-700">Road Cycling • 45:23</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiveActivity(false)}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            </div>
          </AdaptiveCard>
        </div>
      )}

      {/* Real-time Metrics Grid - Responsive for all screen sizes */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {isLiveActivity ? 'Live Metrics' : 'Performance Overview'}
          </h2>
          {!isLiveActivity && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLiveActivity(true)}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Activity
            </Button>
          )}
        </div>

        <ResponsiveGrid cols={{ sm: 2, md: 3, lg: 6 }} gaps={{ sm: 3, md: 4, lg: 4 }}>
          <AdaptiveCard className={isLiveActivity ? 'ring-2 ring-blue-200 bg-blue-50' : ''}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Power</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  {Math.round(currentMetrics.power)}
                  <span className="text-sm font-normal text-gray-500 ml-1">W</span>
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            {isLiveActivity && (
              <div className="mt-2">
                <Progress value={(currentMetrics.power / 400) * 100} className="h-1" />
                <p className="text-xs text-gray-500 mt-1">85% FTP</p>
              </div>
            )}
          </AdaptiveCard>

          <AdaptiveCard className={isLiveActivity ? 'ring-2 ring-red-200 bg-red-50' : ''}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Heart Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  {Math.round(currentMetrics.heartRate)}
                  <span className="text-sm font-normal text-gray-500 ml-1">bpm</span>
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
            </div>
            {isLiveActivity && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">Zone 3</Badge>
              </div>
            )}
          </AdaptiveCard>

          <AdaptiveCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cadence</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  {Math.round(currentMetrics.cadence)}
                  <span className="text-sm font-normal text-gray-500 ml-1">rpm</span>
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Timer className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </AdaptiveCard>

          <AdaptiveCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Speed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  {currentMetrics.speed.toFixed(1)}
                  <span className="text-sm font-normal text-gray-500 ml-1">km/h</span>
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </AdaptiveCard>

          <AdaptiveCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Distance</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  {currentMetrics.distance.toFixed(1)}
                  <span className="text-sm font-normal text-gray-500 ml-1">km</span>
                </p>
              </div>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Target className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
          </AdaptiveCard>

          <AdaptiveCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Elevation</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  {Math.round(currentMetrics.elevation)}
                  <span className="text-sm font-normal text-gray-500 ml-1">m</span>
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Mountain className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </AdaptiveCard>
        </ResponsiveGrid>
      </div>

      {/* Charts Section - Responsive layout */}
      <ResponsiveGrid cols={{ sm: 1, lg: 2 }} gaps={{ sm: 4, md: 6 }} className="mb-6">
        <AdaptiveCard title="Power Duration Curve" fullHeight>
          <div className="h-64 sm:h-80">
            <PowerCurveChart
              data={powerCurveData}
              currentFTP={290}
              className="w-full h-full"
            />
          </div>
        </AdaptiveCard>

        <AdaptiveCard title="Training Load Balance" fullHeight>
          <div className="h-64 sm:h-80">
            <TrainingLoadChart
              data={trainingLoadData}
              className="w-full h-full"
            />
          </div>
        </AdaptiveCard>
      </ResponsiveGrid>

      {/* Performance Summary Cards */}
      <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }} gaps={{ sm: 4, md: 6 }}>
        <AdaptiveCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Today's Performance</h3>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Training Stress Score</span>
              <span className="font-semibold">142 TSS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Intensity Factor</span>
              <span className="font-semibold">0.85 IF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Efficiency Factor</span>
              <span className="font-semibold">1.68 EF</span>
            </div>
          </div>
        </AdaptiveCard>

        <AdaptiveCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Weekly Progress</h3>
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Weekly TSS</span>
                <span className="text-sm font-medium">485 / 650</span>
              </div>
              <Progress value={74.6} className="h-2" />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Activities</span>
              <span className="font-semibold">4 / 6</span>
            </div>
          </div>
        </AdaptiveCard>

        <AdaptiveCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Achievement</h3>
            <Award className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              New PR!
            </Badge>
            <p className="text-sm text-gray-600">
              20-min Power Record
            </p>
            <p className="font-semibold text-lg">315W</p>
            <p className="text-xs text-gray-500">+8W from previous best</p>
          </div>
        </AdaptiveCard>
      </ResponsiveGrid>

      {/* Quick Actions - Mobile optimized */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <ResponsiveGrid cols={{ sm: 1, md: 2 }} gaps={{ sm: 3, md: 4 }}>
          <Button className="h-14 justify-between text-left" variant="outline">
            <div>
              <p className="font-medium">View Latest Activity</p>
              <p className="text-sm text-gray-500">Morning Road Ride</p>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button className="h-14 justify-between text-left" variant="outline">
            <div>
              <p className="font-medium">Schedule Bike Fit</p>
              <p className="text-sm text-gray-500">Optimize your position</p>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </ResponsiveGrid>
      </div>
    </ResponsiveContainer>
  );
}