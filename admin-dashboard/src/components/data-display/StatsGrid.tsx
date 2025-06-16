"use client";

import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { LucideIcon } from 'lucide-react';

export interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  format?: 'number' | 'currency' | 'percentage' | 'custom';
  prefix?: string;
  suffix?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact';
  className?: string;
}

export function StatsGrid({
  stats,
  columns = 4,
  variant = 'default',
  className = '',
}: StatsGridProps) {
  const gridColumns = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const formatValue = (item: StatItem): string => {
    let value = item.value;
    
    // Handle formatting
    if (item.format === 'currency' && typeof value === 'number') {
      value = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } else if (item.format === 'percentage' && typeof value === 'number') {
      value = `${value}%`;
    } else if (item.format === 'number' && typeof value === 'number') {
      value = value.toLocaleString();
    }

    // Add prefix/suffix
    return `${item.prefix || ''}${value}${item.suffix || ''}`;
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral', change?: number) => {
    if (!trend && change !== undefined) {
      trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    }
    
    return trend === 'up' ? 'text-success' : 
           trend === 'down' ? 'text-destructive' : 
           'text-white/60';
  };

  if (variant === 'compact') {
    return (
      <div className={`grid ${gridColumns[columns]} gap-4 ${className}`}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const trendColor = getTrendColor(stat.trend, stat.change);

          return (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/10"
            >
              <div className="flex-1">
                <p className="text-sm text-white/60">{stat.label}</p>
                <p className="text-xl font-light text-white mt-1">
                  {formatValue(stat)}
                </p>
                {stat.change !== undefined && (
                  <p className={`text-xs mt-1 ${trendColor}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                    {stat.changeLabel && ` ${stat.changeLabel}`}
                  </p>
                )}
              </div>
              {Icon && (
                <Icon className="h-8 w-8 text-white/20 flex-shrink-0 ml-4" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid ${gridColumns[columns]} gap-4 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const trendColor = getTrendColor(stat.trend, stat.change);

        return (
          <Card key={index} className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/60">{stat.label}</p>
                  <p className="mt-2 text-2xl font-light text-white">
                    {formatValue(stat)}
                  </p>
                  {stat.change !== undefined && (
                    <p className={`mt-1 text-xs ${trendColor}`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                      {stat.changeLabel && ` ${stat.changeLabel}`}
                    </p>
                  )}
                </div>
                {Icon && (
                  <Icon className="h-8 w-8 text-white/20 flex-shrink-0 ml-4" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 