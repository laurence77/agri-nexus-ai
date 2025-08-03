import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import { WeatherData, WeatherForecast } from '@/types';
import {
  CloudSun,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  RefreshCw
} from 'lucide-react';

interface WeatherDashboardProps {
  farmId?: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
}

export function WeatherDashboard({ farmId, location }: WeatherDashboardProps) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadWeatherData();
    const interval = setInterval(loadWeatherData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [farmId, location]);

  const loadWeatherData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      const mockCurrent = generateMockCurrentWeather();
      const mockForecast = generateMockForecast();
      const mockAlerts = generateMockWeatherAlerts();

      setCurrentWeather(mockCurrent);
      setForecast(mockForecast);
      setWeatherAlerts(mockAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading weather data:', error);
    }
    setIsLoading(false);
  };

  const getWeatherIcon = (conditions: string) => {
    const condition = conditions.toLowerCase();
    if (condition.includes('rain')) return <CloudRain className="h-8 w-8 text-blue-600" />;
    if (condition.includes('snow')) return <CloudSnow className="h-8 w-8 text-gray-400" />;
    if (condition.includes('cloud')) return <Cloud className="h-8 w-8 text-gray-600" />;
    if (condition.includes('clear') || condition.includes('sunny')) return <Sun className="h-8 w-8 text-yellow-500" />;
    return <CloudSun className="h-8 w-8 text-orange-500" />;
  };

  const getAlertSeverityColor = (severity: 'low' | 'medium' | 'high' | 'severe') => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'severe': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const calculateGrowingDegreeDays = (tempHigh: number, tempLow: number, baseTemp: number = 10) => {
    const avgTemp = (tempHigh + tempLow) / 2;
    return Math.max(0, avgTemp - baseTemp);
  };

  const getIrrigationRecommendation = () => {
    if (!currentWeather || !forecast.length) return null;
    
    const upcomingRain = forecast.slice(0, 3).reduce((acc, day) => acc + day.precipitationAmount, 0);
    const humidity = currentWeather.humidity;
    
    if (upcomingRain > 10) return { action: 'Delay', reason: 'Heavy rain expected', color: 'text-blue-600' };
    if (upcomingRain > 5) return { action: 'Reduce', reason: 'Rain expected', color: 'text-green-600' };
    if (humidity < 30) return { action: 'Increase', reason: 'Low humidity', color: 'text-orange-600' };
    return { action: 'Continue', reason: 'Normal conditions', color: 'text-gray-600' };
  };

  const irrigationRec = getIrrigationRecommendation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CloudSun className="h-6 w-6" />
            Weather Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {location?.name || 'Farm Location'} • Real-time weather and predictions
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="precipitation">Precipitation</SelectItem>
              <SelectItem value="humidity">Humidity</SelectItem>
              <SelectItem value="wind">Wind Speed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadWeatherData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weatherAlerts.map((alert) => (
            <Alert key={alert.id} variant={alert.severity === 'severe' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>{alert.title}</strong>
                    <p className="text-sm mt-1">{alert.description}</p>
                  </div>
                  <Badge className={getAlertSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Current Weather */}
      {currentWeather && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Conditions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getWeatherIcon(currentWeather.conditions)}
                Current Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {Math.round(currentWeather.temperature)}°C
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 capitalize">
                  {currentWeather.conditions}
                </p>
                <p className="text-sm text-gray-500">
                  Feels like {Math.round(currentWeather.temperature + 2)}°C
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Humidity</p>
                    <p className="text-gray-600 dark:text-gray-400">{currentWeather.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="font-medium">Wind</p>
                    <p className="text-gray-600 dark:text-gray-400">{currentWeather.windSpeed} km/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-medium">Pressure</p>
                    <p className="text-gray-600 dark:text-gray-400">{currentWeather.pressure} hPa</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="font-medium">UV Index</p>
                    <p className="text-gray-600 dark:text-gray-400">{currentWeather.uvIndex}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                7-Day Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecast.slice(0, 7).map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-sm font-medium">
                        {index === 0 ? 'Today' : day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      {getWeatherIcon(day.conditions)}
                      <div>
                        <p className="text-sm font-medium capitalize">{day.conditions}</p>
                        <p className="text-xs text-gray-500">{day.precipitationChance}% rain</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="font-medium">{Math.round(day.temperatureHigh)}°C</p>
                        <p className="text-gray-500">{Math.round(day.temperatureLow)}°C</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-600">{day.precipitationAmount}mm</p>
                        <p className="text-gray-500">{day.windSpeed} km/h</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weather Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {selectedMetric === 'temperature' && 'Temperature Trend'}
              {selectedMetric === 'precipitation' && 'Precipitation Forecast'}
              {selectedMetric === 'humidity' && 'Humidity Levels'}
              {selectedMetric === 'wind' && 'Wind Speed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {selectedMetric === 'precipitation' ? (
                  <BarChart data={forecast.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value) => [`${value}mm`, 'Precipitation']}
                    />
                    <Bar dataKey="precipitationAmount" fill="#3b82f6" />
                  </BarChart>
                ) : (
                  <AreaChart data={forecast.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value, name) => [
                        `${value}${selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : ' km/h'}`, 
                        name
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={selectedMetric === 'temperature' ? 'temperatureHigh' : 
                               selectedMetric === 'humidity' ? 'humidity' : 'windSpeed'} 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      name={selectedMetric === 'temperature' ? 'High' : 
                            selectedMetric === 'humidity' ? 'Humidity' : 'Wind Speed'}
                    />
                    {selectedMetric === 'temperature' && (
                      <Area 
                        type="monotone" 
                        dataKey="temperatureLow" 
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.3}
                        name="Low"
                      />
                    )}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agricultural Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Agricultural Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Growing Degree Days */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">
                Growing Degree Days (GDD)
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-600 dark:text-green-400">Today</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-300">
                    {forecast.length > 0 ? Math.round(calculateGrowingDegreeDays(
                      forecast[0].temperatureHigh, 
                      forecast[0].temperatureLow
                    )) : 0}
                  </p>
                </div>
                <div>
                  <p className="text-green-600 dark:text-green-400">7-Day Total</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-300">
                    {Math.round(forecast.slice(0, 7).reduce((acc, day) => 
                      acc + calculateGrowingDegreeDays(day.temperatureHigh, day.temperatureLow), 0
                    ))}
                  </p>
                </div>
              </div>
            </div>

            {/* Irrigation Recommendation */}
            {irrigationRec && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                  Irrigation Recommendation
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-lg font-bold ${irrigationRec.color}`}>
                      {irrigationRec.action}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {irrigationRec.reason}
                    </p>
                  </div>
                  <Droplets className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            )}

            {/* Frost Risk */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-medium text-orange-800 dark:text-orange-400 mb-2">
                Frost Risk Assessment
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-orange-800 dark:text-orange-300">
                    {forecast.some(day => day.temperatureLow < 2) ? 'High Risk' : 'Low Risk'}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Next 7 days
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            {/* Optimal Field Conditions */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-purple-800 dark:text-purple-400 mb-2">
                Field Work Windows
              </h4>
              <div className="space-y-2 text-sm">
                {forecast.slice(0, 3).map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-purple-600 dark:text-purple-400">
                      {index === 0 ? 'Today' : day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <Badge variant={day.precipitationChance < 20 ? 'default' : 'secondary'}>
                      {day.precipitationChance < 20 ? 'Good' : 'Poor'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Update */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleTimeString()} • Data from National Weather Service
      </div>
    </div>
  );
}

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'severe';
  type: 'frost' | 'storm' | 'wind' | 'temperature' | 'precipitation';
  startTime: Date;
  endTime: Date;
}

// Mock data generators
function generateMockCurrentWeather(): WeatherData {
  return {
    timestamp: new Date(),
    temperature: 22 + Math.random() * 8, // 22-30°C
    humidity: 45 + Math.random() * 25, // 45-70%
    rainfall: Math.random() * 2, // 0-2mm
    windSpeed: 5 + Math.random() * 15, // 5-20 km/h
    windDirection: Math.random() * 360,
    pressure: 1010 + Math.random() * 20, // 1010-1030 hPa
    uvIndex: Math.floor(Math.random() * 11), // 0-10
    conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Sunny'][Math.floor(Math.random() * 5)]
  };
}

function generateMockForecast(): WeatherForecast[] {
  const forecast: WeatherForecast[] = [];
  const baseDate = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    const tempHigh = 25 + Math.random() * 10; // 25-35°C
    const tempLow = tempHigh - 8 - Math.random() * 5; // 8-13°C cooler
    
    forecast.push({
      date,
      temperatureHigh: Math.round(tempHigh * 10) / 10,
      temperatureLow: Math.round(tempLow * 10) / 10,
      humidity: 40 + Math.random() * 40, // 40-80%
      precipitationChance: Math.round(Math.random() * 100),
      precipitationAmount: Math.random() * 10, // 0-10mm
      windSpeed: 5 + Math.random() * 15, // 5-20 km/h
      conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Sunny', 'Thunderstorms'][Math.floor(Math.random() * 6)]
    });
  }
  
  return forecast;
}

function generateMockWeatherAlerts(): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const now = new Date();
  
  // Sometimes add frost warning
  if (Math.random() > 0.7) {
    alerts.push({
      id: 'alert-1',
      title: 'Frost Warning',
      description: 'Temperatures may drop below 2°C tonight. Protect sensitive crops.',
      severity: 'high',
      type: 'frost',
      startTime: new Date(now.getTime() + 8 * 60 * 60 * 1000), // Tonight
      endTime: new Date(now.getTime() + 16 * 60 * 60 * 1000)   // Tomorrow morning
    });
  }
  
  // Sometimes add wind warning
  if (Math.random() > 0.8) {
    alerts.push({
      id: 'alert-2',
      title: 'High Wind Advisory',
      description: 'Sustained winds of 40-55 km/h expected. Secure equipment and structures.',
      severity: 'medium',
      type: 'wind',
      startTime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 12 * 60 * 60 * 1000)
    });
  }
  
  return alerts;
}