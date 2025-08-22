import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'normal' | 'warning' | 'critical' | 'excellent';
}

export function MetricCard({
  title,
  value,
  unit,
  change,
  changeLabel,
  trend,
  icon,
  description,
  className,
  size = 'md',
  status = 'normal'
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getValueSize = () => {
    switch (size) {
      case 'sm': return 'text-lg';
      case 'lg': return 'text-3xl';
      default: return 'text-2xl';
    }
  };

  return (
    <Card className={cn(getStatusColor(), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
          {description && (
            <Info className="inline-block ml-1 h-3 w-3 text-gray-400" />
          )}
        </CardTitle>
        {icon && (
          <div className="p-2 rounded-lg bg-blue-50">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className={cn('font-bold text-gray-900', getValueSize())}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && (
              <span className="text-sm text-gray-500">{unit}</span>
            )}
          </div>
          
          {(change !== undefined || changeLabel) && (
            <div className="flex items-center gap-1 text-sm">
              {getTrendIcon()}
              <span className={getTrendColor()}>
                {change !== undefined && (
                  <>
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </>
                )}
                {changeLabel && (
                  <span className="ml-1 text-gray-500">
                    {changeLabel}
                  </span>
                )}
              </span>
            </div>
          )}

          {status !== 'normal' && (
            <Badge 
              variant={status === 'excellent' ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                status === 'excellent' && 'bg-green-100 text-green-800',
                status === 'warning' && 'bg-yellow-100 text-yellow-800',
                status === 'critical' && 'bg-red-100 text-red-800'
              )}
            >
              {status === 'excellent' && 'Excellent'}
              {status === 'warning' && 'Attention'}
              {status === 'critical' && 'Critical'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}