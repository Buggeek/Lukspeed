import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { EnhancedActivity, ActivitySegment } from '@/types/enhanced';
import { 
  Activity, 
  Search, 
  Filter, 
  Eye, 
  TrendingUp, 
  Zap, 
  Heart, 
  RotateCcw,
  Mountain,
  Clock,
  Route
} from 'lucide-react';

export default function EnhancedActivities() {
  const [activities, setActivities] = useState<EnhancedActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<EnhancedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<EnhancedActivity | null>(null);
  const [activityData, setActivityData] = useState<Array<{
    time: number;
    timeLabel: string;
    power: number;
    heartRate: number;
    cadence: number;
    speed: number;
  }>>([]);

  useEffect(() => {
    // Simulate loading enhanced activities
    setTimeout(() => {
      const mockActivities: EnhancedActivity[] = [
        {
          id: '1',
          user_id: 'user1',
          strava_id: 'strava_123',
          name: 'Morning Intervals - FTP Test',
          description: '2x20min at threshold with 5min recovery',
          type: 'Ride',
          start_date: '2025-08-12T07:30:00Z',
          duration: 3600,
          distance: 40200,
          elevation_gain: 420,
          avg_power: 278,
          max_power: 380,
          avg_hr: 165,
          max_hr: 183,
          avg_cadence: 92,
          max_cadence: 115,
          avg_speed: 33.5,
          max_speed: 52.1,
          calories: 1250,
          temperature: 18,
          humidity: 65,
          wind_speed: 12,
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
            left_right_balance: 52.3,
            avg_left_pco: 48.2,
            avg_right_pco: 47.8
          },
          segments: [
            {
              id: 'seg1',
              activity_id: '1',
              segment_start: 600,
              segment_end: 1800,
              segment_type: 'tt',
              distance: 8000,
              duration: 1200,
              elevation_change: 80,
              avg_power: 290,
              max_power: 315,
              normalized_power: 295,
              avg_hr: 175,
              max_hr: 180,
              avg_cadence: 95,
              avg_speed: 36.2,
              work: 348000,
              intensity_factor: 1.04,
              variability_index: 1.08,
              gradient: 1.0,
              segment_name: 'First 20min Interval',
              pr_rank: 2,
              kom_rank: 15
            }
          ],
          created_at: '2025-08-12T07:30:00Z',
          updated_at: '2025-08-12T07:30:00Z'
        },
        {
          id: '2',
          user_id: 'user1',
          name: 'Recovery Spin - Zone 1',
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
      ];

      setActivities(mockActivities);
      setFilteredActivities(mockActivities);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type.toLowerCase() === filterType.toLowerCase());
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, filterType]);

  const generateActivityData = (activity: EnhancedActivity) => {
    const points = 60;
    const data = [];
    
    for (let i = 0; i < points; i++) {
      const timeRatio = i / points;
      let power = activity.avg_power || 200;
      let hr = activity.avg_hr || 150;
      
      if (activity.segments.length > 0) {
        const segment = activity.segments.find(s => 
          timeRatio >= (s.segment_start / activity.duration) && 
          timeRatio <= (s.segment_end / activity.duration)
        );
        if (segment) {
          power = segment.avg_power + (Math.random() - 0.5) * 20;
          hr = segment.avg_hr || hr + 20;
        }
      } else {
        power = power + (Math.random() - 0.5) * 40;
        hr = hr + (Math.random() - 0.5) * 15;
      }
      
      data.push({
        time: Math.round((i / points) * activity.duration),
        timeLabel: `${Math.floor((i / points) * activity.duration / 60)}:${String(Math.floor(((i / points) * activity.duration) % 60)).padStart(2, '0')}`,
        power: Math.round(power),
        heartRate: Math.round(hr),
        cadence: (activity.avg_cadence || 90) + (Math.random() - 0.5) * 10,
        speed: (activity.avg_speed) + (Math.random() - 0.5) * 5
      });
    }
    
    return data;
  };

  const openActivityDetail = (activity: EnhancedActivity) => {
    setSelectedActivity(activity);
    setActivityData(generateActivityData(activity));
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600">Detailed activity analysis and performance metrics</p>
        </div>
        <Button>
          <Activity className="h-4 w-4 mr-2" />
          Sync Activities
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ride">Ride</SelectItem>
            <SelectItem value="run">Run</SelectItem>
            <SelectItem value="virtualride">Virtual Ride</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredActivities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                    <Badge variant="secondary">{activity.type}</Badge>
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(activity.start_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Route className="h-4 w-4" />
                      {(activity.distance / 1000).toFixed(1)}km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(activity.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mountain className="h-4 w-4" />
                      {activity.elevation_gain}m
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {activity.advanced_metrics?.normalized_power || activity.avg_power || 'N/A'}W
                      </div>
                      <div className="text-xs text-gray-500">NP</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {activity.advanced_metrics?.intensity_factor.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">IF</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {Math.round(activity.advanced_metrics?.training_stress_score || 0)}
                      </div>
                      <div className="text-xs text-gray-500">TSS</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {activity.advanced_metrics?.efficiency_factor.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">EF</div>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => openActivityDetail(activity)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedActivity?.name}</DialogTitle>
                        <DialogDescription>
                          Detailed performance analysis and segment breakdown
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedActivity && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-xl font-bold text-blue-600">
                                {selectedActivity.advanced_metrics?.normalized_power}W
                              </div>
                              <div className="text-sm text-gray-600">Normalized Power</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-xl font-bold text-green-600">
                                {selectedActivity.advanced_metrics?.training_stress_score}
                              </div>
                              <div className="text-sm text-gray-600">Training Stress</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-xl font-bold text-purple-600">
                                {selectedActivity.advanced_metrics?.variability_index.toFixed(3)}
                              </div>
                              <div className="text-sm text-gray-600">Variability Index</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-xl font-bold text-orange-600">
                                {selectedActivity.advanced_metrics?.efficiency_factor.toFixed(1)}
                              </div>
                              <div className="text-sm text-gray-600">Efficiency Factor</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-semibold mb-4">Power & Heart Rate Analysis</h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timeLabel" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey="power"
                                  stroke="#3b82f6"
                                  strokeWidth={2}
                                  dot={false}
                                  name="Power (W)"
                                />
                                <Line
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey="heartRate"
                                  stroke="#ef4444"
                                  strokeWidth={2}
                                  dot={false}
                                  name="Heart Rate (bpm)"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          
                          {selectedActivity.segments.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold mb-4">Segment Analysis</h4>
                              <div className="space-y-3">
                                {selectedActivity.segments.map((segment) => (
                                  <div key={segment.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium">{segment.segment_name}</h5>
                                      <div className="flex gap-2">
                                        {segment.pr_rank && (
                                          <Badge variant="outline">PR #{segment.pr_rank}</Badge>
                                        )}
                                        {segment.kom_rank && (
                                          <Badge variant="secondary">KOM #{segment.kom_rank}</Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <div className="font-medium">{segment.avg_power}W</div>
                                        <div className="text-gray-500">Avg Power</div>
                                      </div>
                                      <div>
                                        <div className="font-medium">{segment.normalized_power}W</div>
                                        <div className="text-gray-500">NP</div>
                                      </div>
                                      <div>
                                        <div className="font-medium">{segment.avg_speed.toFixed(1)}km/h</div>
                                        <div className="text-gray-500">Avg Speed</div>
                                      </div>
                                      <div>
                                        <div className="font-medium">{formatDuration(segment.duration)}</div>
                                        <div className="text-gray-500">Duration</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No activities found matching your criteria.</p>
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Sync from Strava
          </Button>
        </div>
      )}
    </div>
  );
}