import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendsChartProps {
  data: {
    date: string;
    power: number;
    speed: number;
    distance: number;
  }[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formattedData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="power"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Avg Power (W)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="speed"
              stroke="#10b981"
              strokeWidth={2}
              name="Avg Speed (km/h)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="distance"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Distance (km)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}