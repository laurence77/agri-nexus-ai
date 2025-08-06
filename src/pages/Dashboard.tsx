import { useState } from 'react';
import { SensorDashboard } from "@/components/sensors/sensor-dashboard";
import AIInsightsDashboard from "@/components/ai/AIInsightsDashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import NotificationWidget from "@/components/notifications/notification-widget";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from 'react-router-dom';
import { ProvenanceViewer } from '@/components/ui/provenance-viewer';
import {
  MapPin,
  Droplets,
  TrendingUp,
  AlertTriangle,
  Sprout,
  Tractor,
  Activity,
  DollarSign,
  Brain,
  Users,
  Globe,
  Zap,
  Bell,
  Settings,
  Search,
  Plus
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { getCounts } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCounts = getCounts();

  const metrics = [
    {
      title: "Active Fields",
      value: "12",
      change: "+2 this month",
      icon: <MapPin className="h-4 w-4" />,
      trend: "up" as const
    },
    {
      title: "Water Usage",
      value: "2,847 gal",
      change: "-12% from last week",
      icon: <Droplets className="h-4 w-4" />,
      trend: "down" as const
    },
    {
      title: "Crop Health",
      value: "94%",
      change: "+3% improvement",
      icon: <Sprout className="h-4 w-4" />,
      trend: "up" as const
    },
    {
      title: "Equipment Status",
      value: "8/9",
      change: "1 needs maintenance",
      icon: <Tractor className="h-4 w-4" />,
      trend: "neutral" as const
    }
  ];

  const recentAlerts = [
    { type: "warning", message: "Field 7: Soil moisture below optimal", time: "2 hours ago" },
    { type: "success", message: "Irrigation system activated for Field 3", time: "4 hours ago" },
    { type: "info", message: "Weather forecast: Rain expected tomorrow", time: "6 hours ago" }
  ];

  const cooperativeStats = [
    { label: "Members", value: "247", trend: "+12" },
    { label: "Shared Equipment", value: "15", trend: "Available" },
    { label: "Group Revenue", value: "$847K", trend: "+18%" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-green-400/10 rounded-full blur-3xl animate-float animate-delay-2s" />
      </div>

      {/* Glass Navigation */}
      <nav className="glass-sidebar">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AgriNexus AI</h1>
              <p className="text-xs text-gray-600">Smart Farming Platform</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          <a href="/dashboard" className="glass-nav-item active">
            <Activity className="icon" />
            <span>Dashboard</span>
          </a>
          <a href="/fields" className="glass-nav-item">
            <MapPin className="icon" />
            <span>Fields</span>
          </a>
          <a href="/weather" className="glass-nav-item">
            <Globe className="icon" />
            <span>Weather AI</span>
          </a>
          <a href="/sensors" className="glass-nav-item">
            <Zap className="icon" />
            <span>Sensors</span>
          </a>
          <a href="/equipment" className="glass-nav-item">
            <Tractor className="icon" />
            <span>Equipment</span>
          </a>
          <a href="/analytics" className="glass-nav-item">
            <TrendingUp className="icon" />
            <span>Analytics</span>
          </a>
          
          <div className="border-t border-white/10 my-4"></div>
          
          <a href="/africa" className="glass-nav-item">
            <Globe className="icon" />
            <span>Africa Features</span>
          </a>
          <a href="/cooperative" className="glass-nav-item">
            <Users className="icon" />
            <span>Cooperative</span>
          </a>
          <a href="/marketplace" className="glass-nav-item">
            <DollarSign className="icon" />
            <span>Marketplace</span>
          </a>
        </nav>

        <div className="mt-auto pt-4">
          <div className="glass-card !margin-0 !padding-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">AI Status</p>
                <p className="text-xs text-green-600">All systems active</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="ml-80 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Good morning, John! 🌱
            </h1>
            <p className="text-gray-600">
              Your farm is performing well today. Here's your intelligent overview.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="glass-input !padding-3 !margin-0 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search fields, crops..."
                className="pl-10 bg-transparent border-0 outline-0 w-full"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="glass-button !padding-3"
                type="button"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationCounts.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{notificationCounts.unread}</span>
                  </div>
                )}
              </button>
            </div>
            <button 
              onClick={() => window.location.href = '/settings'}
              className="glass-button !padding-3"
              type="button"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Grid with Glass Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="glass-card group hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                  {metric.icon}
                </div>
                <Badge className={`glass-badge ${metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'warning' : 'info'}`}>
                  {metric.change}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{metric.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Cooperative Stats */}
        <div className="glass-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Kibera Farmers Cooperative</h2>
                <p className="text-sm text-gray-600">Group performance overview</p>
              </div>
            </div>
            <button className="glass-button">
              <Plus className="w-4 h-4 mr-2" />
              Manage Group
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {cooperativeStats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="glass-card !padding-2 !margin-0">
            <TabsList className="w-full bg-transparent">
              <TabsTrigger value="overview" className="glass-button data-[state=active]:bg-white/20">
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="ai-insights" className="glass-button data-[state=active]:bg-white/20">
                <Brain className="w-4 h-4 mr-2" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="sensors" className="glass-button data-[state=active]:bg-white/20">
                <Zap className="w-4 h-4 mr-2" />
                Live Sensors
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions and Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weather Widget */}
              <div className="glass-weather-widget">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Weather Intelligence</h3>
                      <p className="text-sm text-gray-600">7-day AI forecast for Nairobi</p>
                    </div>
                  </div>
                  <Badge className="glass-badge info">Live</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">24°C</p>
                    <p className="text-sm text-gray-600">Current</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">85%</p>
                    <p className="text-sm text-gray-600">Humidity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">12km/h</p>
                    <p className="text-sm text-gray-600">Wind</p>
                  </div>
                </div>
                
                <div className="glass-notification info">
                  <p className="text-sm font-medium">AI Recommendation</p>
                  <p className="text-sm text-gray-600">Optimal planting conditions expected tomorrow. Consider seeding Field 3.</p>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="glass-card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Smart Alerts</h3>
                    <p className="text-sm text-gray-600">AI-powered notifications</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {recentAlerts.map((alert, index) => (
                    <div key={index} className={`glass-notification ${alert.type}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                        </div>
                        <button className="glass-button !padding-1 text-xs">
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Farm Performance Overview */}
            <div className="glass-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Farm Performance</h3>
                  <p className="text-sm text-gray-600">This season's key metrics</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">$24,500</div>
                  <p className="text-sm text-gray-600">Revenue This Month</p>
                  <Badge className="glass-badge success mt-2">+15% vs last month</Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">850 acres</div>
                  <p className="text-sm text-gray-600">Total Cultivated</p>
                  <Badge className="glass-badge info mt-2">92% efficiency</Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">3.2 tons</div>
                  <p className="text-sm text-gray-600">Expected Yield</p>
                  <Badge className="glass-badge success mt-2">+8% vs forecast</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights">
            <AIInsightsDashboard />
          </TabsContent>

          <TabsContent value="sensors">
            <div className="glass-card">
              <SensorDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Notification Widget */}
      <NotificationWidget
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onOpenCenter={() => navigate('/notifications')}
      />

      {/* Data Provenance Section */}
      <div className="max-w-3xl mx-auto mt-12">
        <ProvenanceViewer
          tableName="user_settings"
          recordId={typeof window !== 'undefined' ? (localStorage.getItem('user_email') || 'demo-user') : 'demo-user'}
          showValue={true}
        />
      </div>
    </div>
  );
}