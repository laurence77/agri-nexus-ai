import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminRoute } from '@/components/auth/protected-route';
import { UserManagement } from '@/components/admin/user-management';
import Navigation from '@/components/layout/Navigation';
import { ProvenanceViewer } from '@/components/ui/provenance-viewer';
import {
  Users,
  Shield,
  Activity,
  Settings,
  Database,
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  TrendingUp,
  Server,
  Cpu,
  LogOut
} from 'lucide-react';

function AdminDashboardContent() {
  const { user, logout, checkPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const systemStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalFarms: 456,
    activeSessions: 23,
    serverUptime: '99.8%',
    dataStorage: '2.4 TB',
    cpuUsage: '45%',
    memoryUsage: '67%'
  };

  const recentActivity = [
    { id: 1, action: 'User login', user: 'john@farm.com', timestamp: '2 minutes ago', type: 'info' },
    { id: 2, action: 'Farm data updated', user: 'sarah@agri.com', timestamp: '5 minutes ago', type: 'success' },
    { id: 3, action: 'Failed login attempt', user: 'unknown@domain.com', timestamp: '8 minutes ago', type: 'warning' },
    { id: 4, action: 'System backup completed', user: 'system', timestamp: '1 hour ago', type: 'success' },
    { id: 5, action: 'API rate limit exceeded', user: 'app@mobile.com', timestamp: '2 hours ago', type: 'error' },
  ];

  const permissions = [
    { name: 'User Management', permission: 'users.write', icon: Users },
    { name: 'System Configuration', permission: 'system.config', icon: Settings },
    { name: 'Audit Logs', permission: 'audit.read', icon: Eye },
    { name: 'Database Access', permission: 'system.write', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              System administration and monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <Badge variant="secondary" className="text-xs">
                {user?.role}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemStats.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemStats.activeUsers.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemStats.totalFarms.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Total Farms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center">
                <Server className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemStats.serverUptime}
                  </p>
                  <p className="text-sm text-gray-500">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users" disabled={!checkPermission('users.read')}>
              Users
            </TabsTrigger>
            <TabsTrigger value="system" disabled={!checkPermission('system.read')}>
              System
            </TabsTrigger>
            <TabsTrigger value="security" disabled={!checkPermission('audit.read')}>
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CPU Usage</span>
                    <Badge variant="secondary">{systemStats.cpuUsage}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Usage</span>
                    <Badge variant="secondary">{systemStats.memoryUsage}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Used</span>
                    <Badge variant="secondary">{systemStats.dataStorage}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Sessions</span>
                    <Badge variant="secondary">{systemStats.activeSessions}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                          {activity.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {activity.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                          {activity.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          {activity.type === 'info' && <Activity className="h-4 w-4 text-blue-600" />}
                          <div>
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.user}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permissions Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Your Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {permissions.map((perm) => {
                    const Icon = perm.icon;
                    const hasPermission = checkPermission(perm.permission);
                    
                    return (
                      <div
                        key={perm.permission}
                        className={`p-4 rounded-lg border-2 ${
                          hasPermission 
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${hasPermission ? 'text-green-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="text-sm font-medium">{perm.name}</p>
                            <Badge 
                              variant={hasPermission ? "default" : "secondary"}
                              className="text-xs mt-1"
                            >
                              {hasPermission ? 'Granted' : 'Denied'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  System configuration and maintenance tools will be available here.
                  This includes database management, backup settings, and performance tuning.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security & Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Security monitoring and audit logs will be displayed here.
                  This includes login attempts, permission changes, and system access logs.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      {/* Data Provenance Section */}
      <div className="max-w-3xl mx-auto mt-12">
        <ProvenanceViewer
          tableName="admin_exports"
          recordId={typeof window !== 'undefined' ? (localStorage.getItem('user_email') || 'demo-user') : 'demo-user'}
          showValue={true}
        />
      </div>
    </div>
  </div>
  );
}

function AdminDashboard() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}

export default AdminDashboard;