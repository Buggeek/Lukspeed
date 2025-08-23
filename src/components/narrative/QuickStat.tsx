import { Badge } from '@/components/ui/badge';

interface QuickStatProps {
  icon: string;
  value: string;
  change: string;
  label: string;
  isPositive?: boolean;
}

export function QuickStat({ icon, value, change, label, isPositive = true }: QuickStatProps) {
  return (
    <div className="text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <Badge 
        className={`text-xs mb-1 ${
          isPositive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}
      >
        {change}
      </Badge>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}