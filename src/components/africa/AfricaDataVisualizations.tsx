import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Droplets,
  Thermometer,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Truck,
  Smartphone,
  Globe
} from 'lucide-react';

interface MarketData {
  commodity: string;
  currentPrice: number;
  change: number;
  volume: number;
  trend: 'up' | 'down' | 'stable';
}

interface CooperativeMetrics {
  totalMembers: number;
  activeMembers: number;
  monthlyGrowth: number;
  totalRevenue: number;
  avgYield: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  forecast: string;
}

interface RegionalData {
  region: string;
  farmers: number;
  avgYield: number;
  marketAccess: number;
  digitalAdoption: number;
}

const AfricaDataVisualizations = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [selectedRegion, setSelectedRegion] = useState('east_africa');

  const marketData: MarketData[] = [
    { commodity: 'Maize', currentPrice: 35, change: 12.5, volume: 2450, trend: 'up' },
    { commodity: 'Beans', currentPrice: 80, change: -3.2, volume: 890, trend: 'down' },
    { commodity: 'Tomatoes', currentPrice: 25, change: 18.7, volume: 1200, trend: 'up' },
    { commodity: 'Cassava', currentPrice: 15, change: 2.1, volume: 3200, trend: 'stable' },
    { commodity: 'Sweet Potato', currentPrice: 20, change: 8.9, volume: 1800, trend: 'up' }
  ];

  const cooperativeMetrics: CooperativeMetrics = {
    totalMembers: 247,
    activeMembers: 231,
    monthlyGrowth: 8.5,
    totalRevenue: 847000,
    avgYield: 3.2
  };

  const weatherData: WeatherData = {
    temperature: 24,
    humidity: 78,
    rainfall: 45,
    windSpeed: 12,
    forecast: 'Favorable planting conditions expected'
  };

  const regionalData: RegionalData[] = [
    { region: 'East Africa', farmers: 125000, avgYield: 2.8, marketAccess: 65, digitalAdoption: 42 },
    { region: 'West Africa', farmers: 98000, avgYield: 2.2, marketAccess: 48, digitalAdoption: 28 },
    { region: 'Southern Africa', farmers: 67000, avgYield: 3.4, marketAccess: 72, digitalAdoption: 58 },
    { region: 'Central Africa', farmers: 54000, avgYield: 1.9, marketAccess: 38, digitalAdoption: 22 }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Africa Agricultural Analytics</h2>
              <p className="text-sm text-gray-600">Real-time insights for African agriculture</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="glass-input !padding-2 text-sm border-0"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="seasonal">Seasonal</option>
            </select>
            
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="glass-input !padding-2 text-sm border-0"
            >
              <option value="east_africa">East Africa</option>
              <option value="west_africa">West Africa</option>
              <option value="southern_africa">Southern Africa</option>
              <option value="central_africa">Central Africa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Market Intelligence Dashboard */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Live Market Prices */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Live Market Prices</h3>
                <p className="text-sm text-gray-600">KSh per kg • Updated 5 min ago</p>
              </div>
            </div>
            <Badge className="glass-badge success">Live</Badge>
          </div>

          <div className="space-y-4">
            {marketData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.trend === 'up' ? 'bg-green-100' : 
                    item.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {getTrendIcon(item.trend)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.commodity}</p>
                    <p className="text-sm text-gray-600">{item.volume} tons traded</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">KSh {item.currentPrice}</p>
                  <p className={`text-sm font-medium ${getTrendColor(item.change)}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-notification info mt-4">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">Market Opportunity</p>
                <p className="text-sm text-gray-600">
                  Tomato prices up 18.7% - optimal selling window in Nairobi market
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cooperative Performance */}
        <div className="glass-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cooperative Dashboard</h3>
              <p className="text-sm text-gray-600">Kibera Farmers Cooperative</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{cooperativeMetrics.totalMembers}</p>
              <p className="text-sm text-purple-700">Total Members</p>
              <p className="text-xs text-gray-600">{cooperativeMetrics.activeMembers} active</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">+{cooperativeMetrics.monthlyGrowth}%</p>
              <p className="text-sm text-green-700">Monthly Growth</p>
              <p className="text-xs text-gray-600">New members joined</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Group Revenue</span>
              <span className="text-lg font-semibold text-gray-900">
                KSh {(cooperativeMetrics.totalRevenue / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Yield</span>
              <span className="text-lg font-semibold text-green-600">
                {cooperativeMetrics.avgYield} tons/acre
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <Button className="glass-button h-12 flex-col text-xs">
              <Truck className="w-4 h-4 mb-1" />
              Transport
            </Button>
            <Button className="glass-button h-12 flex-col text-xs">
              <Globe className="w-4 h-4 mb-1" />
              Market
            </Button>
            <Button className="glass-button h-12 flex-col text-xs">
              <Smartphone className="w-4 h-4 mb-1" />
              Training
            </Button>
          </div>
        </div>
      </div>

      {/* Weather and Climate Intelligence */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Thermometer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Climate Intelligence</h3>
            <p className="text-sm text-gray-600">Real-time weather data and AI forecasting</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
              <Thermometer className="w-8 h-8" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{weatherData.temperature}°C</p>
            <p className="text-sm text-gray-600">Temperature</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
              <Droplets className="w-8 h-8" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{weatherData.humidity}%</p>
            <p className="text-sm text-gray-600">Humidity</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
              <Activity className="w-8 h-8" />
            </div>
            <p className="text-2xl font-bold text-indigo-600">{weatherData.rainfall}mm</p>
            <p className="text-sm text-gray-600">Rainfall</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
              <Globe className="w-8 h-8" />
            </div>
            <p className="text-2xl font-bold text-green-600">{weatherData.windSpeed}km/h</p>
            <p className="text-sm text-gray-600">Wind Speed</p>
          </div>
        </div>

        <div className="glass-notification success">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">AI Weather Recommendation</p>
              <p className="text-sm text-green-700">{weatherData.forecast}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Performance Comparison */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Regional Performance</h3>
            <p className="text-sm text-gray-600">Comparative analytics across Africa</p>
          </div>
        </div>

        <div className="grid gap-4">
          {regionalData.map((region, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{region.region}</h4>
                <Badge className="glass-badge info">{region.farmers.toLocaleString()} farmers</Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Avg Yield</p>
                  <p className="text-lg font-semibold text-emerald-600">{region.avgYield} tons/acre</p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-emerald-500 h-1 rounded-full" 
                      style={{ width: `${(region.avgYield / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Market Access</p>
                  <p className="text-lg font-semibold text-blue-600">{region.marketAccess}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full" 
                      style={{ width: `${region.marketAccess}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Digital Adoption</p>
                  <p className="text-lg font-semibold text-purple-600">{region.digitalAdoption}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-purple-500 h-1 rounded-full" 
                      style={{ width: `${region.digitalAdoption}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AfricaDataVisualizations;