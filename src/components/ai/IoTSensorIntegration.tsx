import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  Thermometer,
  Droplets,
  Activity,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Settings,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Brain,
  Zap,
  Sun,
  CloudRain,
  Gauge
} from 'lucide-react';
import { IoTSensorData } from '@/services/ai/crop-monitoring-service';

interface IoTSensorIntegrationProps {
  fieldId: string;
  fieldName?: string;
  onInsightsGenerated?: (insights: any) => void;
  className?: string;
}

interface SensorConfig {
  id: string;
  name: string;
  type: IoTSensorData['sensorType'];
  fieldId: string;
  location: { x: number; y: number };
  batteryLevel: number;
  signalStrength: number;
  isOnline: boolean;
  lastSeen: Date;
  calibrationDate: Date;
  thresholds: {
    min: number;
    max: number;
    critical_low: number;
    critical_high: number;
  };
}

interface SensorReading {
  sensorId: string;
  timestamp: Date;
  value: number;
  status: 'normal' | 'warning' | 'critical';
}

interface SensorInsights {
  fieldConditions: Record<string, any>;
  alerts: Array<{ type: string; message: string; severity: string }>;
  recommendations: string[];
  correlations: Array<{ 
    sensor1: string; 
    sensor2: string; 
    correlation: number; 
    insight: string 
  }>;
}

/**
 * IoT Sensor Integration Component
 * Manages and displays data from agricultural IoT sensors
 */
export function IoTSensorIntegration({ 
  fieldId, 
  fieldName,
  onInsightsGenerated,
  className 
}: IoTSensorIntegrationProps) {
  const [sensors, setSensors] = useState<SensorConfig[]>([]);
  const [sensorData, setSensorData] = useState<IoTSensorData[]>([]);
  const [insights, setInsights] = useState<SensorInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [showAddSensor, setShowAddSensor] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  const loadSensors = useCallback(async () => {
    // Mock sensor configurations - in production, fetch from database
    const mockSensors: SensorConfig[] = [
      {
        id: 'sensor_001',
        name: 'Soil Moisture A',
        type: 'soil_moisture',
        fieldId,
        location: { x: 25, y: 30 },
        batteryLevel: 85,
        signalStrength: 90,
        isOnline: true,
        lastSeen: new Date(),
        calibrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        thresholds: { min: 20, max: 80, critical_low: 15, critical_high: 90 }
      },
      {
        id: 'sensor_002',
        name: 'Temperature B',
        type: 'temperature',
        fieldId,
        location: { x: 60, y: 45 },
        batteryLevel: 65,
        signalStrength: 75,
        isOnline: true,
        lastSeen: new Date(Date.now() - 5 * 60 * 1000),
        calibrationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        thresholds: { min: 10, max: 35, critical_low: 5, critical_high: 40 }
      },
      {
        id: 'sensor_003',
        name: 'Humidity C',
        type: 'humidity',
        fieldId,
        location: { x: 80, y: 20 },
        batteryLevel: 45,
        signalStrength: 60,
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        calibrationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        thresholds: { min: 30, max: 80, critical_low: 20, critical_high: 90 }
      },
      {
        id: 'sensor_004',
        name: 'pH Monitor D',
        type: 'ph',
        fieldId,
        location: { x: 40, y: 70 },
        batteryLevel: 92,
        signalStrength: 85,
        isOnline: true,
        lastSeen: new Date(),
        calibrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        thresholds: { min: 6.0, max: 7.5, critical_low: 5.5, critical_high: 8.0 }
      }
    ];
    setSensors(mockSensors);
  }, [fieldId]);

  const loadSensorData = useCallback(async () => {
    if (sensors.length === 0) return;
    try {
      const mockData: IoTSensorData[] = sensors
        .filter(sensor => sensor.isOnline)
        .map(sensor => {
          let value: number;
          let status: IoTSensorData['status'] = 'normal';
          switch (sensor.type) {
            case 'soil_moisture':
              value = 40 + Math.random() * 40;
              if (value < sensor.thresholds.critical_low || value > sensor.thresholds.critical_high) status = 'critical';
              else if (value < sensor.thresholds.min || value > sensor.thresholds.max) status = 'warning';
              break;
            case 'temperature':
              value = 20 + Math.random() * 15;
              if (value < sensor.thresholds.critical_low || value > sensor.thresholds.critical_high) status = 'critical';
              else if (value < sensor.thresholds.min || value > sensor.thresholds.max) status = 'warning';
              break;
            case 'humidity':
              value = 50 + Math.random() * 30;
              if (value < sensor.thresholds.critical_low || value > sensor.thresholds.critical_high) status = 'critical';
              else if (value < sensor.thresholds.min || value > sensor.thresholds.max) status = 'warning';
              break;
            case 'ph':
              value = 6.0 + Math.random() * 1.5;
              if (value < sensor.thresholds.critical_low || value > sensor.thresholds.critical_high) status = 'critical';
              else if (value < sensor.thresholds.min || value > sensor.thresholds.max) status = 'warning';
              break;
            default:
              value = Math.random() * 100;
          }
          return {
            sensorId: sensor.id,
            timestamp: new Date(),
            sensorType: sensor.type,
            value,
            unit: sensor.type === 'temperature' ? '°C' : sensor.type === 'soil_moisture' || sensor.type === 'humidity' ? '%' : '',
            status
          } as IoTSensorData;
        });
      setSensorData(mockData);
    } catch (e) {
      // no-op for mock
    }
  }, [sensors]);

  useEffect(() => {
    if (fieldId) {
      loadSensors();
      loadSensorData();
    }
  }, [fieldId, timeRange, loadSensors, loadSensorData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (realTimeMode) {
      interval = setInterval(() => {
        loadSensorData();
      }, 30 * 1000); // Update every 30 seconds in real-time mode
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeMode, fieldId, loadSensorData]);

  const loadSensors = async () => {
    // Mock sensor configurations - in production, fetch from database
    const mockSensors: SensorConfig[] = [
      {
        id: 'sensor_001',
        name: 'Soil Moisture A',
        type: 'soil_moisture',
        fieldId,
        location: { x: 25, y: 30 },
        batteryLevel: 85,
        signalStrength: 90,
        isOnline: true,
        lastSeen: new Date(),
        calibrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        thresholds: { min: 20, max: 80, critical_low: 15, critical_high: 90 }
      },
      {
        id: 'sensor_002',
        name: 'Temperature B',
        type: 'temperature',
        fieldId,
        location: { x: 60, y: 45 },
        batteryLevel: 65,
        signalStrength: 75,
        isOnline: true,
        lastSeen: new Date(Date.now() - 5 * 60 * 1000),
        calibrationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        thresholds: { min: 10, max: 35, critical_low: 5, critical_high: 40 }
      },
      {
        id: 'sensor_003',
        name: 'Humidity C',
        type: 'humidity',
        fieldId,
        location: { x: 80, y: 20 },
        batteryLevel: 45,
        signalStrength: 60,
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        calibrationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        thresholds: { min: 30, max: 80, critical_low: 20, critical_high: 90 }
      },
      {
        id: 'sensor_004',
        name: 'pH Monitor D',
        type: 'ph',
        fieldId,
        location: { x: 40, y: 70 },
        batteryLevel: 92,
        signalStrength: 85,
        isOnline: true,
        lastSeen: new Date(),
        calibrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        thresholds: { min: 6.0, max: 7.5, critical_low: 5.5, critical_high: 8.0 }
      }
    ];

    setSensors(mockSensors);
  };

  const loadSensorData = async () => {
    if (sensors.length === 0) return;

    try {
      const mockData: IoTSensorData[] = sensors
        .filter(sensor => sensor.isOnline)
        .map(sensor => {
          let value: number;
          let status: IoTSensorData['status'] = 'normal';

          // Generate realistic sensor values based on type
          switch (sensor.type) {
            case 'soil_moisture':
              value = 40 + Math.random() * 40; // 40-80%
              if (value < sensor.thresholds.critical_low || value > sensor.thresholds.critical_high) {
                status = 'critical';
              } else if (value < sensor.thresholds.min || value > sensor.thresholds.max) {
                status = 'warning';
              }
              break;
            case 'temperature':
              value = 20 + Math.random() * 15; // 20-35°C
              if (value < sensor.thresholds.critical_low || value > sensor.thresholds.critical_high) {
                status = 'critical';
              } else if (value < sensor.thresholds.min || value > sensor.thresholds.max) {
                status = 'warning';
              }
              break;
            case 'humidity':
              value = 50 + Math.random() * 30; // 50-80%
              if (value < sensor.thresholds.critical_low || value > sensor.thresholds.critical_high) {
                status = 'critical';
              } else if (value < sensor.thresholds.min || value > sensor.thresholds.max) {
                status = 'warning';
              }
              break;
            case 'ph':
              value = 6.0 + Math.random() * 1.5; // 6.0-7.5
              if (value < sensor.thresholds.critical_low || value > sensor.thresholds.critical_high) {
                status = 'critical';
              } else if (value < sensor.thresholds.min || value > sensor.thresholds.max) {
                status = 'warning';
              }
              break;
            default:
              value = Math.random() * 100;
          }

          return {
            sensorId: sensor.id,
            fieldId: sensor.fieldId,
            timestamp: new Date(),
            sensorType: sensor.type,
            value: Math.round(value * 100) / 100,
            unit: getSensorUnit(sensor.type),
            status,
            calibrationDate: sensor.calibrationDate
          };
        });

      setSensorData(mockData);

      // Generate insights if we have data
      if (mockData.length > 0) {
        await generateInsights(mockData);
      }
    } catch (error) {
      console.error('Error loading sensor data:', error);
    }
  };

  const generateInsights = async (data: IoTSensorData[]) => {
    try {
      const response = await fetch('/api/ai/crop-monitoring/process-sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sensorData: data,
          tenantId: 'current' // In real app, get from auth
        })
      });

      const result = await response.json();

      if (response.ok) {
        const sensorInsights: SensorInsights = {
          ...result.insights,
          correlations: generateCorrelations(data)
        };

        setInsights(sensorInsights);
        onInsightsGenerated?.(sensorInsights);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      // Generate mock insights
      setInsights(generateMockInsights(data));
    }
  };

  const generateCorrelations = (data: IoTSensorData[]): SensorInsights['correlations'] => {
    const correlations: SensorInsights['correlations'] = [];
    
    // Find temperature and humidity sensors for correlation
    const tempSensor = data.find(d => d.sensorType === 'temperature');
    const humiditySensor = data.find(d => d.sensorType === 'humidity');
    
    if (tempSensor && humiditySensor) {
      const correlation = -0.6 + Math.random() * 0.4; // Mock negative correlation
      correlations.push({
        sensor1: tempSensor.sensorId,
        sensor2: humiditySensor.sensorId,
        correlation,
        insight: correlation < -0.5 ? 
          'Strong inverse relationship: higher temperature correlates with lower humidity' :
          'Moderate temperature-humidity relationship observed'
      });
    }

    return correlations;
  };

  const generateMockInsights = (data: IoTSensorData[]): SensorInsights => {
    const alerts = data
      .filter(d => d.status !== 'normal')
      .map(d => ({
        type: d.sensorType,
        message: `${getSensorDisplayName(d.sensorType)} is ${d.status}: ${d.value}${d.unit}`,
        severity: d.status === 'critical' ? 'high' : 'medium'
      }));

    const recommendations: string[] = [];
    
    if (data.some(d => d.sensorType === 'soil_moisture' && d.value < 30)) {
      recommendations.push('Soil moisture is low - consider irrigation');
    }
    
    if (data.some(d => d.sensorType === 'temperature' && d.value > 32)) {
      recommendations.push('High temperature detected - monitor crop stress');
    }

    return {
      fieldConditions: data.reduce((acc, d) => {
        acc[d.sensorType] = { value: d.value, unit: d.unit, status: d.status };
        return acc;
      }, {} as Record<string, any>),
      alerts,
      recommendations,
      correlations: generateCorrelations(data)
    };
  };

  const getSensorIcon = (type: IoTSensorData['sensorType']) => {
    switch (type) {
      case 'soil_moisture': return <Droplets className="h-5 w-5 text-blue-400" />;
      case 'temperature': return <Thermometer className="h-5 w-5 text-red-400" />;
      case 'humidity': return <CloudRain className="h-5 w-5 text-green-400" />;
      case 'ph': return <Gauge className="h-5 w-5 text-purple-400" />;
      case 'light': return <Sun className="h-5 w-5 text-yellow-400" />;
      default: return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getSensorUnit = (type: IoTSensorData['sensorType']): string => {
    switch (type) {
      case 'soil_moisture': return '%';
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'ph': return 'pH';
      case 'light': return 'lux';
      case 'rainfall': return 'mm';
      default: return '';
    }
  };

  const getSensorDisplayName = (type: IoTSensorData['sensorType']): string => {
    switch (type) {
      case 'soil_moisture': return 'Soil Moisture';
      case 'temperature': return 'Temperature';
      case 'humidity': return 'Humidity';
      case 'ph': return 'pH Level';
      case 'light': return 'Light Intensity';
      case 'rainfall': return 'Rainfall';
      default: return type.replace('_', ' ');
    }
  };

  const getStatusColor = (status: IoTSensorData['status']) => {
    switch (status) {
      case 'normal': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'critical': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getBatteryIcon = (level: number) => {
    return level > 20 ? 
      <Battery className="h-4 w-4 text-green-400" /> : 
      <BatteryLow className="h-4 w-4 text-red-400" />;
  };

  const getSignalIcon = (strength: number, isOnline: boolean) => {
    if (!isOnline) return <WifiOff className="h-4 w-4 text-red-400" />;
    return <Wifi className={cn('h-4 w-4', strength > 50 ? 'text-green-400' : 'text-yellow-400')} />;
  };

  const handleAnalyzeData = async () => {
    if (sensorData.length === 0) return;
    
    setLoading(true);
    await generateInsights(sensorData);
    setLoading(false);
  };

  return (
    <div className={cn('iot-sensor-integration space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-3">
            <Activity className="h-6 w-6 text-purple-400" />
            <span>IoT Sensors</span>
          </h3>
          {fieldName && (
            <p className="text-gray-300 mt-1">{fieldName}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="hour" className="bg-gray-800">Last Hour</option>
            <option value="day" className="bg-gray-800">Last Day</option>
            <option value="week" className="bg-gray-800">Last Week</option>
            <option value="month" className="bg-gray-800">Last Month</option>
          </select>
          
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => setRealTimeMode(!realTimeMode)}
            className={realTimeMode ? 'bg-green-500/20 text-green-400' : ''}
          >
            <RefreshCw className={cn('h-4 w-4', realTimeMode && 'animate-spin')} />
          </GlassButton>
          
          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => setShowAddSensor(true)}
          >
            <Plus className="h-4 w-4" />
          </GlassButton>
        </div>
      </div>

      {/* Sensor Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {sensors.length}
          </div>
          <div className="text-xs text-gray-300">Total Sensors</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {sensors.filter(s => s.isOnline).length}
          </div>
          <div className="text-xs text-gray-300">Online</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {sensorData.filter(d => d.status === 'warning').length}
          </div>
          <div className="text-xs text-gray-300">Warnings</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {sensorData.filter(d => d.status === 'critical').length}
          </div>
          <div className="text-xs text-gray-300">Critical</div>
        </GlassCard>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensors.map((sensor) => {
          const data = sensorData.find(d => d.sensorId === sensor.id);
          
          return (
            <GlassCard key={sensor.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  {getSensorIcon(sensor.type)}
                  <div>
                    <h4 className="text-white font-medium">{sensor.name}</h4>
                    <p className="text-gray-400 text-sm capitalize">
                      {getSensorDisplayName(sensor.type)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getSignalIcon(sensor.signalStrength, sensor.isOnline)}
                  {getBatteryIcon(sensor.batteryLevel)}
                </div>
              </div>

              {/* Current Reading */}
              {data && sensor.isOnline ? (
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-white mb-1">
                    {data.value}{data.unit}
                  </div>
                  <div className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(data.status)
                  )}>
                    {data.status}
                  </div>
                </div>
              ) : (
                <div className="text-center mb-4 text-gray-400">
                  <WifiOff className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Offline</p>
                </div>
              )}

              {/* Sensor Status */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Battery</span>
                  <span className={cn(
                    'font-medium',
                    sensor.batteryLevel > 50 ? 'text-green-400' :
                    sensor.batteryLevel > 20 ? 'text-yellow-400' :
                    'text-red-400'
                  )}>
                    {sensor.batteryLevel}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Signal</span>
                  <span className={cn(
                    'font-medium',
                    sensor.signalStrength > 70 ? 'text-green-400' :
                    sensor.signalStrength > 40 ? 'text-yellow-400' :
                    'text-red-400'
                  )}>
                    {sensor.signalStrength}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Seen</span>
                  <span className="text-white">
                    {sensor.isOnline ? 'Now' : sensor.lastSeen.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-4">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedSensor(sensor.id)}
                  className="flex-1"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </GlassButton>
                
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => console.log('Edit sensor', sensor.id)}
                >
                  <Edit className="h-3 w-3" />
                </GlassButton>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* AI Insights */}
      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span>Sensor Alerts</span>
              </h4>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleAnalyzeData}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
              </GlassButton>
            </div>
            
            {insights.alerts.length > 0 ? (
              <div className="space-y-3">
                {insights.alerts.map((alert, index) => (
                  <div key={index} className={cn(
                    'flex items-start space-x-3 p-3 rounded-lg',
                    alert.severity === 'high' ? 'bg-red-500/20 border border-red-500/30' :
                    'bg-yellow-500/20 border border-yellow-500/30'
                  )}>
                    <AlertTriangle className={cn(
                      'h-4 w-4 mt-0.5 flex-shrink-0',
                      alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                    )} />
                    <div>
                      <p className="text-white text-sm font-medium capitalize">
                        {alert.type.replace('_', ' ')} Alert
                      </p>
                      <p className="text-gray-300 text-sm">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active alerts</p>
              </div>
            )}
          </GlassCard>

          {/* Recommendations */}
          <GlassCard className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <span>AI Recommendations</span>
            </h4>
            
            {insights.recommendations.length > 0 ? (
              <div className="space-y-3">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recommendations available</p>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Sensor Correlations */}
      {insights?.correlations && insights.correlations.length > 0 && (
        <GlassCard className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-400" />
            <span>Sensor Correlations</span>
          </h4>
          
          <div className="space-y-4">
            {insights.correlations.map((corr, index) => (
              <div key={index} className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">
                      {sensors.find(s => s.id === corr.sensor1)?.name} ↔ {sensors.find(s => s.id === corr.sensor2)?.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {corr.correlation > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={cn(
                      'font-medium',
                      Math.abs(corr.correlation) > 0.7 ? 'text-green-400' :
                      Math.abs(corr.correlation) > 0.4 ? 'text-yellow-400' :
                      'text-gray-400'
                    )}>
                      {Math.abs(corr.correlation).toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{corr.insight}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Empty State */}
      {sensors.length === 0 && (
        <GlassCard className="p-12 text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <p className="text-white text-lg">No IoT sensors configured</p>
          <p className="text-gray-400 text-sm mt-2">Add sensors to start monitoring field conditions</p>
          <GlassButton
            variant="primary"
            onClick={() => setShowAddSensor(true)}
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Sensor
          </GlassButton>
        </GlassCard>
      )}

      {/* Real-time indicator */}
      {realTimeMode && (
        <div className="fixed bottom-4 right-4 bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Real-time monitoring active</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default IoTSensorIntegration;
