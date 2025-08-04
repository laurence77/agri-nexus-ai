import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';

interface YieldDataPoint {
  period: string;
  actual: number;
  expected: number;
  crop: string;
  unit: string;
}

interface YieldChartProps {
  data: YieldDataPoint[];
  title?: string;
  subtitle?: string;
  showTrend?: boolean;
  showComparison?: boolean;
  timeframe?: 'week' | 'month' | 'season' | 'year';
  className?: string;
}

/**
 * Yield Tracking Chart Component
 * Displays crop yield data with comparison to expectations
 */
export function YieldChart({
  data,
  title = 'Yield Performance',
  subtitle,
  showTrend = true,
  showComparison = true,
  timeframe = 'month',
  className
}: YieldChartProps) {
  if (!data || data.length === 0) {
    return (
      <GlassCard variant="agricultural" className={cn('yield-chart-container', className)}>
        <div className="text-center text-gray-300 py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No yield data available</p>
        </div>
      </GlassCard>
    );
  }

  // Calculate summary statistics
  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
  const totalExpected = data.reduce((sum, item) => sum + item.expected, 0);
  const performance = totalExpected > 0 ? (totalActual / totalExpected) * 100 : 0;
  const trend = data.length > 1 ? data[data.length - 1].actual - data[0].actual : 0;
  
  const maxValue = Math.max(...data.flatMap(d => [d.actual, d.expected]));
  const unit = data[0]?.unit || 'kg';

  return (
    <GlassCard variant="agricultural" className={cn('yield-chart-container', className)}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-300 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Calendar className="h-4 w-4" />
          <span className="capitalize">{timeframe}ly</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total Yield</div>
          <div className="text-lg font-bold text-white">
            {totalActual.toLocaleString()} {unit}
          </div>
        </div>
        
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Performance</div>
          <div className={cn(
            'text-lg font-bold flex items-center space-x-1',
            performance >= 100 ? 'text-green-400' : performance >= 80 ? 'text-yellow-400' : 'text-red-400'
          )}>
            <span>{performance.toFixed(1)}%</span>
            {performance >= 100 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        </div>

        {showTrend && (
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Trend</div>
            <div className={cn(
              'text-lg font-bold flex items-center space-x-1',
              trend >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              <span>{trend >= 0 ? '+' : ''}{trend.toFixed(1)}</span>
              {trend >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const actualPercentage = maxValue > 0 ? (item.actual / maxValue) * 100 : 0;
          const expectedPercentage = maxValue > 0 ? (item.expected / maxValue) * 100 : 0;
          const performance = item.expected > 0 ? (item.actual / item.expected) * 100 : 0;

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">{item.period}</span>
                <div className="flex items-center space-x-4 text-sm">
                  {showComparison && (
                    <span className="text-gray-400">
                      Target: {item.expected.toLocaleString()} {unit}
                    </span>
                  )}
                  <span className="text-white font-medium">
                    {item.actual.toLocaleString()} {unit}
                  </span>
                  <span className={cn(
                    'font-bold',
                    performance >= 100 ? 'text-green-400' : performance >= 80 ? 'text-yellow-400' : 'text-red-400'
                  )}>
                    {performance.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="relative">
                {/* Expected yield background bar */}
                {showComparison && (
                  <div className="absolute inset-0 bg-gray-600/30 rounded-full h-6"></div>
                )}
                
                {/* Actual yield bar */}
                <div className="relative">
                  <div 
                    className={cn(
                      'h-6 rounded-full transition-all duration-1000 ease-out',
                      performance >= 100 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                      performance >= 80 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                      'bg-gradient-to-r from-red-500 to-red-400'
                    )}
                    style={{ width: `${Math.min(actualPercentage, 100)}%` }}
                  >
                    {/* Glow effect for high performance */}
                    {performance >= 100 && (
                      <div className="absolute inset-0 bg-green-400/30 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Expected yield marker */}
                  {showComparison && expectedPercentage !== actualPercentage && (
                    <div 
                      className="absolute top-0 w-1 h-6 bg-white/60"
                      style={{ left: `${Math.min(expectedPercentage, 100)}%` }}
                    >
                      <div className="absolute -top-1 -left-1 w-3 h-8 border-2 border-white/60 rounded-sm"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {showComparison && (
        <div className="flex justify-center space-x-6 mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-400 rounded-full"></div>
            <span className="text-xs text-gray-300">Actual Yield</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-white/60 rounded-sm"></div>
            <span className="text-xs text-gray-300">Expected Yield</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

/**
 * Mini Yield Summary Card
 */
interface YieldSummaryProps {
  crop: string;
  current: number;
  target: number;
  unit: string;
  period: string;
  className?: string;
}

export function YieldSummary({
  crop,
  current,
  target,
  unit,
  period,
  className
}: YieldSummaryProps) {
  const performance = target > 0 ? (current / target) * 100 : 0;
  const isAboveTarget = performance >= 100;

  return (
    <GlassCard variant="agricultural" className={cn('p-4', className)}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-white">{crop}</h4>
          <p className="text-xs text-gray-400">{period}</p>
        </div>
        <div className={cn(
          'text-xs px-2 py-1 rounded-full',
          isAboveTarget ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
        )}>
          {performance.toFixed(0)}%
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Current</span>
          <span className="text-white font-medium">
            {current.toLocaleString()} {unit}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Target</span>
          <span className="text-gray-400">
            {target.toLocaleString()} {unit}
          </span>
        </div>
        
        {/* Mini progress bar */}
        <div className="relative mt-3">
          <div className="h-2 bg-gray-600/30 rounded-full">
            <div 
              className={cn(
                'h-2 rounded-full transition-all duration-1000',
                isAboveTarget ? 'bg-green-400' : 'bg-red-400'
              )}
              style={{ width: `${Math.min(performance, 100)}%` }}
            />
          </div>
          {performance > 100 && (
            <div className="absolute -top-1 -right-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

export default YieldChart;