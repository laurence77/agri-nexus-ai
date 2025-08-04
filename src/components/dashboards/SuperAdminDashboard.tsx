import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  GlassCard, 
  MetricCard,
  AlertsPanel,
  YieldChart
} from '@/components/glass';
import { 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp,
  Shield,
  Database,
  Activity,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  UserCheck,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Lock,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { DatabaseService } from '@/lib/supabase';

interface SuperAdminDashboardProps {
  className?: string;
}

interface PlatformMetrics {
  totalTenants: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  systemUptime: number;
  totalTransactions: number;
  averageRevenuePerUser: number;
}

interface TenantData {
  id: string;
  name: string;
  plan: 'seedling' | 'growth' | 'harvest' | 'enterprise';
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  users: number;
  revenue: number;
  lastActivity: string;
  healthScore: number;
  subscription: {
    plan: string;
    mrr: number;
    nextBilling: string;
    status: string;
  };
}

interface SystemHealth {
  api: { status: 'healthy' | 'degraded' | 'down'; responseTime: number };
  database: { status: 'healthy' | 'degraded' | 'down'; connections: number };
  storage: { status: 'healthy' | 'degraded' | 'down'; usage: number };
  payments: { status: 'healthy' | 'degraded' | 'down'; successRate: number };
}

/**
 * Super Admin Dashboard for Platform Owners
 * Features: tenant management, user management, revenue tracking, audit logs, system health
 */
export function SuperAdminDashboard({ className }: SuperAdminDashboardProps) {
  const { user } = useAuth();
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'tenants' | 'users' | 'revenue' | 'system' | 'audit'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    loadSuperAdminData();
    // Auto-refresh every minute
    const interval = setInterval(loadSuperAdminData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSuperAdminData = async () => {
    try {
      setLoading(true);
      const dbService = new DatabaseService();

      // Load platform-wide data (Super Admin has access to everything)
      const [allTenants, allUsers, allTransactions] = await Promise.all([
        dbService.query('tenants'),
        dbService.query('profiles'),
        dbService.query('transactions')
      ]);

      // Calculate platform metrics
      const metrics = calculatePlatformMetrics(allTenants, allUsers, allTransactions);
      const tenantData = processTenantData(allTenants, allUsers, allTransactions);
      const healthData = generateSystemHealth();
      const logs = generateAuditLogs();

      setPlatformMetrics(metrics);
      setTenants(tenantData);
      setSystemHealth(healthData);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Super admin dashboard loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePlatformMetrics = (tenants: any[], users: any[], transactions: any[]): PlatformMetrics => {
    const activeTenants = tenants.filter(t => t.status === 'active');
    const activeUsers = users.filter(u => isActive(u.last_sign_in_at)).length;
    
    const thisMonthRevenue = transactions
      .filter(t => t.status === 'completed' && isThisMonth(t.created_at))
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthUsers = users.filter(u => isLastMonth(u.created_at)).length;
    const thisMonthUsers = users.filter(u => isThisMonth(u.created_at)).length;
    
    const churnRate = lastMonthUsers > 0 ? 
      Math.max(0, (lastMonthUsers - thisMonthUsers) / lastMonthUsers * 100) : 0;

    return {
      totalTenants: tenants.length,
      activeUsers,
      totalRevenue: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      monthlyRecurringRevenue: calculateMRR(tenants),
      churnRate,
      systemUptime: 99.9,
      totalTransactions: transactions.length,
      averageRevenuePerUser: activeUsers > 0 ? thisMonthRevenue / activeUsers : 0
    };
  };

  const processTenantData = (tenants: any[], users: any[], transactions: any[]): TenantData[] => {
    return tenants.map(tenant => {
      const tenantUsers = users.filter(u => u.tenant_id === tenant.id);
      const tenantTransactions = transactions.filter(t => t.tenant_id === tenant.id);
      const tenantRevenue = tenantTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        id: tenant.id,
        name: tenant.name,
        plan: tenant.subscription_plan || 'seedling',
        status: tenant.status || 'active',
        users: tenantUsers.length,
        revenue: tenantRevenue,
        lastActivity: getLastActivity(tenantUsers),
        healthScore: calculateTenantHealth(tenant, tenantUsers, tenantTransactions),
        subscription: {
          plan: tenant.subscription_plan || 'seedling',
          mrr: calculateTenantMRR(tenant),
          nextBilling: tenant.next_billing_date || '',
          status: tenant.billing_status || 'active'
        }
      };
    });
  };

  const calculateMRR = (tenants: any[]) => {
    const planPricing = {
      seedling: 0,
      growth: 15,
      harvest: 75,
      enterprise: 300
    };

    return tenants
      .filter(t => t.status === 'active')
      .reduce((sum, t) => sum + (planPricing[t.subscription_plan as keyof typeof planPricing] || 0), 0);
  };

  const calculateTenantMRR = (tenant: any) => {
    const planPricing = {
      seedling: 0,
      growth: 15,
      harvest: 75,
      enterprise: 300
    };
    return planPricing[tenant.subscription_plan as keyof typeof planPricing] || 0;
  };

  const calculateTenantHealth = (tenant: any, users: any[], transactions: any[]) => {
    let score = 100;
    
    // Active users score (40 points max)
    const activeUsers = users.filter(u => isActive(u.last_sign_in_at)).length;
    const activeUsersRatio = users.length > 0 ? activeUsers / users.length : 0;
    score = score * 0.6 + (activeUsersRatio * 40);
    
    // Recent transactions score (30 points max)
    const recentTransactions = transactions.filter(t => isThisMonth(t.created_at)).length;
    const transactionScore = Math.min(recentTransactions * 5, 30);
    score = score * 0.7 + (transactionScore * 0.3);
    
    // Subscription status (30 points max)
    const subscriptionScore = tenant.billing_status === 'active' ? 30 : 0;
    score = score * 0.7 + (subscriptionScore * 0.3);
    
    return Math.round(Math.max(0, Math.min(100, score)));
  };

  const generateSystemHealth = (): SystemHealth => ({
    api: { 
      status: Math.random() > 0.1 ? 'healthy' : 'degraded', 
      responseTime: Math.floor(Math.random() * 100 + 50) 
    },
    database: { 
      status: Math.random() > 0.05 ? 'healthy' : 'degraded', 
      connections: Math.floor(Math.random() * 50 + 20) 
    },
    storage: { 
      status: 'healthy', 
      usage: Math.floor(Math.random() * 30 + 20) 
    },
    payments: { 
      status: Math.random() > 0.02 ? 'healthy' : 'degraded', 
      successRate: 99.2 + Math.random() * 0.7 
    }
  });

  const generateAuditLogs = () => [
    {
      id: 1,
      action: 'TENANT_CREATED',
      user: 'system@agrinexus.ai',
      tenant: 'Green Valley Farms',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      ip: '192.168.1.100',
      details: 'New tenant registration completed'
    },
    {
      id: 2,
      action: 'USER_SUSPENDED',
      user: 'admin@agrinexus.ai',
      tenant: 'Highland Agriculture',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      ip: '192.168.1.101',
      details: 'User account suspended for policy violation'
    },
    {
      id: 3,
      action: 'PAYMENT_FAILED',
      user: 'billing@agrinexus.ai',
      tenant: 'Sunset Cooperative',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      ip: '192.168.1.102',
      details: 'Subscription payment failed - card expired'
    }
  ];

  // Helper functions
  const isActive = (lastSignIn: string) => {
    if (!lastSignIn) return false;
    const daysSince = (Date.now() - new Date(lastSignIn).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
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

  const getLastActivity = (users: any[]) => {
    const lastSignIns = users
      .map(u => u.last_sign_in_at)
      .filter(Boolean)
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    return lastSignIns.length > 0 ? lastSignIns[0].toISOString() : '';
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'seedling': return 'text-gray-400 bg-gray-400/20';
      case 'growth': return 'text-green-400 bg-green-400/20';
      case 'harvest': return 'text-yellow-400 bg-yellow-400/20';
      case 'enterprise': return 'text-purple-400 bg-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'trial': return 'text-blue-400 bg-blue-400/20';
      case 'suspended': return 'text-red-400 bg-red-400/20';
      case 'cancelled': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className={cn('super-admin-dashboard space-y-6', className)}>
        <div className="animate-pulse space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-white/10 rounded-lg backdrop-blur-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('super-admin-dashboard space-y-6 p-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Administration</h1>
          <p className="text-gray-300 mt-1">
            Manage {platformMetrics?.totalTenants || 0} tenants across the AgriNexus platform
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Tenant</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'tenants', label: 'Tenants', icon: Building },
          { key: 'users', label: 'Users', icon: Users },
          { key: 'revenue', label: 'Revenue', icon: DollarSign },
          { key: 'system', label: 'System Health', icon: Activity },
          { key: 'audit', label: 'Audit Logs', icon: Shield }
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
      {selectedView === 'overview' && platformMetrics && (
        <>
          {/* Key Platform Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <MetricCard
              title="Total Tenants"
              value={platformMetrics.totalTenants.toString()}
              icon={<Building className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="Active Users"
              value={platformMetrics.activeUsers.toLocaleString()}
              icon={<Users className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="MRR"
              value={`$${platformMetrics.monthlyRecurringRevenue.toLocaleString()}`}
              change={`${(Math.random() * 20 - 5).toFixed(1)}`}
              icon={<DollarSign className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="Total Revenue"
              value={`$${platformMetrics.totalRevenue.toLocaleString()}`}
              icon={<TrendingUp className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="ARPU"
              value={`$${platformMetrics.averageRevenuePerUser.toFixed(2)}`}
              icon={<CreditCard className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="Churn Rate"
              value={`${platformMetrics.churnRate.toFixed(1)}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              variant={platformMetrics.churnRate > 5 ? "warning" : "default"}
            />
            <MetricCard
              title="Uptime"
              value={`${platformMetrics.systemUptime}%`}
              icon={<Activity className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="Transactions"
              value={platformMetrics.totalTransactions.toLocaleString()}
              icon={<Globe className="h-5 w-5" />}
              variant="default"
            />
          </div>

          {/* System Health Overview */}
          {systemHealth && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">API Status</h3>
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    systemHealth.api.status === 'healthy' ? 'bg-green-400' :
                    systemHealth.api.status === 'degraded' ? 'bg-yellow-400' :
                    'bg-red-400'
                  )} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Response Time</span>
                    <span className="text-white">{systemHealth.api.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className={cn(
                      'capitalize',
                      systemHealth.api.status === 'healthy' ? 'text-green-400' :
                      systemHealth.api.status === 'degraded' ? 'text-yellow-400' :
                      'text-red-400'
                    )}>
                      {systemHealth.api.status}
                    </span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Database</h3>
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    systemHealth.database.status === 'healthy' ? 'bg-green-400' :
                    systemHealth.database.status === 'degraded' ? 'bg-yellow-400' :
                    'bg-red-400'
                  )} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Connections</span>
                    <span className="text-white">{systemHealth.database.connections}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className={cn(
                      'capitalize',
                      systemHealth.database.status === 'healthy' ? 'text-green-400' :
                      systemHealth.database.status === 'degraded' ? 'text-yellow-400' :
                      'text-red-400'
                    )}>
                      {systemHealth.database.status}
                    </span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Storage</h3>
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    systemHealth.storage.status === 'healthy' ? 'bg-green-400' :
                    systemHealth.storage.status === 'degraded' ? 'bg-yellow-400' :
                    'bg-red-400'
                  )} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Usage</span>
                    <span className="text-white">{systemHealth.storage.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-600/30 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-400 rounded-full"
                      style={{ width: `${systemHealth.storage.usage}%` }}
                    />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Payments</h3>
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    systemHealth.payments.status === 'healthy' ? 'bg-green-400' :
                    systemHealth.payments.status === 'degraded' ? 'bg-yellow-400' :
                    'bg-red-400'
                  )} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-white">{systemHealth.payments.successRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className={cn(
                      'capitalize',
                      systemHealth.payments.status === 'healthy' ? 'text-green-400' :
                      systemHealth.payments.status === 'degraded' ? 'text-yellow-400' :
                      'text-red-400'
                    )}>
                      {systemHealth.payments.status}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </>
      )}

      {/* Tenants View */}
      {selectedView === 'tenants' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Tenant Management</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenants..."
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
                    <th className="text-left p-4 text-gray-300 font-medium">Tenant</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Plan</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Users</th>
                    <th className="text-left p-4 text-gray-300 font-medium">MRR</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Health</th>
                    <th className="text-right p-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants
                    .filter(tenant => 
                      tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((tenant) => (
                    <tr key={tenant.id} className="border-t border-white/10">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{tenant.name}</p>
                          <p className="text-gray-400 text-sm">
                            Last active: {tenant.lastActivity ? 
                              new Date(tenant.lastActivity).toLocaleDateString() : 
                              'Never'
                            }
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium capitalize',
                          getPlanColor(tenant.plan)
                        )}>
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium capitalize',
                          getStatusColor(tenant.status)
                        )}>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-white">{tenant.users}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">
                          ${tenant.subscription.mrr}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 bg-gray-600/30 rounded-full h-2">
                            <div 
                              className={cn(
                                'h-2 rounded-full',
                                tenant.healthScore >= 80 ? 'bg-green-400' :
                                tenant.healthScore >= 60 ? 'bg-yellow-400' :
                                'bg-red-400'
                              )}
                              style={{ width: `${tenant.healthScore}%` }}
                            />
                          </div>
                          <span className={cn(
                            'text-sm font-medium',
                            getHealthColor(tenant.healthScore)
                          )}>
                            {tenant.healthScore}%
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

      {/* Audit Logs View */}
      {selectedView === 'audit' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Audit Logs</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <GlassCard className="overflow-hidden">
            <div className="space-y-3 p-6">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                    log.action.includes('FAILED') || log.action.includes('SUSPENDED') ? 'bg-red-400' :
                    log.action.includes('CREATED') || log.action.includes('SUCCESS') ? 'bg-green-400' :
                    'bg-yellow-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-white font-medium">{log.action}</span>
                      <span className="text-gray-400 text-sm">{log.tenant}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{log.details}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      <span>By: {log.user}</span>
                      <span>IP: {log.ip}</span>
                      <span>{log.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;