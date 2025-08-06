import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  GlassCard, 
  CropMonitoringCard, 
  MetricCard,
  AlertsPanel,
  MarketTicker,
  WeatherWidget,
  YieldChart,
  YieldSummary
} from '@/components/glass';
import { 
  Sprout, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Users,
  Package,
  Bell,
  MessageSquare,
  ChevronRight,
  Activity,
  Droplets,
  Thermometer
} from 'lucide-react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { DatabaseService } from '@/lib/supabase';
import { ProvenanceTooltip } from '@/components/ui/provenance-tooltip';

interface CustomerDashboardProps {
  className?: string;
}

interface DashboardData {
  farms: any[];
  fields: any[];
  crops: any[];
  activities: any[];
  weather: any;
  marketPrices: any[];
  inventory: any[];
  revenue: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
  };
  alerts: any[];
  recentActivities: any[];
}

/**
 * Customer Dashboard for Farmers and Farm Owners
 * Features: crop yield tracking, field maps, input usage, revenue, support requests
 */
export function CustomerDashboard({ className }: CustomerDashboardProps) {
  const { user, userRole, tenantId } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'season' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [tenantId, selectedTimeframe]);

  const loadDashboardData = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const dbService = new DatabaseService();

      // Load all required data in parallel
      const [farms, fields, crops, activities, inventory] = await Promise.all([
        dbService.query('farms', { tenant_id: tenantId }),
        dbService.query('fields', { tenant_id: tenantId }),
        dbService.query('crops', { tenant_id: tenantId }),
        dbService.query('activities', { tenant_id: tenantId, limit: 10 }),
        dbService.query('inventory_items', { tenant_id: tenantId })
      ]);

      // Calculate revenue data
      const revenueData = calculateRevenue(activities);

      // Generate mock weather and market data
      const weatherData = generateMockWeather();
      const marketPrices = generateMockMarketPrices();
      const alerts = generateAlerts(fields, crops, inventory);

      setData({
        farms,
        fields,
        crops,
        activities,
        weather: weatherData,
        marketPrices,
        inventory,
        revenue: revenueData,
        alerts,
        recentActivities: activities.slice(0, 5)
      });
    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenue = (activities: any[]) => {
    // Calculate revenue from harvest and sales activities
    const thisMonth = activities
      .filter(a => a.activity_type === 'harvest' && isThisMonth(a.created_at))
      .reduce((sum, a) => sum + (a.metadata?.value || 0), 0);

    const lastMonth = activities
      .filter(a => a.activity_type === 'harvest' && isLastMonth(a.created_at))
      .reduce((sum, a) => sum + (a.metadata?.value || 0), 0);

    const thisYear = activities
      .filter(a => a.activity_type === 'harvest' && isThisYear(a.created_at))
      .reduce((sum, a) => sum + (a.metadata?.value || 0), 0);

    return { thisMonth, lastMonth, thisYear };
  };

  const generateMockWeather = () => ({
    current: {
      temperature: 28,
      humidity: 65,
      rainfall: 0,
      windSpeed: 12,
      conditions: 'Partly Cloudy'
    },
    forecast: [
      { day: 'Today', high: 30, low: 22, rainfall: 0, icon: 'partly-cloudy' },
      { day: 'Tomorrow', high: 32, low: 24, rainfall: 5, icon: 'light-rain' },
      { day: 'Wed', high: 29, low: 21, rainfall: 15, icon: 'rain' },
      { day: 'Thu', high: 27, low: 20, rainfall: 25, icon: 'heavy-rain' },
      { day: 'Fri', high: 31, low: 23, rainfall: 0, icon: 'sunny' }
    ]
  });

  const generateMockMarketPrices = () => [
    { crop: 'Maize', price: 45, unit: 'kg', change: 5.2, currency: 'KES' },
    { crop: 'Beans', price: 85, unit: 'kg', change: -2.1, currency: 'KES' },
    { crop: 'Tomatoes', price: 60, unit: 'kg', change: 12.5, currency: 'KES' },
    { crop: 'Onions', price: 35, unit: 'kg', change: -8.3, currency: 'KES' }
  ];

  const generateAlerts = (fields: any[], crops: any[], inventory: any[]) => [
    {
      id: 1,
      type: 'warning',
      title: 'Low Water Levels',
      message: 'Field A requires irrigation within 24 hours',
      priority: 'high',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'info',
      title: 'Fertilizer Stock Low',
      message: 'NPK fertilizer below 20kg threshold',
      priority: 'medium',
      timestamp: new Date()
    },
    {
      id: 3,
      type: 'success',
      title: 'Harvest Ready',
      message: 'Tomato field ready for harvest',
      priority: 'high',
      timestamp: new Date()
    }
  ];

  // Helper functions
  const isThisMonth = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const isLastMonth = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
  };

  const isThisYear = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear();
  };

  if (loading) {
    return (
      <div className={cn('customer-dashboard space-y-6', className)}>
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white/10 rounded-lg backdrop-blur-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <GlassCard className={cn('text-center py-12', className)}>
        <p className="text-gray-300">Unable to load dashboard data</p>
      </GlassCard>
    );
  }

  const yieldData = data.crops.map(crop => ({
    period: crop.planting_date ? new Date(crop.planting_date).toLocaleDateString() : 'Current',
    actual: crop.yield_actual || 0,
    expected: crop.yield_expected || 0,
    crop: crop.crop_type,
    unit: 'kg'
  }));

  return (
    <div className={cn('customer-dashboard space-y-6 p-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Farm Dashboard</h1>
          <p className="text-gray-300 mt-1">
            Welcome back, {user?.user_metadata?.full_name || 'Farmer'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            aria-label="Select timeframe"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="season">This Season</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Farms"
          value={data.farms.length.toString()}
          icon={<MapPin className="h-5 w-5" />}
          variant="agricultural"
        />
        <MetricCard
          title="Active Fields"
          value={data.fields.length.toString()}
          icon={<Sprout className="h-5 w-5" />}
          variant="agricultural"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`KES ${data.revenue.thisMonth.toLocaleString()}`}
          change={data.revenue.lastMonth > 0 ? 
            ((data.revenue.thisMonth - data.revenue.lastMonth) / data.revenue.lastMonth * 100).toFixed(1) : 
            '0'}
          icon={<DollarSign className="h-5 w-5" />}
          variant="default"
        />
        <MetricCard
          title="Active Crops"
          value={data.crops.length.toString()}
          icon={<Activity className="h-5 w-5" />}
          variant="crop"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Yield Performance Chart */}
          {yieldData.length > 0 && (
            <YieldChart
              data={yieldData}
              title="Crop Yield Performance"
              subtitle={`${selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)}ly overview`}
              timeframe={selectedTimeframe}
              showTrend={true}
              showComparison={true}
            />
          )}

          {/* Field Status Overview */}
          <GlassCard variant="agricultural" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Field Status</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.fields.slice(0, 4).map((field, index) => (
                <div key={field.id} className="bg-black/20 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{field.field_name}</h4>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      field.field_status === 'healthy' ? 'bg-green-400/20 text-green-400' :
                      field.field_status === 'warning' ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-red-400/20 text-red-400'
                    )}>
                      {field.field_status || 'Unknown'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{field.field_size || 0} acres</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crop:</span>
                      <span>{field.current_crop || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Activity:</span>
                      <span>{field.last_maintenance || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Activities */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
              <button className="text-sm text-green-400 hover:text-green-300">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {data.recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-black/20 rounded-lg">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    activity.activity_type === 'planting' ? 'bg-green-400' :
                    activity.activity_type === 'harvest' ? 'bg-yellow-400' :
                    activity.activity_type === 'irrigation' ? 'bg-blue-400' :
                    'bg-gray-400'
                  )} />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {activity.activity_type} - {activity.field_name || 'Field'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {activity.worker_name || 'System'}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <WeatherWidget 
            location="Current Location"
            showForecast={true}
            showAlerts={true}
          />

          {/* Alerts Panel */}
          <AlertsPanel 
            alerts={data.alerts}
            title="Farm Alerts"
            showDismiss={true}
          />

          {/* Market Prices */}
          <MarketTicker 
            prices={data.marketPrices}
            title="Today's Market Prices"
            autoScroll={true}
          />

          {/* Quick Actions */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-white transition-colors">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5" />
                  <span>Schedule Activity</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-white transition-colors">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5" />
                  <span>Order Inputs</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-white transition-colors">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5" />
                  <span>Request Support</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </GlassCard>

          {/* Inventory Status */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Inventory Status</h3>
            <div className="space-y-3">
              {data.inventory.slice(0, 3).map((item, index) => (
  <div key={item.id} className="flex justify-between items-center">
    <div>
      <p className="text-white text-sm font-medium">
        <ProvenanceTooltip tableName="inventory_items" recordId={item.id} fieldName="item_name">
          {item.item_name}
        </ProvenanceTooltip>
      </p>
      <p className="text-gray-400 text-xs">
        <ProvenanceTooltip tableName="inventory_items" recordId={item.id} fieldName="category">
          {item.category}
        </ProvenanceTooltip>
      </p>
    </div>
    <div className="text-right">
      <p className="text-white text-sm">
        <ProvenanceTooltip tableName="inventory_items" recordId={item.id} fieldName="current_stock">
          {item.current_stock}
        </ProvenanceTooltip>{' '}
        <ProvenanceTooltip tableName="inventory_items" recordId={item.id} fieldName="unit">
          {item.unit}
        </ProvenanceTooltip>
      </p>
      <div className={cn(
        'text-xs',
        item.current_stock < item.minimum_stock ? 'text-red-400' :
        item.current_stock < item.minimum_stock * 2 ? 'text-yellow-400' :
        'text-green-400'
      )}>
        <ProvenanceTooltip tableName="inventory_items" recordId={item.id} fieldName="minimum_stock">
          {item.current_stock < item.minimum_stock ? 'Low Stock' :
           item.current_stock < item.minimum_stock * 2 ? 'Getting Low' :
           'In Stock'}
        </ProvenanceTooltip>
      </div>
    </div>
  </div>
))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;