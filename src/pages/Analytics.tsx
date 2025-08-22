import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30');
  const [isLoading, setIsLoading] = useState(true);

  // Mock analytics data
  const performanceData = [
    { date: '2025-07-14', avgPower: 235, normalizedPower: 245, avgSpeed: 32.5, avgHeartRate: 145 },
    { date: '2025-07-21', avgPower: 240, normalizedPower: 250, avgSpeed: 33.1, avgHeartRate: 148 },
    { date: '2025-07-28', avgPower: 238, normalizedPower: 248, avgSpeed: 32.8, avgHeartRate: 146 },
    { date: '2025-08-04', avgPower: 245, normalizedPower: 255, avgSpeed: 34.2, avgHeartRate: 150 },
    { date: '2025-08-11', avgPower: 248, normalizedPower: 258, avgSpeed: 34.8, avgHeartRate: 152 },
  ];

  const powerDistribution = [
    { zone: 'Zone 1', minutes: 120, percentage: 30 },
    { zone: 'Zone 2', minutes: 140, percentage: 35 },
    { zone: 'Zone 3', minutes: 80, percentage: 20 },
    { zone: 'Zone 4', minutes: 40, percentage: 10 },
    { zone: 'Zone 5', minutes: 20, percentage: 5 },
  ];

  const aerodynamicsData = [
    { speed: 25, cda: 0.285, power: 180 },
    { speed: 30, cda: 0.282, power: 220 },
    { speed: 35, cda: 0.280, power: 280 },
    { speed: 40, cda: 0.278, power: 350 },
    { speed: 45, cda: 0.276, power: 430 },
  ];

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Power Trend
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">243W</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600">+3.2%</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Speed Trend
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">33.5 km/h</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600">+1.8%</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              CdA Estimate
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50">
              <TrendingDown className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0.281</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-green-600">-2.1%</span>
              <span className="text-gray-500">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Training Load
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-50">
              <Activity className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">385 TSS</div>
            <Badge variant="outline" className="mt-2">
              Optimal
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avgPower"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Avg Power (W)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="normalizedPower"
                stroke="#1d4ed8"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Normalized Power (W)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgSpeed"
                stroke="#10b981"
                strokeWidth={2}
                name="Avg Speed (km/h)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Power Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Training Zone Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={powerDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Aerodynamics Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Aerodynamic Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={aerodynamicsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="speed" name="Speed" unit="km/h" />
                <YAxis dataKey="cda" name="CdA" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="CdA vs Speed" dataKey="cda" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}