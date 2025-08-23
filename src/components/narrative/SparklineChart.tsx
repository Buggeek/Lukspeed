interface SparklineProps {
  data: number[];
  height?: number;
  gradient?: boolean;
  color?: string;
  className?: string;
}

export function SparklineChart({ 
  data, 
  height = 40, 
  gradient = true, 
  color = '#FF6B35',
  className = ''
}: SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div className={`w-full flex justify-center ${className}`} style={{ height }}>
        <div className="flex items-center text-gray-400 text-sm">
          No hay datos suficientes
        </div>
      </div>
    );
  }

  const svgWidth = 200;
  const svgHeight = height;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * svgWidth,
    y: svgHeight - ((value - min) / range) * svgHeight
  }));
  
  const pathData = points.reduce((path, point, index) => {
    return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
  }, '');

  const gradientId = `sparklineGradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <svg width={svgWidth} height={svgHeight} className="overflow-visible">
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
        )}
        
        {/* Area fill */}
        {gradient && (
          <path
            d={`${pathData} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`}
            fill={`url(#${gradientId})`}
          />
        )}
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Current point highlight */}
        <circle
          cx={points[points.length - 1]?.x}
          cy={points[points.length - 1]?.y}
          r="3"
          fill={color}
          className="drop-shadow-sm"
        />
      </svg>
    </div>
  );
}