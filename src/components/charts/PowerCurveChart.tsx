import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PowerCurveData } from '@/types/enhanced';
import { Zap, TrendingUp } from 'lucide-react';

interface PowerCurveChartProps {
  data: PowerCurveData[];
  currentFTP?: number;
  className?: string;
  showComparison?: boolean;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

export function PowerCurveChart({
  data,
  currentFTP,
  className,
  showComparison = true,
  timeRange = '365',
  onTimeRangeChange
}: PowerCurveChartProps) {
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const processedData = useMemo(() => {
    // Group data by duration and find peak power for each time interval
    const groupedData = data.reduce((acc, point) => {
      const duration = point.duration;
      if (!acc[duration] || acc[duration].power < point.power) {
        acc[duration] = point;
      }
      return acc;
    }, {} as Record<number, PowerCurveData>);

    // Convert to array and sort by duration
    const sortedData = Object.values(groupedData)
      .sort((a, b) => a.duration - b.duration)
      .map(point => ({
        ...point,
        durationLabel: formatDuration(point.duration),
        estimatedFTP: point.duration >= 1200 ? Math.round(point.power * 0.95) : null // Estimate FTP from 20min+ efforts
      }));

    return sortedData;
  }, [data]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Duration: ${data.durationLabel}`}</p>
          <p className="text-blue-600">{`Peak Power: ${data.power}W`}</p>
          {data.estimatedFTP && (
            <p className="text-green-600 text-sm">{`Est. FTP: ${data.estimatedFTP}W`}</p>
          )}
          <p className="text-gray-500 text-sm">{`Date: ${new Date(data.date).toLocaleDateString()}`}</p>
        </div>
      );
    }
    return null;
  };

  const timeRangeOptions = [
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' },
    { value: 'all', label: 'All time' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Power Duration Curve
          </CardTitle>
          <div className="flex items-center gap-2">
            {onTimeRangeChange && (
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {showComparison && (
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Compare
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="duration"
              type="number"
              scale="log"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatDuration}
            />
            <YAxis 
              label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Current FTP reference line */}
            {currentFTP && (
              <ReferenceLine 
                y={currentFTP} 
                stroke="#10b981" 
                strokeDasharray="5 5"
                label={{ value: `FTP: ${currentFTP}W`, position: 'insideTopRight' }}
              />
            )}
            
            <Line
              type="monotone"
              dataKey="power"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              name="Peak Power"
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {processedData.find(d => d.duration === 5)?.power || 'N/A'}W
            </div>
            <div className="text-gray-500">5s Peak</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {processedData.find(d => d.duration === 60)?.power || 'N/A'}W
            </div>
            <div className="text-gray-500">1min Peak</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {processedData.find(d => d.duration === 300)?.power || 'N/A'}W
            </div>
            <div className="text-gray-500">5min Peak</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {processedData.find(d => d.duration === 1200)?.power || 'N/A'}W
            </div>
            <div className="text-gray-500">20min Peak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}