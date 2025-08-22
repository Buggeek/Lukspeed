import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProgressDataPoint {
  date: string;
  ftp: number;
  vo2_max: number;
  cda: number;
  weight: number;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
  className?: string;
}

export function ProgressChart({ data, className }: ProgressChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'ftp' | 'vo2_max' | 'cda' | 'weight'>('ftp');
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');

  const getMetricConfig = (metric: string) => {
    switch (metric) {
      case 'ftp':
        return { 
          label: 'FTP (W)', 
          color: '#3b82f6', 
          unit: 'W',
          format: (value: number) => `${value}W`,
          good: 'increase'
        };
      case 'vo2_max':
        return { 
          label: 'VO2 Max', 
          color: '#ef4444', 
          unit: 'ml/kg/min',
          format: (value: number) => `${value.toFixed(1)}`,
          good: 'increase'
        };
      case 'cda':
        return { 
          label: 'CdA (m²)', 
          color: '#8b5cf6', 
          unit: 'm²',
          format: (value: number) => `${value.toFixed(3)}`,
          good: 'decrease'
        };
      case 'weight':
        return { 
          label: 'Peso (kg)', 
          color: '#f59e0b', 
          unit: 'kg',
          format: (value: number) => `${value.toFixed(1)}kg`,
          good: 'decrease'
        };
      default:
        return { 
          label: 'Métrica', 
          color: '#6b7280', 
          unit: '',
          format: (value: number) => `${value}`,
          good: 'increase'
        };
    }
  };

  const filterDataByTimeRange = (data: ProgressDataPoint[]) => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return data;
    }

    return data.filter(point => new Date(point.date) >= cutoffDate);
  };

  const filteredData = filterDataByTimeRange(data);
  const config = getMetricConfig(selectedMetric);

  // Calculate trend
  const calculateTrend = () => {
    if (filteredData.length < 2) return { trend: 'stable', change: 0, percentage: 0 };

    const firstValue = filteredData[0][selectedMetric];
    const lastValue = filteredData[filteredData.length - 1][selectedMetric];
    const change = lastValue - firstValue;
    const percentage = (change / firstValue) * 100;

    let trend: 'up' | 'down' | 'stable';
    if (Math.abs(percentage) < 2) {
      trend = 'stable';
    } else if (change > 0) {
      trend = config.good === 'increase' ? 'up' : 'down';
    } else {
      trend = config.good === 'increase' ? 'down' : 'up';
    }

    return { trend, change, percentage };
  };

  const trendAnalysis = calculateTrend();

  const getTrendIcon = () => {
    switch (trendAnalysis.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trendAnalysis.trend) {
      case 'up':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'down':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Evolución Temporal</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getTrendColor()}>
              {getTrendIcon()}
              <span className="ml-1">
                {Math.abs(trendAnalysis.percentage).toFixed(1)}%
              </span>
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ftp">FTP</SelectItem>
              <SelectItem value="vo2_max">VO2 Max</SelectItem>
              <SelectItem value="cda">CdA</SelectItem>
              <SelectItem value="weight">Peso</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3M</SelectItem>
              <SelectItem value="6m">6M</SelectItem>
              <SelectItem value="1y">1A</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={config.format}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                formatter={(value: number) => [config.format(value), config.label]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={selectedMetric}
                stroke={config.color}
                strokeWidth={2}
                dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium text-gray-900">
              {config.format(filteredData[filteredData.length - 1]?.[selectedMetric] || 0)}
            </div>
            <div className="text-gray-500">Actual</div>
          </div>
          
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className={`font-medium ${trendAnalysis.trend === 'up' ? 'text-green-700' : 
              trendAnalysis.trend === 'down' ? 'text-red-700' : 'text-gray-700'}`}>
              {trendAnalysis.change > 0 ? '+' : ''}{config.format(trendAnalysis.change)}
            </div>
            <div className="text-gray-500">Cambio</div>
          </div>
          
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium text-gray-900">
              {filteredData.length}
            </div>
            <div className="text-gray-500">Puntos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}