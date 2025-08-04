import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  CloudSnow, 
  Zap, 
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface WeatherData {
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    pressure: number;
    visibility: number;
    uv_index: number;
    condition: string;
    icon: string;
    rainfall_today: number;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    rain_probability: number;
    wind_speed: number;
  }>;
  alerts: Array<{
    type: 'warning' | 'watch' | 'advisory';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

interface WeatherWidgetProps {
  location: string;
  data?: WeatherData;
  loading?: boolean;
  error?: string;
  compact?: boolean;
  showForecast?: boolean;
  showAlerts?: boolean;
  className?: string;
}

/**
 * Agricultural Weather Widget
 * Optimized for farming needs with agricultural-specific data
 */
export function WeatherWidget({
  location,
  data,
  loading = false,
  error,
  compact = false,
  showForecast = true,
  showAlerts = true,
  className
}: WeatherWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (condition: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8';
    
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className={cn(iconSize, 'text-yellow-400')} />;
      case 'cloudy':
      case 'overcast':
        return <Cloud className={cn(iconSize, 'text-gray-400')} />;
      case 'rainy':
      case 'rain':
        return <CloudRain className={cn(iconSize, 'text-blue-400')} />;
      case 'snowy':
      case 'snow':
        return <CloudSnow className={cn(iconSize, 'text-white')} />;
      case 'stormy':
      case 'thunderstorm':
        return <Zap className={cn(iconSize, 'text-purple-400')} />;
      default:
        return <Sun className={cn(iconSize, 'text-yellow-400')} />;
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex <= 2) return 'text-green-400';
    if (uvIndex <= 5) return 'text-yellow-400';
    if (uvIndex <= 7) return 'text-orange-400';
    if (uvIndex <= 10) return 'text-red-400';
    return 'text-purple-400';
  };

  const getUVIndexLabel = (uvIndex: number) => {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  };

  if (loading) {
    return (
      <GlassCard variant="water" className={cn('weather-widget animate-pulse', className)}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-white/20 rounded w-24"></div>
            <div className="h-4 bg-white/20 rounded w-16"></div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className="h-16 w-16 bg-white/20 rounded-full"></div>
            <div>
              <div className="h-8 bg-white/20 rounded w-20 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-16"></div>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard variant="danger" className={cn('weather-widget', className)}>
        <div className="text-center space-y-2">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto" />
          <p className="text-white font-medium">Weather Data Unavailable</p>
          <p className="text-gray-300 text-sm">{error}</p>
        </div>
      </GlassCard>
    );
  }

  if (!data) {
    return (
      <GlassCard variant="water" className={cn('weather-widget', className)}>
        <div className="text-center text-gray-300">
          No weather data available
        </div>  
      </GlassCard>
    );
  }

  if (compact) {
    return (
      <GlassCard variant="water" className={cn('weather-widget p-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getWeatherIcon(data.current.condition, 'md')}
            <div>
              <div className="text-2xl font-bold text-white">
                {Math.round(data.current.temperature)}°
              </div>
              <div className="text-xs text-gray-300">
                {data.current.condition}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300">{location}</div>
            <div className="text-xs text-gray-400">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Weather */}
      <GlassCard variant="water" className="weather-widget">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">{location}</h3>
            <p className="text-sm text-gray-300">
              {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Last updated</div>
            <div className="text-xs text-gray-300">Just now</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="weather-icon">
              {getWeatherIcon(data.current.condition, 'lg')}
            </div>
            <div>
              <div className="text-4xl font-bold text-white">
                {Math.round(data.current.temperature)}°C
              </div>
              <div className="text-sm text-gray-300">
                Feels like {Math.round(data.current.feels_like)}°C
              </div>
              <div className="text-sm font-medium text-white mt-1">
                {data.current.condition}
              </div>
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-gray-300">
              <Droplets className="h-4 w-4" />
              <span className="text-xs">Humidity</span>
            </div>
            <div className="text-white font-medium">{data.current.humidity}%</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-gray-300">
              <Wind className="h-4 w-4" />
              <span className="text-xs">Wind</span>
            </div>
            <div className="text-white font-medium">
              {data.current.wind_speed} km/h {getWindDirection(data.current.wind_direction)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-gray-300">
              <Gauge className="h-4 w-4" />
              <span className="text-xs">Pressure</span>
            </div>
            <div className="text-white font-medium">{data.current.pressure} hPa</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-gray-300">
              <Eye className="h-4 w-4" />
              <span className="text-xs">Visibility</span>
            </div>
            <div className="text-white font-medium">{data.current.visibility} km</div>
          </div>
        </div>

        {/* Agricultural Specific Data */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-gray-300">
              <Sun className="h-4 w-4" />
              <span className="text-xs">UV Index</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={cn('font-medium', getUVIndexColor(data.current.uv_index))}>
                {data.current.uv_index}
              </span>
              <span className={cn('text-xs', getUVIndexColor(data.current.uv_index))}>
                {getUVIndexLabel(data.current.uv_index)}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-gray-300">
              <CloudRain className="h-4 w-4" />
              <span className="text-xs">Rainfall Today</span>
            </div>
            <div className="text-white font-medium">{data.current.rainfall_today} mm</div>
          </div>
        </div>
      </GlassCard>

      {/* Weather Alerts */}
      {showAlerts && data.alerts && data.alerts.length > 0 && (
        <GlassCard variant="warning" className="alerts-panel">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Weather Alerts</span>
          </h4>
          <div className="space-y-3">
            {data.alerts.map((alert, index) => (
              <div 
                key={index}
                className={cn(
                  'p-3 rounded-lg border',
                  alert.severity === 'high' && 'bg-red-500/20 border-red-400',
                  alert.severity === 'medium' && 'bg-yellow-500/20 border-yellow-400',
                  alert.severity === 'low' && 'bg-blue-500/20 border-blue-400'
                )}
              >
                <div className="font-medium text-white text-sm">{alert.title}</div>
                <div className="text-xs text-gray-300 mt-1">{alert.description}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* 5-Day Forecast */}
      {showForecast && data.forecast && (
        <GlassCard variant="water" className="p-4">
          <h4 className="text-lg font-semibold text-white mb-4">5-Day Forecast</h4>
          <div className="space-y-3">
            {data.forecast.slice(0, 5).map((day, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-12 text-sm text-gray-300">
                    {index === 0 ? 'Today' : day.day}
                  </div>
                  {getWeatherIcon(day.condition, 'sm')}
                  <div className="text-sm text-white">{day.condition}</div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-blue-400">
                    <CloudRain className="h-3 w-3" />
                    <span>{day.rain_probability}%</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Wind className="h-3 w-3" />
                    <span>{day.wind_speed}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{Math.round(day.high)}°</span>
                    <span className="text-gray-400">{Math.round(day.low)}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

/**
 * Mini Weather Card for Dashboard
 */
interface MiniWeatherCardProps {
  temperature: number;
  condition: string;
  location: string;
  className?: string;
}

export function MiniWeatherCard({ 
  temperature, 
  condition, 
  location, 
  className 
}: MiniWeatherCardProps) {
  return (
    <GlassCard variant="water" className={cn('p-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {React.createElement(WeatherWidget.prototype.getWeatherIcon(condition, 'sm'))}
          <div>
            <div className="text-lg font-bold text-white">
              {Math.round(temperature)}°
            </div>
            <div className="text-xs text-gray-300">
              {location}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 text-right">
          {condition}
        </div>
      </div>
    </GlassCard>
  );
}

export default WeatherWidget;