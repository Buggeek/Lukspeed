import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VariationBadgeProps {
  change: number;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

export function VariationBadge({ change, showIcon = true, size = 'default' }: VariationBadgeProps) {
  const isPositive = change > 0;
  const isNeutral = Math.abs(change) < 0.5;
  
  const colorClass = isNeutral 
    ? "bg-gray-100 text-gray-700"
    : isPositive 
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
    
  const icon = isNeutral 
    ? <Minus className="h-3 w-3" />
    : isPositive 
    ? <TrendingUp className="h-3 w-3" />
    : <TrendingDown className="h-3 w-3" />;

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : '';

  return (
    <Badge className={`${colorClass} font-medium ${sizeClass}`}>
      {showIcon && (
        <span className="mr-1 flex items-center">
          {icon}
        </span>
      )}
      <span>
        {isPositive && '+'}{Math.abs(change).toFixed(1)}%
      </span>
    </Badge>
  );
}