import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/metric-card';
import { PowerCurveChart } from '@/components/charts/PowerCurveChart';
import { TrainingLoadChart } from '@/components/charts/TrainingLoadChart';
import { EnhancedActivity, TrainingLoad, PowerCurveData, PerformanceInsight } from '@/types/enhanced';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  Target, 
  Clock, 
  Heart, 
  Upload,
  Play,
  Settings,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function EnhancedDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<EnhancedActivity[]>([]);
  const [trainingLoad, setTrainingLoad] = useState<TrainingLoad[]>([]);
  const [powerCurve, setPowerCurve] = useState<PowerCurveData[]>([]);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [timeRange, setTimeRange] = useState('30');

  // Mock current FTP
  const currentFTP = 285;
  
  useEffect(() => {
    // Simulate loading enhanced cycling data
    setTimeout(() => {
      // Mock recent activities with advanced metrics
      setActivities([
        {
          id: '1',
          user_id: 'user1',
          strava_id: 'strava_123',
          name: 'Morning Intervals - FTP Test',
          type: 'Ride',
          start_date: '2025-08-12T07:30:00Z',
          duration: 3600,
          distance: 40200,
          elevation_gain: 420,
          avg_power: 278,
          max_power: 380,
          avg_hr: 165,
          max_hr: 183,
          avg_speed: 33.5,
          max_speed: 52.1,
          advanced_metrics: {
            normalized_power: 285,
            intensity_factor: 1.0,
            training_stress_score: 100,
            variability_index: 1.025,
            efficiency_factor: 2.03,
            work: 1000800,
            weighted_avg_power: 285,
            peak_1s: 580,
            peak_5s: 420,
            peak_15s: 380,
            peak_1m: 320,
            peak_5m: 295,
            peak_20m: 285,
            peak_60m: 275,
            left_right_balance: 52.3
          },
          segments: [],
          created_at: '2025-08-12T07:30:00Z',
          updated_at: '2025-08-12T07:30:00Z'
        },
        {
          id: '2',
          user_id: 'user1',
          name: 'Recovery Spin',
          type: 'Ride',
          start_date: '2025-08-11T06:00:00Z',
          duration: 2700,
          distance: 25000,
          elevation_gain: 150,
          avg_power: 180,
          avg_speed: 28.2,
          advanced_metrics: {
            normalized_power: 185,
            intensity_factor: 0.65,
            training_stress_score: 32,
            variability_index: 1.02,
            efficiency_factor: 2.85,
            work: 486000,
            weighted_avg_power: 185,
            peak_1s: 420,
            peak_5s: 320,
            peak_15s: 280,
            peak_1m: 220,
            peak_5m: 195,
            peak_20m: 185,
            peak_60m: 180
          },
          segments: [],
          created_at: '2025-08-11T06:00:00Z',
          updated_at: '2025-08-11T06:00:00Z'
        }
      ]);

      // Mock training load data
      setTrainingLoad([
        { date: '2025-08-05', daily_tss: 85, acute_load: 65.2, chronic_load: 72.8, training_balance: -7.6, form: 5.2, fitness: 72.8, fatigue: 65.2, ramp_rate: 2.1 },
        { date: '2025-08-06', daily_tss: 120, acute_load: 68.5, chronic_load: 73.5, training_balance: -5.0, form: 3.1, fitness: 73.5, fatigue: 68.5, ramp_rate: 3.2 },
        { date: '2025-08-07', daily_tss: 95, acute_load: 71.2, chronic_load: 74.1, training_balance: -2.9, form: 1.8, fitness: 74.1, fatigue: 71.2, ramp_rate: 2.8 },
        { date: '2025-08-08', daily_tss: 45, acute_load: 68.8, chronic_load: 73.8, training_balance: 5.0, form: 6.2, fitness: 73.8, fatigue: 68.8, ramp_rate: 1.5 },
        { date: '2025-08-09', daily_tss: 0, acute_load: 65.1, chronic_load: 72.9, training_balance: 7.8, form: 8.9, fitness: 72.9, fatigue: 65.1, ramp_rate: 0 },
        { date: '2025-08-10', daily_tss: 75, acute_load: 64.8, chronic_load: 72.2, training_balance: 7.4, form: 8.1, fitness: 72.2, fatigue: 64.8, ramp_rate: 2.2 },
        { date: '2025-08-11', daily_tss: 32, acute_load: 62.1, chronic_load: 71.1, training_balance: 9.0, form: 10.2, fitness: 71.1, fatigue: 62.1, ramp_rate: 1.1 },
        { date: '2025-08-12', daily_tss: 100, acute_load: 65.8, chronic_load: 71.8, training_balance: 6.0, form: 7.2, fitness: 71.8, fatigue: 65.8, ramp_rate: 3.5 }
      ]);

      // Mock power curve data
      setPowerCurve([
        { duration: 5, power: 580, date: '2025-08-12', activity_id: '1' },
        { duration: 15, power: 520, date: '2025-08-10', activity_id: '3' },
        { duration: 60, power: 420, date: '2025-08-08', activity_id: '4' },
        { duration: 300, power: 365, date: '2025-08-12', activity_id: '1' },
        { duration: 1200, power: 285, date: '2025-08-12', activity_id: '1' },
        { duration: 3600, power: 245, date: '2025-08-05', activity_id: '5' }
      ]);

      // Mock performance insights
      setInsights([
        {
          id: '1',
          user_id: 'user1',
          activity_id: '1',
          insight_type: 'performance',
          title: 'New FTP Detected',
          description: 'Your 20-minute power suggests an FTP increase from 275W to 285W (+3.6%)',
          severity: 'info',
          actionable_advice: [
            'Update your power zones in settings',
            'Adjust training targets accordingly',
            'Schedule a confirmation test within 2 weeks'
          ],
          confidence_score: 0.92,
          generated_at: '2025-08-12T08:30:00Z',
          acknowledged: false
        },
        {
          id: '2',
          user_id: 'user1',
          insight_type: 'training',
          title: 'Training Load Optimal',
          description: 'Your current training balance (6.0) indicates good fitness with adequate recovery',
          severity: 'info',
          actionable_advice: [
            'Maintain current training intensity',
            'Consider adding one quality session this week'
          ],
          confidence_score: 0.85,
          generated_at: '2025-08-12T08:30:00Z',
          acknowledged: false
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const weeklyStats = {
    totalTSS: trainingLoad.slice(-7).reduce((sum, day) => sum + day.daily_tss, 0),
    totalDistance: activities.slice(0, 7).reduce((sum, activity) => sum + (activity.distance / 1000), 0),
    totalTime: activities.slice(0, 7).reduce((sum, activity) => sum + activity.duration, 0),
    avgPower: activities.slice(0, 7).reduce((sum, activity, _, arr) => 
      sum + ((activity.advanced_metrics?.normalized_power || activity.avg_power || 0) / arr.length), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading performance dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600">Advanced cycling analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload FIT
          </Button>
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Start Ride
          </Button>
        </div>
      </div>

      {/* Performance Insights */}
      {insights.filter(i => !i.acknowledged).length > 0 && (
        <div className="space-y-3">
          {insights.filter(i => !i.acknowledged).map((insight) => (
            <Card key={insight.id} className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      {insight.insight_type === 'performance' ? (
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Target className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-blue-900">{insight.title}</h3>
                      <p className="text-sm text-blue-700">{insight.description}</p>
                      <ul className="text-xs text-blue-600 space-y-1">
                        {insight.actionable_advice.map((advice, index) => (
                          <li key={index}>• {advice}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Current FTP"
          value={currentFTP}
          unit="W"
          change={3.6}
          changeLabel="vs last test"
          trend="up"
          icon={<Zap className="h-4 w-4 text-blue-600" />}
          status="excellent"
          size="lg"
        />
        
        <MetricCard
          title="Weekly TSS"
          value={Math.round(weeklyStats.totalTSS)}
          change={12.5}
          changeLabel="vs last week"
          trend="up"
          icon={<Activity className="h-4 w-4 text-green-600" />}
          status="good"
        />
        
        <MetricCard
          title="Training Balance"
          value={trainingLoad[trainingLoad.length - 1]?.training_balance.toFixed(1) || '0.0'}
          changeLabel="optimal zone"
          icon={<Target className="h-4 w-4 text-purple-600" />}
          status="excellent"
        />
        
        <MetricCard
          title="Form Factor"
          value={trainingLoad[trainingLoad.length - 1]?.form.toFixed(1) || '0.0'}
          changeLabel="ready to perform"
          icon={<TrendingUp className="h-4 w-4 text-orange-600" />}
          status="good"
        />
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Distance"
          value={weeklyStats.totalDistance.toFixed(0)}
          unit="km"
          size="sm"
        />
        
        <MetricCard
          title="Total Time"
          value={Math.round(weeklyStats.totalTime / 3600)}
          unit="hours"
          size="sm"
        />
        
        <MetricCard
          title="Avg NP"
          value={Math.round(weeklyStats.avgPower)}
          unit="W"
          size="sm"
        />
        
        <MetricCard
          title="IF Average"
          value={(weeklyStats.avgPower / currentFTP).toFixed(2)}
          size="sm"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PowerCurveChart
          data={powerCurve}
          currentFTP={currentFTP}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        
        <TrainingLoadChart data={trainingLoad} />
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{activity.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.start_date).toLocaleDateString()} • 
                      {Math.round(activity.distance / 1000)}km • 
                      {Math.round(activity.duration / 60)}min
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">
                      {activity.advanced_metrics?.normalized_power || activity.avg_power || 'N/A'}W
                    </div>
                    <div className="text-gray-500">NP</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-gray-900">
                      {activity.advanced_metrics?.intensity_factor.toFixed(2) || 'N/A'}
                    </div>
                    <div className="text-gray-500">IF</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-gray-900">
                      {Math.round(activity.advanced_metrics?.training_stress_score || 0)}
                    </div>
                    <div className="text-gray-500">TSS</div>
                  </div>
                  
                  <Badge variant="outline">
                    {activity.advanced_metrics?.efficiency_factor.toFixed(1) || 'N/A'} EF
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-20 flex-col">
          <Calendar className="h-6 w-6 mb-2" />
          <span>Plan Week</span>
        </Button>
        
        <Button variant="outline" className="h-20 flex-col">
          <Settings className="h-6 w-6 mb-2" />
          <span>Bike Check</span>
        </Button>
        
        <Button variant="outline" className="h-20 flex-col">
          <Heart className="h-6 w-6 mb-2" />
          <span>Update Zones</span>
        </Button>
        
        <Button variant="outline" className="h-20 flex-col">
          <AlertCircle className="h-6 w-6 mb-2" />
          <span>Report Issue</span>
        </Button>
      </div>
    </div>
  );
}