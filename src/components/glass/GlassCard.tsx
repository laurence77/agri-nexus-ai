import React, { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'agricultural' | 'crop' | 'water' | 'equipment' | 'warning' | 'danger' | 'dark';
  hover?: boolean;
  glow?: boolean;
  float?: boolean;
}

/**
 * Apple Glass Card Component
 * Optimized for agricultural interfaces and outdoor visibility
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, variant = 'default', hover = false, glow = false, float = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass',
          {
            'glass-agricultural': variant === 'agricultural',
            'glass-crop': variant === 'crop',
            'glass-water': variant === 'water',
            'glass-equipment': variant === 'equipment',
            'glass-warning': variant === 'warning',
            'glass-danger': variant === 'danger',
            'glass-dark': variant === 'dark',
            'animate-pulse-glow': glow,
            'animate-float': float,
            'hover:transform hover:scale-105 transition-transform duration-300': hover,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

/**
 * Specialized Crop Monitoring Card
 */
interface CropMonitoringCardProps {
  children: ReactNode;
  cropType: string;
  healthScore: number;
  status: 'healthy' | 'warning' | 'danger';
  className?: string;
}

export function CropMonitoringCard({ 
  children, 
  cropType, 
  healthScore, 
  status, 
  className 
}: CropMonitoringCardProps) {
  const getHealthColor = () => {
    if (healthScore >= 80) return 'text-green-400';
    if (healthScore >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={cn('crop-monitoring-card', className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{cropType}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-300">Health Score:</span>
            <span className={cn('text-sm font-bold', getHealthColor())}>
              {healthScore}%
            </span>
          </div>
        </div>
        <div className={cn('status-badge', {
          'status-healthy': status === 'healthy',
          'status-warning': status === 'warning',
          'status-danger': status === 'danger'
        })}>
          {status}
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * Metric Display Card
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: ReactNode;
  variant?: 'default' | 'agricultural' | 'crop' | 'water' | 'equipment';
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  change, 
  trend, 
  icon, 
  variant = 'default',
  className 
}: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <GlassCard variant={variant} className={cn('metric-card', className)}>
      <div className="flex flex-col items-center space-y-2">
        {icon && (
          <div className="text-3xl text-white opacity-80">
            {icon}
          </div>
        )}
        <h4 className="text-sm font-medium text-gray-300 text-center">
          {title}
        </h4>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-white">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-gray-400">
              {unit}
            </span>
          )}
        </div>
        {change && (
          <div className={cn('text-xs font-medium', getTrendColor())}>
            {trend === 'up' && '↗ '}
            {trend === 'down' && '↘ '}
            {trend === 'stable' && '→ '}
            {change}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/**
 * Equipment Status Card
 */
interface EquipmentStatusCardProps {
  name: string;
  status: 'operational' | 'maintenance' | 'broken';
  lastMaintenance?: string;
  nextMaintenance?: string;
  usageHours?: number;
  className?: string;
}

export function EquipmentStatusCard({
  name,
  status,
  lastMaintenance,
  nextMaintenance,
  usageHours,
  className
}: EquipmentStatusCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'operational':
        return { color: 'status-healthy', text: 'Operational', icon: '✓' };
      case 'maintenance':
        return { color: 'status-warning', text: 'Maintenance Due', icon: '⚠' };
      case 'broken':
        return { color: 'status-danger', text: 'Out of Service', icon: '✗' };
      default:
        return { color: 'status-healthy', text: 'Unknown', icon: '?' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={cn('equipment-status-card', className)}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <div className={cn('status-badge', statusConfig.color)}>
          {statusConfig.icon} {statusConfig.text}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        {usageHours && (
          <div className="flex justify-between">
            <span className="text-gray-300">Usage Hours:</span>
            <span className="text-white font-medium">{usageHours}h</span>
          </div>
        )}
        {lastMaintenance && (
          <div className="flex justify-between">
            <span className="text-gray-300">Last Maintenance:</span>
            <span className="text-white font-medium">{lastMaintenance}</span>
          </div>
        )}
        {nextMaintenance && (
          <div className="flex justify-between">
            <span className="text-gray-300">Next Maintenance:</span>
            <span className="text-white font-medium">{nextMaintenance}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Alerts Panel
 */
interface AlertsPanelProps {
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'danger';
    title: string;
    message: string;
    timestamp: string;
  }>;
  className?: string;
}

export function AlertsPanel({ alerts, className }: AlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ';
      case 'warning': return '⚠';
      case 'danger': return '🚨';
      default: return 'ℹ';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={cn('alerts-panel', className)}>
      <h3 className="text-lg font-semibold text-white mb-4">
        Active Alerts ({alerts.length})
      </h3>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            No active alerts
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className="bg-black bg-opacity-20 rounded-lg p-3 border border-white border-opacity-20"
            >
              <div className="flex items-start space-x-3">
                <span className={cn('text-lg', getAlertColor(alert.type))}>
                  {getAlertIcon(alert.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-gray-300 mt-1">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Market Prices Ticker
 */
interface MarketPrice {
  commodity: string;
  price: number;
  currency: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface MarketTickerProps {
  prices: MarketPrice[];
  className?: string;
}

export function MarketTicker({ prices, className }: MarketTickerProps) {
  return (
    <div className={cn('market-ticker', className)}>
      <h3 className="text-sm font-medium text-white mb-2">Market Prices</h3>
      <div className="overflow-hidden">
        <div className="animate-ticker flex space-x-8">
          {prices.map((price, index) => (
            <div key={index} className="flex-shrink-0 flex items-center space-x-2">
              <span className="text-sm font-medium text-white">
                {price.commodity}
              </span>
              <span className="text-sm text-gray-300">
                {price.currency} {price.price.toFixed(2)}
              </span>
              <span className={cn('text-xs', {
                'text-green-400': price.trend === 'up',
                'text-red-400': price.trend === 'down',
                'text-gray-400': price.trend === 'stable'
              })}>
                {price.trend === 'up' && '↗'}
                {price.trend === 'down' && '↘'}
                {price.trend === 'stable' && '→'}
                {Math.abs(price.change)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GlassCard;