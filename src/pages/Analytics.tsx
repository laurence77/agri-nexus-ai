import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import YieldTrendChart from "@/components/charts/YieldTrendChart";
import SensorDataChart from "@/components/charts/SensorDataChart";
import FinancialChart from "@/components/charts/FinancialChart";
import AfricaDataVisualizations from "@/components/africa/AfricaDataVisualizations";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  Globe,
  Brain,
  Zap,
  Target,
  Download,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function Analytics() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const analyticsMetrics = [
    { 
      title: "Yield Performance", 
      value: "+24.5%", 
      description: "Above target this season",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-emerald-500 to-green-600",
      trend: "up"
    },
    { 
      title: "Revenue Growth", 
      value: "KSh 847K", 
      description: "Total this quarter",
      icon: <DollarSign className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
      trend: "up"
    },
    { 
      title: "Sensor Accuracy", 
      value: "98.7%", 
      description: "Real-time monitoring",
      icon: <Zap className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
      trend: "stable"
    },
    { 
      title: "Cost Efficiency", 
      value: "-15.2%", 
      description: "Reduced operational costs",
      icon: <Target className="w-5 h-5" />,
      color: "from-orange-500 to-orange-600",
      trend: "down"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl animate-float animate-delay-2s" />
      </div>

      {/* Header Navigation */}
      <nav className="glass-card fixed top-4 left-4 right-4 z-50 !margin-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/dashboard')}
              className="glass-button !padding-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-xs text-gray-600">Comprehensive data insights & AI predictions</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="glass-input !padding-2 text-sm border-0"
              aria-label="Select time frame for analytics data"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="glass-button !padding-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button className="glass-button !padding-2">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 px-4 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="glass-card">
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                  Intelligent Analytics Hub
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive data visualization, AI-powered insights, and predictive analytics 
                for optimized agricultural decision-making and performance monitoring.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Badge className="glass-badge success">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Data Streaming
                </Badge>
                <Badge className="glass-badge info">
                  <Brain className="w-3 h-3 mr-1" />
                  AI-Powered Insights
                </Badge>
                <Badge className="glass-badge warning">
                  <Target className="w-3 h-3 mr-1" />
                  Predictive Analytics
                </Badge>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsMetrics.map((metric, index) => (
              <div key={index} className="glass-card group hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center text-white`}>
                    {metric.icon}
                  </div>
                  <Badge className={`glass-badge ${metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'warning' : 'info'}`}>
                    {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            ))}
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="yield" className="space-y-6">
            <div className="glass-card !padding-3 !margin-0">
              <TabsList className="w-full bg-transparent grid grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="yield" className="glass-button data-[state=active]:bg-white/20">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Yield Analytics
                </TabsTrigger>
                <TabsTrigger value="sensors" className="glass-button data-[state=active]:bg-white/20">
                  <Zap className="w-4 h-4 mr-2" />
                  Sensor Data
                </TabsTrigger>
                <TabsTrigger value="financial" className="glass-button data-[state=active]:bg-white/20">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Financial
                </TabsTrigger>
                <TabsTrigger value="africa" className="glass-button data-[state=active]:bg-white/20">
                  <Globe className="w-4 h-4 mr-2" />
                  Africa Insights
                </TabsTrigger>
                <TabsTrigger value="ai-predictions" className="glass-button data-[state=active]:bg-white/20">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Predictions
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Yield Analytics */}
            <TabsContent value="yield" className="space-y-6">
              <YieldTrendChart timeframe="1year" cropType="maize" />
            </TabsContent>

            {/* Sensor Data Analytics */}
            <TabsContent value="sensors" className="space-y-6">
              <SensorDataChart fieldId="field-1" timeRange="24h" />
            </TabsContent>

            {/* Financial Analytics */}
            <TabsContent value="financial" className="space-y-6">
              <FinancialChart timeframe="quarterly" currency="KSH" />
            </TabsContent>

            {/* Africa-Specific Analytics */}
            <TabsContent value="africa" className="space-y-6">
              <AfricaDataVisualizations />
            </TabsContent>

            {/* AI Predictions */}
            <TabsContent value="ai-predictions" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Yield Predictions */}
                <div className="glass-card">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">AI Yield Predictions</h3>
                      <p className="text-sm text-gray-600">Next season forecasts</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { crop: 'Maize', predicted: 4.2, confidence: 94, trend: '+18%' },
                      { crop: 'Beans', predicted: 2.8, confidence: 89, trend: '+12%' },
                      { crop: 'Tomatoes', predicted: 6.1, confidence: 91, trend: '+25%' }
                    ].map((prediction, index) => (
                      <div key={index} className="p-4 bg-white/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{prediction.crop}</h4>
                          <Badge className="glass-badge success">{prediction.confidence}% confidence</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-emerald-600">{prediction.predicted} tons/acre</span>
                          <span className="text-sm font-medium text-green-600">{prediction.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Predictions */}
                <div className="glass-card">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Market Price Predictions</h3>
                      <p className="text-sm text-gray-600">30-day forecast</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { commodity: 'Maize', currentPrice: 35, predictedPrice: 42, change: '+20%' },
                      { commodity: 'Beans', currentPrice: 80, predictedPrice: 75, change: '-6%' },
                      { commodity: 'Tomatoes', currentPrice: 25, predictedPrice: 32, change: '+28%' }
                    ].map((market, index) => (
                      <div key={index} className="p-4 bg-white/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{market.commodity}</h4>
                          <span className={`text-sm font-medium ${market.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {market.change}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-600">Current: KSh {market.currentPrice}/kg</span>
                          </div>
                          <div>
                            <span className="text-lg font-bold text-blue-600">KSh {market.predictedPrice}/kg</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="glass-card">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h3>
                    <p className="text-sm text-gray-600">Optimized actions for maximum ROI</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass-notification success">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Optimal Planting Window</p>
                        <p className="text-sm text-green-700">
                          Plant tomatoes in next 5 days for 25% yield increase based on weather patterns
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-notification info">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Market Opportunity</p>
                        <p className="text-sm text-blue-700">
                          Maize prices expected to rise 20% - consider holding current harvest
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-notification warning">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">Resource Optimization</p>
                        <p className="text-sm text-orange-700">
                          Reduce irrigation by 15% in Field 2 based on soil moisture predictions
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-notification info">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">Equipment Maintenance</p>
                        <p className="text-sm text-purple-700">
                          Schedule tractor maintenance in 2 weeks to prevent predicted breakdown
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}