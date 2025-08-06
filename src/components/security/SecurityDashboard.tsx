import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Eye,
  Activity,
  Lock,
  Unlock,
  Key,
  Download,
  Upload,
  Search,
  Filter,
  Settings,
  Bell,
  UserCheck,
  UserX,
  Database,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  MapPin,
  Smartphone,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  ExternalLink,
  X,
  Info,
  Warning,
  Zap,
  Calendar
} from 'lucide-react';
import { SecurityService } from '@/lib/security';
import { UserActivityLog, SecurityIncident, SecurityMetrics, SessionManagement } from '@/types/security';

interface SecurityDashboardProps {
  tenantId: string;
  userRole: string;
}

export function SecurityDashboard({ tenantId, userRole }: SecurityDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [recentActivities, setRecentActivities] = useState<UserActivityLog[]>([]);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [activeSessions, setActiveSessions] = useState<SessionManagement[]>([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('24h');

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [tenantId, timeFilter]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Load security metrics for today
      const today = new Date().toISOString().split('T')[0];
      // These would be actual API calls in production
      const mockMetrics: SecurityMetrics = {
        tenant_id: tenantId,
        date: today,
        total_login_attempts: 156,
        failed_login_attempts: 12,
        successful_logins: 144,
        suspicious_activities_detected: 3,
        incidents_reported: 1,
        incidents_resolved: 0,
        data_exports_requested: 2,
        permissions_granted: 5,
        permissions_revoked: 1,
        active_sessions: 23,
        security_score: 85,
        compliance_percentage: 92.5,
        created_at: new Date().toISOString()
      };
      setSecurityMetrics(mockMetrics);

      // Load recent activities (mock data)
      const mockActivities: UserActivityLog[] = [
        {
          id: '1',
          user_id: 'user-1',
          tenant_id: tenantId,
          action: 'login_success',
          resource_type: 'authentication',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          success: true,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user-2',
          tenant_id: tenantId,
          action: 'data_export',
          resource_type: 'user_data',
          resource_id: 'export-123',
          ip_address: '192.168.1.105',
          success: true,
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          user_id: 'user-3',
          tenant_id: tenantId,
          action: 'login_failure',
          resource_type: 'authentication',
          ip_address: '203.0.113.5',
          user_agent: 'Mozilla/5.0...',
          success: false,
          error_message: 'Invalid credentials',
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        }
      ];
      setRecentActivities(mockActivities);

      // Load security incidents (mock data)
      const mockIncidents: SecurityIncident[] = [
        {
          id: 'incident-1',
          tenant_id: tenantId,
          user_id: 'user-3',
          incident_type: 'brute_force',
          severity: 'medium',
          status: 'investigating',
          description: 'Multiple failed login attempts detected from IP 203.0.113.5',
          detected_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          affected_resources: ['authentication'],
          mitigation_steps: ['IP temporarily blocked', 'User notified'],
          metadata: { ip_address: '203.0.113.5', attempts: 5 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setSecurityIncidents(mockIncidents);

      // Load active sessions (mock data)
      const mockSessions: SessionManagement[] = [
        {
          id: 'session-1',
          user_id: 'user-1',
          tenant_id: tenantId,
          session_token: 'token-123',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: { country: 'Nigeria', city: 'Lagos', coordinates: [6.5244, 3.3792] },
          is_active: true,
          last_activity_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'session-2',
          user_id: 'user-2',
          tenant_id: tenantId,
          session_token: 'token-456',
          ip_address: '192.168.1.105',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          location: { country: 'Nigeria', city: 'Abuja', coordinates: [9.0765, 7.3986] },
          is_active: true,
          last_activity_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      ];
      setActiveSessions(mockSessions);

    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncidentStatusUpdate = async (incidentId: string, newStatus: SecurityIncident['status']) => {
    try {
      // Update incident status (API call)
      setSecurityIncidents(incidents => 
        incidents.map(incident => 
          incident.id === incidentId 
            ? { ...incident, status: newStatus, updated_at: new Date().toISOString() }
            : incident
        )
      );
    } catch (error) {
      console.error('Failed to update incident status:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login_success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'login_failure': return <X className="w-4 h-4 text-red-500" />;
      case 'data_export': return <Download className="w-4 h-4 text-blue-500" />;
      case 'permission_granted': return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'permission_revoked': return <UserX className="w-4 h-4 text-red-500" />;
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getIncidentSeverityColor = (severity: SecurityIncident['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getIncidentStatusColor = (status: SecurityIncident['status']) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'contained': return 'bg-yellow-100 text-yellow-800';
      case 'detected': return 'bg-red-100 text-red-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('mobile') || userAgent.toLowerCase().includes('iphone')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Globe className="w-4 h-4" />;
  };

  const isPermittedToViewDetails = (requiredRole: string[]) => {
    return requiredRole.includes(userRole);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading security dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Dashboard</h1>
        <p className="text-gray-600">Monitor and manage your platform security</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Key Security Metrics */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Security Score</p>
                    <p className="text-2xl font-bold text-green-600">{securityMetrics?.security_score}%</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <Progress value={securityMetrics?.security_score || 0} className="h-2" />
                </div>
                <p className="text-xs text-gray-600 mt-1">Excellent security posture</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Incidents</p>
                    <p className="text-2xl font-bold text-orange-600">{securityIncidents.filter(i => i.status !== 'resolved').length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-xs text-orange-600 mt-2">
                  {securityIncidents.filter(i => i.severity === 'high' || i.severity === 'critical').length} high priority
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-blue-600">{securityMetrics?.active_sessions}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  {activeSessions.filter(s => new Date(s.last_activity_at) > new Date(Date.now() - 5 * 60 * 1000)).length} active now
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Compliance Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{securityMetrics?.compliance_percentage}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                </div>
                <div className="mt-2">
                  <Progress value={securityMetrics?.compliance_percentage || 0} className="h-2" />
                </div>
                <p className="text-xs text-purple-600 mt-1">Meeting standards</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Security Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Security Trends (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Login Success Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {securityMetrics ? Math.round((securityMetrics.successful_logins / securityMetrics.total_login_attempts) * 100) : 0}%
                      </span>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  <Progress 
                    value={securityMetrics ? (securityMetrics.successful_logins / securityMetrics.total_login_attempts) * 100 : 0} 
                    className="h-2" 
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Failed Login Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-600">
                        {securityMetrics ? Math.round((securityMetrics.failed_login_attempts / securityMetrics.total_login_attempts) * 100) : 0}%
                      </span>
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                  <Progress 
                    value={securityMetrics ? (securityMetrics.failed_login_attempts / securityMetrics.total_login_attempts) * 100 : 0} 
                    className="h-2"
                  />

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{securityMetrics?.suspicious_activities_detected || 0}</p>
                      <p className="text-xs text-gray-600">Suspicious Activities</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{securityMetrics?.data_exports_requested || 0}</p>
                      <p className="text-xs text-gray-600">Data Exports</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Security Events
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('activities')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {getActionIcon(activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                          {activity.ip_address && (
                            <>
                              <span>•</span>
                              <span>{activity.ip_address}</span>
                            </>
                          )}
                        </div>
                        {activity.error_message && (
                          <p className="text-xs text-red-600 mt-1">{activity.error_message}</p>
                        )}
                      </div>
                      <Badge className={activity.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {activity.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Incidents Summary */}
          {securityIncidents.filter(i => i.status !== 'resolved').length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Active Security Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityIncidents
                    .filter(i => i.status !== 'resolved')
                    .slice(0, 3)
                    .map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge className={getIncidentSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <div>
                          <p className="font-medium">{incident.incident_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                          <p className="text-sm text-gray-600 truncate max-w-md">{incident.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getIncidentStatusColor(incident.status)}>
                          {incident.status.replace('_', ' ')}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab('incidents')}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="incidents">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Security Incidents</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search incidents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Incident
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {securityIncidents.map((incident) => (
                <Card key={incident.id} className={`border-l-4 ${
                  incident.severity === 'critical' ? 'border-l-red-500' :
                  incident.severity === 'high' ? 'border-l-orange-500' :
                  incident.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getIncidentSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge className={getIncidentStatusColor(incident.status)}>
                            {incident.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {incident.incident_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold mb-2">{incident.description}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Detected:</span>
                            <span className="ml-2">{new Date(incident.detected_at).toLocaleString()}</span>
                          </div>
                          {incident.resolved_at && (
                            <div>
                              <span className="text-gray-600">Resolved:</span>
                              <span className="ml-2">{new Date(incident.resolved_at).toLocaleString()}</span>
                            </div>
                          )}
                          {incident.affected_resources.length > 0 && (
                            <div>
                              <span className="text-gray-600">Affected:</span>
                              <span className="ml-2">{incident.affected_resources.join(', ')}</span>
                            </div>
                          )}
                          {incident.assigned_to && (
                            <div>
                              <span className="text-gray-600">Assigned to:</span>
                              <span className="ml-2">Security Team Member</span>
                            </div>
                          )}
                        </div>

                        {incident.mitigation_steps.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Mitigation Steps:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700">
                              {incident.mitigation_steps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {isPermittedToViewDetails(['owner', 'manager']) && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedIncident(incident)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Details
                            </Button>
                            
                            {incident.status !== 'resolved' && (
                              <select
                                value={incident.status}
                                onChange={(e) => handleIncidentStatusUpdate(incident.id, e.target.value as SecurityIncident['status'])}
                                className="text-xs px-2 py-1 border rounded"
                              >
                                <option value="detected">Detected</option>
                                <option value="investigating">Investigating</option>
                                <option value="contained">Contained</option>
                                <option value="resolved">Resolved</option>
                                <option value="false_positive">False Positive</option>
                              </select>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Security Activities</h2>
              <div className="flex items-center gap-3">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Log
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0">
                      <div className="flex items-center gap-4">
                        {getActionIcon(activity.action)}
                        <div>
                          <p className="font-medium text-sm">
                            {activity.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span>{new Date(activity.timestamp).toLocaleString()}</span>
                            {activity.ip_address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.ip_address}
                              </span>
                            )}
                            <span>{activity.resource_type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={activity.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {activity.success ? 'Success' : 'Failed'}
                        </Badge>
                        {isPermittedToViewDetails(['owner', 'manager']) && (
                          <Button size="sm" variant="ghost">
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Sessions</h2>
              <div className="flex items-center gap-3">
                <Badge variant="outline">
                  {activeSessions.filter(s => s.is_active).length} Active Sessions
                </Badge>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {activeSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getDeviceIcon(session.user_agent || '')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">User Session</h3>
                            <Badge className={session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {session.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {session.ip_address}
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="w-3 h-3" />
                              {session.location ? `${session.location.city}, ${session.location.country}` : 'Unknown'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              Last active: {new Date(session.last_activity_at).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              Expires: {new Date(session.expires_at).toLocaleString()}
                            </div>
                          </div>
                          {session.device_fingerprint && (
                            <div className="text-xs text-gray-500 mt-2">
                              Device ID: {session.device_fingerprint.slice(0, 12)}...
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {session.is_active && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Wifi className="w-4 h-4" />
                            <span className="text-xs">Online</span>
                          </div>
                        )}
                        {isPermittedToViewDetails(['owner', 'manager']) && (
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <X className="w-3 h-3 mr-1" />
                            Terminate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-green-600">{securityMetrics?.compliance_percentage}%</p>
                  <p className="text-sm text-gray-600">Overall Compliance</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-blue-600">GDPR</p>
                  <p className="text-sm text-gray-600">Ready</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-purple-600">ISO 27001</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Checklist</CardTitle>
                <p className="text-gray-600">Review your compliance status across different standards</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { item: 'Data Encryption at Rest', status: 'completed', standard: 'GDPR' },
                    { item: 'Access Controls & RLS', status: 'completed', standard: 'ISO 27001' },
                    { item: 'Audit Logging', status: 'completed', standard: 'SOC 2' },
                    { item: 'Data Backup & Recovery', status: 'in_progress', standard: 'ISO 27001' },
                    { item: 'Incident Response Plan', status: 'completed', standard: 'NIST' },
                    { item: 'User Data Export (Right to Portability)', status: 'completed', standard: 'GDPR' },
                    { item: 'Data Retention Policies', status: 'in_progress', standard: 'GDPR' },
                    { item: 'Third-party Security Assessment', status: 'pending', standard: 'SOC 2' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : item.status === 'in_progress' ? (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{item.item}</p>
                          <p className="text-sm text-gray-600">{item.standard}</p>
                        </div>
                      </div>
                      <Badge className={
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <p className="text-gray-600">Configure security policies and thresholds</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {isPermittedToViewDetails(['owner']) ? (
                  <>
                    <div>
                      <h3 className="font-medium mb-3">Authentication</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Max Login Attempts</label>
                          <Input type="number" defaultValue="5" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Lockout Duration (minutes)</label>
                          <Input type="number" defaultValue="30" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Session Timeout (hours)</label>
                          <Input type="number" defaultValue="24" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Password Min Length</label>
                          <Input type="number" defaultValue="8" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Security Features</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-600">Require 2FA for all users</p>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-gray-600">Send security alerts via email</p>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">IP Restrictions</p>
                            <p className="text-sm text-gray-600">Restrict access to specific IP ranges</p>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Data Protection</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Data Retention (days)</label>
                          <Input type="number" defaultValue="2555" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Backup Frequency</label>
                          <select className="w-full px-3 py-2 border rounded-md">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline">Reset to Defaults</Button>
                      <Button>Save Changes</Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                    <p className="text-gray-600">
                      You don't have permission to view security settings. Contact your administrator for access.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SecurityDashboard;