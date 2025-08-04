import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  GlassCard, 
  MetricCard,
  AlertsPanel,
  YieldChart,
  WeatherWidget
} from '@/components/glass';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Package,
  Truck,
  DollarSign,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  UserPlus,
  Edit,
  Eye,
  MoreHorizontal,
  Sprout,
  Droplets,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { DatabaseService } from '@/lib/supabase';

interface AdminDashboardProps {
  className?: string;
}

interface AdminDashboardData {
  overview: {
    totalFarms: number;
    totalFields: number;
    totalWorkers: number;
    activeWorkers: number;
    totalRevenue: number;
    monthlyGrowth: number;
  };
  fieldHealth: {
    healthy: number;
    warning: number;
    critical: number;
    total: number;
  };
  workerAttendance: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
  inventory: {
    lowStock: any[];
    criticalStock: any[];
    totalItems: number;
  };
  recentActivities: any[];
  alerts: any[];
  farms: any[];
  workers: any[];
  deliveries: any[];
  weather: any;
}

/**
 * Admin Dashboard for Farm Managers and Cooperative Heads
 * Features: field health overview, worker attendance, inventory alerts, sales/deliveries, worker management
 */
export function AdminDashboard({ className }: AdminDashboardProps) {
  const { user, userRole, tenantId } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'fields' | 'workers' | 'inventory' | 'deliveries'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddWorker, setShowAddWorker] = useState(false);

  useEffect(() => {
    loadAdminData();
    // Auto-refresh every 2 minutes
    const interval = setInterval(loadAdminData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tenantId]);

  const loadAdminData = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const dbService = new DatabaseService();

      // Load all required data
      const [farms, fields, workers, activities, inventory, orders] = await Promise.all([
        dbService.query('farms', { tenant_id: tenantId }),
        dbService.query('fields', { tenant_id: tenantId }),
        dbService.query('profiles', { tenant_id: tenantId, role: 'field_worker' }),
        dbService.query('activities', { tenant_id: tenantId, limit: 20 }),
        dbService.query('inventory_items', { tenant_id: tenantId }),
        dbService.query('orders', { tenant_id: tenantId, limit: 10 })
      ]);

      // Calculate overview metrics
      const overview = {
        totalFarms: farms.length,
        totalFields: fields.length,
        totalWorkers: workers.length,
        activeWorkers: workers.filter(w => w.work_status === 'active').length,
        totalRevenue: calculateTotalRevenue(orders),
        monthlyGrowth: calculateMonthlyGrowth(orders)
      };

      // Field health analysis
      const fieldHealth = {
        healthy: fields.filter(f => f.field_status === 'healthy').length,
        warning: fields.filter(f => f.field_status === 'warning').length,
        critical: fields.filter(f => f.field_status === 'critical').length,
        total: fields.length
      };

      // Worker attendance (today)
      const todayWorkers = workers.filter(w => isToday(w.last_clock_in));
      const workerAttendance = {
        present: todayWorkers.filter(w => w.work_status === 'active').length,
        absent: workers.length - todayWorkers.length,
        late: todayWorkers.filter(w => isLate(w.last_clock_in)).length,
        total: workers.length
      };

      // Inventory analysis
      const lowStock = inventory.filter(item => 
        item.current_stock <= item.minimum_stock && item.current_stock > 0
      );
      const criticalStock = inventory.filter(item => item.current_stock === 0);

      const inventoryData = {
        lowStock,
        criticalStock,
        totalItems: inventory.length
      };

      // Generate alerts
      const alerts = generateAdminAlerts(fieldHealth, inventoryData, workerAttendance);

      // Mock weather and deliveries
      const weather = generateMockWeather();
      const deliveries = generateMockDeliveries();

      setData({
        overview,
        fieldHealth,
        workerAttendance,
        inventory: inventoryData,
        recentActivities: activities,
        alerts,
        farms,
        workers,
        deliveries,
        weather
      });
    } catch (error) {
      console.error('Admin dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRevenue = (orders: any[]) => {
    return orders
      .filter(order => order.status === 'completed' && isThisMonth(order.created_at))
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);
  };

  const calculateMonthlyGrowth = (orders: any[]) => {
    const thisMonth = orders.filter(o => isThisMonth(o.created_at)).length;
    const lastMonth = orders.filter(o => isLastMonth(o.created_at)).length;
    return lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
  };

  const generateAdminAlerts = (fieldHealth: any, inventory: any, attendance: any) => [
    ...(fieldHealth.critical > 0 ? [{
      id: 1,
      type: 'danger',
      title: 'Critical Field Issues',
      message: `${fieldHealth.critical} fields require immediate attention`,
      priority: 'high',
      timestamp: new Date()
    }] : []),
    ...(inventory.criticalStock.length > 0 ? [{
      id: 2,
      type: 'warning',
      title: 'Out of Stock Items',
      message: `${inventory.criticalStock.length} items are completely out of stock`,
      priority: 'high',
      timestamp: new Date()
    }] : []),
    ...(attendance.absent > attendance.total * 0.3 ? [{
      id: 3,
      type: 'warning',
      title: 'High Absenteeism',
      message: `${attendance.absent} workers absent today (${((attendance.absent/attendance.total)*100).toFixed(0)}%)`,
      priority: 'medium',
      timestamp: new Date()
    }] : [])
  ];

  const generateMockWeather = () => ({
    temperature: 28,
    humidity: 65,
    conditions: 'Partly Cloudy',
    forecast: [
      { day: 'Today', high: 30, low: 22, rainfall: 0 },
      { day: 'Tomorrow', high: 32, low: 24, rainfall: 5 },
      { day: 'Wed', high: 29, low: 21, rainfall: 15 }
    ]
  });

  const generateMockDeliveries = () => [
    {
      id: 1,
      product: 'Maize',
      quantity: '500 kg',
      destination: 'Nairobi Market',
      driver: 'John Mwangi',
      status: 'in_transit',
      eta: '2 hours'
    },
    {
      id: 2,
      product: 'Tomatoes',
      quantity: '200 kg',
      destination: 'Local Cooperative',
      driver: 'Mary Wanjiku',
      status: 'delivered',
      completedAt: '1 hour ago'
    }
  ];

  // Helper functions
  const isToday = (date: string) => {
    if (!date) return false;
    return new Date(date).toDateString() === new Date().toDateString();
  };

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

  const isLate = (clockInTime: string) => {
    if (!clockInTime) return false;
    const clockIn = new Date(clockInTime);
    const nineAM = new Date();
    nineAM.setHours(9, 0, 0, 0);
    return clockIn > nineAM;
  };

  const handleAddWorker = async (workerData: any) => {
    try {
      const dbService = new DatabaseService();
      await dbService.insert('profiles', {
        ...workerData,
        tenant_id: tenantId,
        role: 'field_worker'
      });
      setShowAddWorker(false);
      loadAdminData();
    } catch (error) {
      console.error('Add worker error:', error);
    }
  };

  if (loading) {
    return (
      <div className={cn('admin-dashboard space-y-6', className)}>
        <div className="animate-pulse space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-white/10 rounded-lg backdrop-blur-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <GlassCard className={cn('text-center py-12', className)}>
        <p className="text-gray-300">Unable to load admin dashboard data</p>
      </GlassCard>
    );
  }

  return (
    <div className={cn('admin-dashboard space-y-6 p-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Farm Management</h1>
          <p className="text-gray-300 mt-1">
            Monitor operations across {data.overview.totalFarms} farms
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAddWorker(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Worker</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Overview', icon: Activity },
          { key: 'fields', label: 'Fields', icon: Sprout },
          { key: 'workers', label: 'Workers', icon: Users },
          { key: 'inventory', label: 'Inventory', icon: Package },
          { key: 'deliveries', label: 'Deliveries', icon: Truck }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedView(key as any)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedView === key 
                ? 'bg-white/10 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MetricCard
              title="Total Farms"
              value={data.overview.totalFarms.toString()}
              icon={<MapPin className="h-5 w-5" />}
              variant="agricultural"
            />
            <MetricCard
              title="Active Fields"
              value={data.overview.totalFields.toString()}
              icon={<Sprout className="h-5 w-5" />}
              variant="crop"
            />
            <MetricCard
              title="Total Workers"
              value={data.overview.totalWorkers.toString()}
              icon={<Users className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="Present Today"
              value={data.workerAttendance.present.toString()}
              subtitle={`${((data.workerAttendance.present/data.workerAttendance.total)*100).toFixed(0)}%`}
              icon={<CheckCircle2 className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="Revenue (Month)"
              value={`KES ${data.overview.totalRevenue.toLocaleString()}`}
              change={data.overview.monthlyGrowth.toFixed(1)}
              icon={<DollarSign className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="Critical Alerts"
              value={data.alerts.filter(a => a.priority === 'high').length.toString()}
              icon={<AlertTriangle className="h-5 w-5" />}
              variant="warning"
            />
          </div>

          {/* Field Health Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard variant="agricultural" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Field Health Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Healthy</span>
                  </div>
                  <span className="text-white font-medium">{data.fieldHealth.healthy}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-300">Warning</span>
                  </div>
                  <span className="text-white font-medium">{data.fieldHealth.warning}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-gray-300">Critical</span>
                  </div>
                  <span className="text-white font-medium">{data.fieldHealth.critical}</span>
                </div>
                
                <div className="pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Health Score</span>
                    <span className="text-white font-medium">
                      {((data.fieldHealth.healthy / data.fieldHealth.total) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-600/30 rounded-full">
                    <div 
                      className="h-2 bg-green-400 rounded-full transition-all duration-1000"
                      style={{ width: `${(data.fieldHealth.healthy / data.fieldHealth.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Worker Attendance</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {data.workerAttendance.present}/{data.workerAttendance.total}
                  </div>
                  <div className="text-gray-400 text-sm">Present Today</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Present</span>
                    <span className="text-green-400">{data.workerAttendance.present}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Absent</span>
                    <span className="text-red-400">{data.workerAttendance.absent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Late</span>
                    <span className="text-yellow-400">{data.workerAttendance.late}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 bg-green-500/20 rounded">
                    <div className="text-green-400 text-lg font-bold">{data.workerAttendance.present}</div>
                    <div className="text-xs text-green-400">Present</div>
                  </div>
                  <div className="text-center p-2 bg-red-500/20 rounded">
                    <div className="text-red-400 text-lg font-bold">{data.workerAttendance.absent}</div>
                    <div className="text-xs text-red-400">Absent</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-500/20 rounded">
                    <div className="text-yellow-400 text-lg font-bold">{data.workerAttendance.late}</div>
                    <div className="text-xs text-yellow-400">Late</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Inventory Alerts</h3>
              <div className="space-y-4">
                {data.inventory.criticalStock.length > 0 && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-red-400" />
                      <span className="text-red-400 font-medium">Out of Stock</span>
                    </div>
                    <p className="text-red-300 text-sm mt-1">
                      {data.inventory.criticalStock.length} items need immediate restocking
                    </p>
                  </div>
                )}
                
                {data.inventory.lowStock.length > 0 && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Low Stock</span>
                    </div>
                    <p className="text-yellow-300 text-sm mt-1">
                      {data.inventory.lowStock.length} items below minimum threshold
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Items</span>
                    <span className="text-white">{data.inventory.totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Well Stocked</span>
                    <span className="text-green-400">
                      {data.inventory.totalItems - data.inventory.lowStock.length - data.inventory.criticalStock.length}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Weather and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeatherWidget
              location="Farm Locations"
              showForecast={true}
              showAlerts={true}
            />
            
            <AlertsPanel
              alerts={data.alerts}
              title="System Alerts"
              showDismiss={true}
            />
          </div>
        </>
      )}

      {/* Workers View */}
      {selectedView === 'workers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Worker Management</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-medium">Worker</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Today</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Performance</th>
                    <th className="text-right p-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.workers
                    .filter(worker => 
                      worker.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      worker.role.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((worker) => (
                    <tr key={worker.id} className="border-t border-white/10">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {worker.full_name?.charAt(0) || 'W'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{worker.full_name}</p>
                            <p className="text-gray-400 text-sm">{worker.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300 capitalize">
                          {worker.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          worker.work_status === 'active' ? 'bg-green-400/20 text-green-400' :
                          worker.work_status === 'inactive' ? 'bg-gray-400/20 text-gray-400' :
                          'bg-yellow-400/20 text-yellow-400'
                        )}>
                          {worker.work_status || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {isToday(worker.last_clock_in) ? (
                            <>
                              <Clock className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 text-sm">Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-400" />
                              <span className="text-red-400 text-sm">Absent</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 bg-gray-600/30 rounded-full h-2">
                            <div 
                              className="h-2 bg-green-400 rounded-full"
                              style={{ width: `${Math.random() * 100}%` }}
                            />
                          </div>
                          <span className="text-gray-300 text-sm">
                            {Math.floor(Math.random() * 40 + 60)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Add more views (fields, inventory, deliveries) as needed */}
    </div>
  );
}

export default AdminDashboard;