import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gaps?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gaps = { sm: 4, md: 6, lg: 8 }
}: ResponsiveGridProps) {
  const gridClasses = cn(
    'grid w-full',
    // Column responsive classes
    cols.sm && `grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    // Gap responsive classes
    gaps.sm && `gap-${gaps.sm}`,
    gaps.md && `md:gap-${gaps.md}`,
    gaps.lg && `lg:gap-${gaps.lg}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

export function ResponsiveContainer({ 
  children, 
  className,
  size = 'xl',
  padding = { mobile: 'p-4', tablet: 'md:p-6', desktop: 'lg:p-8' }
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-7xl',
    full: 'max-w-none'
  };

  const containerClasses = cn(
    'mx-auto w-full',
    maxWidthClasses[size],
    padding.mobile,
    padding.tablet,
    padding.desktop,
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

interface AdaptiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  fullHeight?: boolean;
}

export function AdaptiveCard({ 
  children, 
  className,
  title,
  subtitle,
  action,
  fullHeight = false
}: AdaptiveCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden',
      'hover:shadow-md transition-shadow duration-200',
      fullHeight && 'h-full flex flex-col',
      className
    )}>
      {(title || subtitle || action) && (
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            {action && (
              <div className="ml-4 flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={cn(
        'p-4 sm:p-6',
        fullHeight && 'flex-1 flex flex-col'
      )}>
        {children}
      </div>
    </div>
  );
}