import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Sensor, SensorReading, Alert as AlertType } from '@/types';
import {
  Thermometer,
  Droplets,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity,
  Wifi,
  WifiOff,
  Battery,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface SensorDashboardProps {
  farmId?: string;
  fieldId?: string;
}

export function SensorDashboard({ farmId, fieldId }: SensorDashboardProps) {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sensorReadings, setSensorReadings] = useState<Record<string, SensorReading[]>>({});
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadSensorData();
    const interval = setInterval(loadSensorData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [farmId, fieldId, selectedTimeRange]);

  const loadSensorData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      const mockSensors = generateMockSensors();
      const mockReadings = generateMockReadings(mockSensors);
      const mockAlerts = generateMockAlerts();

      setSensors(mockSensors);
      setSensorReadings(mockReadings);
      setAlerts(mockAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading sensor data:', error);
    }
    setIsLoading(false);
  };

  const getSensorIcon = (type: Sensor['type']) => {
    switch (type) {
      case 'soil_moisture': return <Droplets className="h-5 w-5 text-blue-600" />;
      case 'soil_temperature': return <Thermometer className="h-5 w-5 text-orange-600" />;
      case 'air_temperature': return <Thermometer className="h-5 w-5 text-red-600" />;
      case 'humidity': return <Droplets className="h-5 w-5 text-cyan-600" />;
      case 'soil_ph': return <Zap className="h-5 w-5 text-purple-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSensorStatusColor = (status: Sensor['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const getAlertSeverityColor = (severity: AlertType['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const getLatestReading = (sensorId: string): SensorReading | undefined => {
    const readings = sensorReadings[sensorId];
    return readings && readings.length > 0 ? readings[readings.length - 1] : undefined;
  };

  const activeSensors = sensors.filter(s => s.status === 'active');
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.isResolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-6 w-6" />
            IoT Sensor Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time monitoring and sensor analytics
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadSensorData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <Wifi className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeSensors.length}
                </p>
                <p className="text-sm text-gray-500">Active Sensors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {criticalAlerts.length}
                </p>
                <p className="text-sm text-gray-500">Critical Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <Battery className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(sensors.reduce((acc, s) => acc + (s.batteryLevel || 0), 0) / sensors.length)}%
                </p>
                <p className="text-sm text-gray-500">Avg Battery</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((activeSensors.length / sensors.length) * 100)}%
                </p>
                <p className="text-sm text-gray-500">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalAlerts.slice(0, 3).map((alert) => (
              <Alert key={alert.id} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{alert.title}</strong>: {alert.message}
                  <div className="text-xs mt-1 opacity-75">
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sensors.map((sensor) => {
          const latestReading = getLatestReading(sensor.id);
          const readings = sensorReadings[sensor.id] || [];
          
          return (
            <Card key={sensor.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSensorIcon(sensor.type)}
                    <CardTitle className="text-lg">{sensor.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSensorStatusColor(sensor.status)}>
                      {sensor.status}
                    </Badge>
                    {sensor.status === 'active' ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Current Reading */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {latestReading ? `${latestReading.value}${latestReading.unit}` : '--'}
                    </span>
                    {latestReading && (
                      <div className="flex items-center gap-1 text-sm">
                        {readings.length >= 2 && 
                         readings[readings.length - 1].value > readings[readings.length - 2].value ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Last reading: {latestReading?.timestamp.toLocaleTimeString() || 'No data'}
                  </p>
                </div>

                {/* Mini Chart */}
                {readings.length > 0 && (
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={readings.slice(-20)}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(time) => new Date(time).toLocaleTimeString().slice(0, 5)}
                          fontSize={10}
                        />
                        <YAxis fontSize={10} />
                        <Tooltip 
                          labelFormatter={(time) => new Date(time).toLocaleString()}
                          formatter={(value) => [`${value}${latestReading?.unit}`, 'Value']}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Battery Level */}
                {sensor.batteryLevel !== undefined && (
                  <div className="mt-3 flex items-center gap-2">
                    <Battery className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full battery-progress ${
                          sensor.batteryLevel > 20 ? 'bg-green-500' : 
                          sensor.batteryLevel > 10 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ '--battery-level': `${sensor.batteryLevel}%` } as React.CSSProperties}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{sensor.batteryLevel}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Last Update */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
}

// Mock data generators
function generateMockSensors(): Sensor[] {
  return [
    {
      id: '1',
      name: 'Soil Moisture A1',
      type: 'soil_moisture',
      fieldId: 'field-1',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      status: 'active',
      batteryLevel: 85,
      lastReading: new Date(),
      alertThresholds: { min: 20, max: 80 }
    },
    {
      id: '2',
      name: 'Soil Temperature A1',
      type: 'soil_temperature',
      fieldId: 'field-1',
      coordinates: { lat: 40.7130, lng: -74.0062 },
      status: 'active',
      batteryLevel: 92,
      lastReading: new Date(),
      alertThresholds: { min: 10, max: 35 }
    },
    {
      id: '3',
      name: 'pH Sensor A1',
      type: 'soil_ph',
      fieldId: 'field-1',
      coordinates: { lat: 40.7126, lng: -74.0058 },
      status: 'active',
      batteryLevel: 78,
      lastReading: new Date(),
      alertThresholds: { min: 6.0, max: 7.5 }
    },
    {
      id: '4',
      name: 'Air Temperature A1',
      type: 'air_temperature',
      fieldId: 'field-1',
      coordinates: { lat: 40.7132, lng: -74.0064 },
      status: 'active',
      batteryLevel: 67,
      lastReading: new Date(),
      alertThresholds: { min: 0, max: 40 }
    },
    {
      id: '5',
      name: 'Humidity Sensor A1',
      type: 'humidity',
      fieldId: 'field-1',
      coordinates: { lat: 40.7124, lng: -74.0056 },
      status: 'maintenance',
      batteryLevel: 15,
      lastReading: new Date(Date.now() - 60000),
      alertThresholds: { min: 30, max: 90 }
    }
  ];
}

function generateMockReadings(sensors: Sensor[]): Record<string, SensorReading[]> {
  const readings: Record<string, SensorReading[]> = {};
  
  sensors.forEach(sensor => {
    const sensorReadings: SensorReading[] = [];
    const now = new Date();
    
    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(now.getTime() - (i * 30 * 1000)); // 30-second intervals
      let value: number;
      let unit: string;
      
      switch (sensor.type) {
        case 'soil_moisture':
          value = 45 + Math.random() * 30; // 45-75%
          unit = '%';
          break;
        case 'soil_temperature':
          value = 18 + Math.random() * 10; // 18-28°C
          unit = '°C';
          break;
        case 'air_temperature':
          value = 20 + Math.random() * 15; // 20-35°C
          unit = '°C';
          break;
        case 'humidity':
          value = 40 + Math.random() * 40; // 40-80%
          unit = '%';
          break;
        case 'soil_ph':
          value = 6.2 + Math.random() * 1.3; // 6.2-7.5
          unit = 'pH';
          break;
        default:
          value = Math.random() * 100;
          unit = '';
      }
      
      sensorReadings.unshift({
        id: `reading-${sensor.id}-${i}`,
        sensorId: sensor.id,
        timestamp,
        value: Math.round(value * 10) / 10,
        unit,
        fieldId: sensor.fieldId
      });
    }
    
    readings[sensor.id] = sensorReadings;
  });
  
  return readings;
}

function generateMockAlerts(): AlertType[] {
  return [
    {
      id: '1',
      type: 'sensor',
      severity: 'critical',
      title: 'Low Soil Moisture',
      message: 'Soil moisture in Field A1 has dropped below 20%',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      farmId: 'farm-1',
      fieldId: 'field-1',
      entityId: '1',
      isRead: false,
      isResolved: false
    },
    {
      id: '2',
      type: 'sensor',
      severity: 'high',
      title: 'Sensor Battery Low',
      message: 'Humidity sensor battery level is below 20%',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      farmId: 'farm-1',
      fieldId: 'field-1',
      entityId: '5',
      isRead: false,
      isResolved: false
    }
  ];
}