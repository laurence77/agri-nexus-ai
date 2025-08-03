import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Droplets,
  Thermometer,
  Sun,
  Wind,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Zap,
  Gauge
} from 'lucide-react';

interface SensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightIntensity: number;
  windSpeed: number;
  ph: number;
}

interface SensorDataChartProps {
  fieldId?: string;
  timeRange?: '24h' | '7d' | '30d';
}

const SensorDataChart = ({ fieldId = 'field-1', timeRange = '24h' }: SensorDataChartProps) => {
  const [selectedMetric, setSelectedMetric] = useState<keyof Omit<SensorReading, 'timestamp'>>('temperature');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  const sensorData: SensorReading[] = [
    { timestamp: '00:00', temperature: 18.5, humidity: 78, soilMoisture: 45, lightIntensity: 0, windSpeed: 8, ph: 6.8 },
    { timestamp: '02:00', temperature: 17.2, humidity: 82, soilMoisture: 44, lightIntensity: 0, windSpeed: 6, ph: 6.8 },
    { timestamp: '04:00', temperature: 16.8, humidity: 85, soilMoisture: 43, lightIntensity: 0, windSpeed: 4, ph: 6.9 },
    { timestamp: '06:00', temperature: 18.1, humidity: 79, soilMoisture: 42, lightIntensity: 150, windSpeed: 7, ph: 6.9 },
    { timestamp: '08:00', temperature: 21.3, humidity: 72, soilMoisture: 41, lightIntensity: 450, windSpeed: 9, ph: 7.0 },
    { timestamp: '10:00', temperature: 24.7, humidity: 65, soilMoisture: 39, lightIntensity: 720, windSpeed: 12, ph: 7.0 },
    { timestamp: '12:00', temperature: 27.9, humidity: 58, soilMoisture: 37, lightIntensity: 980, windSpeed: 15, ph: 7.1 },
    { timestamp: '14:00', temperature: 29.2, humidity: 55, soilMoisture: 35, lightIntensity: 950, windSpeed: 18, ph: 7.1 },
    { timestamp: '16:00', temperature: 28.1, humidity: 59, soilMoisture: 34, lightIntensity: 680, windSpeed: 16, ph: 7.0 },
    { timestamp: '18:00', temperature: 25.4, humidity: 64, soilMoisture: 36, lightIntensity: 280, windSpeed: 13, ph: 7.0 },
    { timestamp: '20:00', temperature: 22.7, humidity: 71, soilMoisture: 38, lightIntensity: 45, windSpeed: 10, ph: 6.9 },
    { timestamp: '22:00', temperature: 20.3, humidity: 76, soilMoisture: 41, lightIntensity: 0, windSpeed: 8, ph: 6.8 }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev < 100 ? prev + 3 : 100));
    }, 50);
    return () => clearInterval(timer);
  }, [selectedMetric]);

  const getMetricConfig = (metric: keyof Omit<SensorReading, 'timestamp'>) => {
    const configs = {
      temperature: { 
        icon: <Thermometer className="w-4 h-4" />, 
        color: 'from-orange-500 to-red-500', 
        unit: '°C', 
        optimal: [20, 28],
        label: 'Temperature'
      },
      humidity: { 
        icon: <Droplets className="w-4 h-4" />, 
        color: 'from-blue-500 to-blue-600', 
        unit: '%', 
        optimal: [60, 80],
        label: 'Humidity'
      },
      soilMoisture: { 
        icon: <Droplets className="w-4 h-4" />, 
        color: 'from-emerald-500 to-green-600', 
        unit: '%', 
        optimal: [40, 60],
        label: 'Soil Moisture'
      },
      lightIntensity: { 
        icon: <Sun className="w-4 h-4" />, 
        color: 'from-yellow-500 to-orange-500', 
        unit: 'lux', 
        optimal: [400, 800],
        label: 'Light Intensity'
      },
      windSpeed: { 
        icon: <Wind className="w-4 h-4" />, 
        color: 'from-gray-500 to-slate-600', 
        unit: 'km/h', 
        optimal: [5, 15],
        label: 'Wind Speed'
      },
      ph: { 
        icon: <Gauge className="w-4 h-4" />, 
        color: 'from-purple-500 to-indigo-600', 
        unit: 'pH', 
        optimal: [6.5, 7.5],
        label: 'Soil pH'
      }
    };
    return configs[metric];
  };

  const currentConfig = getMetricConfig(selectedMetric);
  const currentValues = sensorData.map(d => d[selectedMetric]);
  const currentValue = currentValues[currentValues.length - 1];
  const minValue = Math.min(...currentValues);
  const maxValue = Math.max(...currentValues);
  const avgValue = currentValues.reduce((a, b) => a + b, 0) / currentValues.length;

  const isInOptimalRange = (value: number, optimal: [number, number]) => {
    return value >= optimal[0] && value <= optimal[1];
  };

  const getStatusColor = (value: number, optimal: [number, number]) => {
    if (isInOptimalRange(value, optimal)) return 'text-green-600';
    if (value < optimal[0] * 0.8 || value > optimal[1] * 1.2) return 'text-red-600';
    return 'text-orange-600';
  };

  const getStatusIcon = (value: number, optimal: [number, number]) => {
    if (isInOptimalRange(value, optimal)) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (value < optimal[0] * 0.8 || value > optimal[1] * 1.2) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-orange-600" />;
  };

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${currentConfig.color} rounded-xl flex items-center justify-center text-white`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Live Sensor Data</h3>
            <p className="text-sm text-gray-600">Field {fieldId.toUpperCase()} • Real-time monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="glass-input !padding-2 text-sm border-0"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Badge className="glass-badge success animate-pulse">
            Live
          </Badge>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {(Object.keys(getMetricConfig('temperature')) as const).slice(0, 6).map((_, index) => {
          const metrics: Array<keyof Omit<SensorReading, 'timestamp'>> = ['temperature', 'humidity', 'soilMoisture', 'lightIntensity', 'windSpeed', 'ph'];
          const metric = metrics[index];
          const config = getMetricConfig(metric);
          const value = sensorData[sensorData.length - 1][metric];
          const isSelected = selectedMetric === metric;
          
          return (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`glass-button !padding-3 text-center transition-all ${
                isSelected ? 'bg-white/30 scale-105' : 'hover:bg-white/20'
              }`}
            >
              <div className={`w-8 h-8 bg-gradient-to-r ${config.color} rounded-lg flex items-center justify-center text-white mx-auto mb-2`}>
                {config.icon}
              </div>
              <p className="text-xs font-medium text-gray-900">{config.label}</p>
              <p className="text-sm font-bold text-gray-800">{value}{config.unit}</p>
            </button>
          );
        })}
      </div>

      {/* Current Value Display */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-white/50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-1">
            {getStatusIcon(currentValue, currentConfig.optimal)}
            <span className={`text-2xl font-bold ${getStatusColor(currentValue, currentConfig.optimal)}`}>
              {currentValue}{currentConfig.unit}
            </span>
          </div>
          <p className="text-sm text-gray-600">Current {currentConfig.label}</p>
          <p className={`text-xs ${getStatusColor(currentValue, currentConfig.optimal)}`}>
            {isInOptimalRange(currentValue, currentConfig.optimal) ? 'Optimal' : 'Needs Attention'}
          </p>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <span className="text-2xl font-bold text-gray-700">{avgValue.toFixed(1)}{currentConfig.unit}</span>
          <p className="text-sm text-gray-600">24h Average</p>
          <p className="text-xs text-gray-500">Baseline reference</p>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <span className="text-2xl font-bold text-blue-600">
            {currentConfig.optimal[0]}-{currentConfig.optimal[1]}{currentConfig.unit}
          </span>
          <p className="text-sm text-blue-700">Optimal Range</p>
          <p className="text-xs text-blue-600">Target zone</p>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative bg-white/50 rounded-xl p-6" style={{ height: '240px' }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-6 bottom-6 flex flex-col justify-between text-xs text-gray-500 w-12">
          <span>{maxValue.toFixed(1)}</span>
          <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
          <span>{minValue.toFixed(1)}</span>
        </div>

        {/* Optimal range indicator */}
        <div className="absolute left-14 right-4 top-6 bottom-6">
          <div 
            className="absolute w-full bg-green-100 border-t border-b border-green-300 opacity-30"
            style={{
              top: `${((maxValue - currentConfig.optimal[1]) / (maxValue - minValue)) * 100}%`,
              height: `${((currentConfig.optimal[1] - currentConfig.optimal[0]) / (maxValue - minValue)) * 100}%`
            }}
          >
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-green-600 font-medium">
              Optimal
            </span>
          </div>
        </div>

        {/* Chart line */}
        <div className="ml-14 mr-4 h-full relative">
          <svg className="w-full h-full" viewBox="0 0 400 180">
            <defs>
              <linearGradient id={`gradient-${selectedMetric}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" className={`${currentConfig.color.includes('orange') ? 'stop-orange-400' : 
                  currentConfig.color.includes('blue') ? 'stop-blue-400' :
                  currentConfig.color.includes('emerald') ? 'stop-emerald-400' :
                  currentConfig.color.includes('yellow') ? 'stop-yellow-400' :
                  currentConfig.color.includes('gray') ? 'stop-gray-400' : 'stop-purple-400'}`} stopOpacity="0.3" />
                <stop offset="100%" className={`${currentConfig.color.includes('orange') ? 'stop-orange-600' : 
                  currentConfig.color.includes('blue') ? 'stop-blue-600' :
                  currentConfig.color.includes('emerald') ? 'stop-emerald-600' :
                  currentConfig.color.includes('yellow') ? 'stop-yellow-600' :
                  currentConfig.color.includes('gray') ? 'stop-gray-600' : 'stop-purple-600'}`} stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Data line */}
            <polyline
              fill="none"
              stroke={currentConfig.color.includes('orange') ? '#f97316' : 
                currentConfig.color.includes('blue') ? '#2563eb' :
                currentConfig.color.includes('emerald') ? '#059669' :
                currentConfig.color.includes('yellow') ? '#eab308' :
                currentConfig.color.includes('gray') ? '#6b7280' : '#7c3aed'}
              strokeWidth="3"
              strokeDasharray={`${(400 * animationProgress) / 100}, 400`}
              points={sensorData.map((point, index) => {
                const x = (index / (sensorData.length - 1)) * 380 + 10;
                const y = 170 - ((point[selectedMetric] - minValue) / (maxValue - minValue)) * 160;
                return `${x},${y}`;
              }).join(' ')}
              className="transition-all duration-1000 ease-out"
            />
            
            {/* Data points */}
            {sensorData.map((point, index) => {
              const x = (index / (sensorData.length - 1)) * 380 + 10;
              const y = 170 - ((point[selectedMetric] - minValue) / (maxValue - minValue)) * 160;
              const opacity = (index / sensorData.length) * (animationProgress / 100);
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={currentConfig.color.includes('orange') ? '#f97316' : 
                    currentConfig.color.includes('blue') ? '#2563eb' :
                    currentConfig.color.includes('emerald') ? '#059669' :
                    currentConfig.color.includes('yellow') ? '#eab308' :
                    currentConfig.color.includes('gray') ? '#6b7280' : '#7c3aed'}
                  opacity={opacity}
                  className="transition-opacity duration-500"
                />
              );
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-2 left-14 right-4 flex justify-between text-xs text-gray-500">
          {sensorData.filter((_, i) => i % 3 === 0).map((point, index) => (
            <span key={index}>{point.timestamp}</span>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="mt-6 space-y-3">
        {isInOptimalRange(currentValue, currentConfig.optimal) ? (
          <div className="glass-notification success">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">{currentConfig.label} Optimal</p>
                <p className="text-sm text-green-700">
                  Current reading of {currentValue}{currentConfig.unit} is within optimal range for {selectedMetric === 'soilMoisture' ? 'maize growth' : 'plant health'}.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-notification warning">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">{currentConfig.label} Attention Needed</p>
                <p className="text-sm text-orange-700">
                  Current {currentConfig.label.toLowerCase()} is {currentValue < currentConfig.optimal[0] ? 'below' : 'above'} optimal range. 
                  {selectedMetric === 'soilMoisture' && currentValue < currentConfig.optimal[0] && ' Consider irrigation.'}
                  {selectedMetric === 'temperature' && currentValue > currentConfig.optimal[1] && ' Provide shade or ventilation.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorDataChart;