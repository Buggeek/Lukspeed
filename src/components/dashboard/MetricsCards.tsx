import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, MapPin, Zap } from 'lucide-react';

interface MetricsCardsProps {
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
  avgPower: number;
}

export function MetricsCards({ 
  totalActivities, 
  totalDistance, 
  totalTime, 
  avgPower 
}: MetricsCardsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const metrics = [
    {
      title: 'Total Activities',
      value: totalActivities.toString(),
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Distance',
      value: `${(totalDistance).toFixed(1)} km`,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Time',
      value: formatTime(totalTime),
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Avg. Power',
      value: `${avgPower}W`,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {metric.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}