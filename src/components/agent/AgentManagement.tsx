import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Users,
  User,
  UserPlus,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Target,
  Award,
  Activity,
  Filter,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Settings,
  Shield,
  MessageSquare
} from 'lucide-react';

interface Agent {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    employeeId?: string;
    profilePhoto?: string;
  };
  role: 'field_agent' | 'supervisor' | 'enumerator' | 'extension_officer' | 'coordinator';
  organization: {
    name: string;
    type: 'ngo' | 'government' | 'cooperative' | 'private';
    department?: string;
  };
  location: {
    baseLocation: string;
    operatingAreas: string[];
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  permissions: {
    canCreateFarmers: boolean;
    canEditFarmers: boolean;
    canDeleteData: boolean;
    canExportData: boolean;
    canManageAgents: boolean;
    dataAccessLevel: 'own' | 'team' | 'organization' | 'all';
  };
  status: 'active' | 'inactive' | 'suspended';
  stats: {
    farmersRegistered: number;
    formsCompleted: number;
    lastSyncDate?: Date;
    lastActiveDate?: Date;
    totalWorkDays: number;
    averageFormsPerDay: number;
  };
  assignments: {
    activeTasksCount: number;
    completedTasksCount: number;
    overdueTasks: number;
    currentTargets: {
      farmers: number;
      forms: number;
      deadline: Date;
    };
  };
  deviceInfo?: {
    deviceId: string;
    lastSeen: Date;
    appVersion: string;
    isOnline: boolean;
  };
  createdAt: Date;
  createdBy: string;
}

interface AgentPerformance {
  agentId: string;
  period: 'daily' | 'weekly' | 'monthly';
  metrics: {
    farmersRegistered: number;
    formsCompleted: number;
    qualityScore: number; // 0-100
    efficiency: number; // forms per hour
    target: number;
    achievement: number; // percentage
  };
  date: Date;
}

interface Assignment {
  id: string;
  agentId: string;
  type: 'farmer_registration' | 'farm_inspection' | 'survey' | 'training';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: Date;
  location: {
    area: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  targets: {
    farmers?: number;
    forms?: number;
    visits?: number;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  createdAt: Date;
  completedAt?: Date;
}

export function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [performance, setPerformance] = useState<AgentPerformance[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'assignments' | 'performance'>('overview');
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
    generateMockData();
  }, []);

  const loadData = () => {
    try {
      const storedAgents = localStorage.getItem('agents');
      if (storedAgents) {
        const agentData = JSON.parse(storedAgents).map((agent: Agent) => ({
          ...agent,
          createdAt: new Date(agent.createdAt),
          stats: {
            ...agent.stats,
            lastSyncDate: agent.stats.lastSyncDate ? new Date(agent.stats.lastSyncDate) : undefined,
            lastActiveDate: agent.stats.lastActiveDate ? new Date(agent.stats.lastActiveDate) : undefined
          },
          deviceInfo: agent.deviceInfo ? {
            ...agent.deviceInfo,
            lastSeen: new Date(agent.deviceInfo.lastSeen)
          } : undefined
        }));
        setAgents(agentData);
      }

      const storedAssignments = localStorage.getItem('agent_assignments');
      if (storedAssignments) {
        const assignmentData = JSON.parse(storedAssignments).map((assignment: Assignment) => ({
          ...assignment,
          dueDate: new Date(assignment.dueDate),
          createdAt: new Date(assignment.createdAt),
          completedAt: assignment.completedAt ? new Date(assignment.completedAt) : undefined
        }));
        setAssignments(assignmentData);
      }
    } catch (error) {
      console.error('Error loading agent data:', error);
    }
  };

  const generateMockData = () => {
    if (agents.length === 0) {
      const mockAgents: Agent[] = [
        {
          id: 'agent_001',
          personalInfo: {
            firstName: 'Adamu',
            lastName: 'Ibrahim',
            phone: '+2348012345678',
            email: 'adamu.ibrahim@ngo.org',
            employeeId: 'NGO001'
          },
          role: 'field_agent',
          organization: {
            name: 'Farm Aid Nigeria',
            type: 'ngo',
            department: 'Field Operations'
          },
          location: {
            baseLocation: 'Kaduna, Nigeria',
            operatingAreas: ['Kaduna North', 'Kaduna South', 'Chikun'],
            coordinates: {
              latitude: 10.5105,
              longitude: 7.4165
            }
          },
          permissions: {
            canCreateFarmers: true,
            canEditFarmers: true,
            canDeleteData: false,
            canExportData: true,
            canManageAgents: false,
            dataAccessLevel: 'team'
          },
          status: 'active',
          stats: {
            farmersRegistered: 234,
            formsCompleted: 456,
            lastSyncDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            lastActiveDate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            totalWorkDays: 45,
            averageFormsPerDay: 8.2
          },
          assignments: {
            activeTasksCount: 5,
            completedTasksCount: 23,
            overdueTasks: 1,
            currentTargets: {
              farmers: 50,
              forms: 100,
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            }
          },
          deviceInfo: {
            deviceId: 'DEV_001',
            lastSeen: new Date(Date.now() - 30 * 60 * 1000),
            appVersion: '1.2.3',
            isOnline: true
          },
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          createdBy: 'supervisor_001'
        },
        {
          id: 'agent_002',
          personalInfo: {
            firstName: 'Fatima',
            lastName: 'Mohammed',
            phone: '+2348087654321',
            email: 'fatima.mohammed@coop.ng',
            employeeId: 'COOP002'
          },
          role: 'enumerator',
          organization: {
            name: 'Northern Farmers Cooperative',
            type: 'cooperative',
            department: 'Data Collection'
          },
          location: {
            baseLocation: 'Kano, Nigeria',
            operatingAreas: ['Kano Municipal', 'Fagge', 'Dala'],
            coordinates: {
              latitude: 12.0022,
              longitude: 8.5920
            }
          },
          permissions: {
            canCreateFarmers: true,
            canEditFarmers: false,
            canDeleteData: false,
            canExportData: false,
            canManageAgents: false,
            dataAccessLevel: 'own'
          },
          status: 'active',
          stats: {
            farmersRegistered: 89,
            formsCompleted: 167,
            lastSyncDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            lastActiveDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            totalWorkDays: 22,
            averageFormsPerDay: 5.8
          },
          assignments: {
            activeTasksCount: 3,
            completedTasksCount: 15,
            overdueTasks: 0,
            currentTargets: {
              farmers: 25,
              forms: 50,
              deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
            }
          },
          deviceInfo: {
            deviceId: 'DEV_002',
            lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000),
            appVersion: '1.2.2',
            isOnline: false
          },
          createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
          createdBy: 'supervisor_001'
        }
      ];

      setAgents(mockAgents);
      localStorage.setItem('agents', JSON.stringify(mockAgents));
    }
  };

  const saveAgents = (agentList: Agent[]) => {
    try {
      localStorage.setItem('agents', JSON.stringify(agentList));
      setAgents(agentList);
    } catch (error) {
      console.error('Error saving agents:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'supervisor':
        return 'bg-purple-100 text-purple-800';
      case 'field_agent':
        return 'bg-blue-100 text-blue-800';
      case 'enumerator':
        return 'bg-green-100 text-green-800';
      case 'extension_officer':
        return 'bg-orange-100 text-orange-800';
      case 'coordinator':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.personalInfo.phone.includes(searchTerm) ||
      agent.location.baseLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || agent.role === filterRole;
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalStats = agents.reduce((acc, agent) => ({
    totalAgents: acc.totalAgents + 1,
    activeAgents: acc.activeAgents + (agent.status === 'active' ? 1 : 0),
    totalFarmers: acc.totalFarmers + agent.stats.farmersRegistered,
    totalForms: acc.totalForms + agent.stats.formsCompleted,
    onlineAgents: acc.onlineAgents + (agent.deviceInfo?.isOnline ? 1 : 0)
  }), {
    totalAgents: 0,
    activeAgents: 0,
    totalFarmers: 0,
    totalForms: 0,
    onlineAgents: 0
  });

  if (selectedAgent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedAgent.personalInfo.firstName} {selectedAgent.personalInfo.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={getRoleColor(selectedAgent.role)}>
                  {selectedAgent.role.replace('_', ' ')}
                </Badge>
                <Badge className={getStatusColor(selectedAgent.status)}>
                  {selectedAgent.status}
                </Badge>
                {selectedAgent.deviceInfo?.isOnline && (
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={() => setSelectedAgent(null)}>
              Back to List
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{selectedAgent.stats.farmersRegistered}</p>
                    <p className="text-sm text-gray-600">Farmers Registered</p>
                  </div>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{selectedAgent.stats.formsCompleted}</p>
                    <p className="text-sm text-gray-600">Forms Completed</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{selectedAgent.assignments.activeTasksCount}</p>
                    <p className="text-sm text-gray-600">Active Tasks</p>
                  </div>
                  <Activity className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{selectedAgent.stats.averageFormsPerDay.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Avg Forms/Day</p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{selectedAgent.personalInfo.firstName} {selectedAgent.personalInfo.lastName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{selectedAgent.personalInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{selectedAgent.personalInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{selectedAgent.location.baseLocation}</span>
                  </div>
                  {selectedAgent.personalInfo.employeeId && (
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span>ID: {selectedAgent.personalInfo.employeeId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Organization</Label>
                    <p>{selectedAgent.organization.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Type</Label>
                    <p className="capitalize">{selectedAgent.organization.type}</p>
                  </div>
                  {selectedAgent.organization.department && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Department</Label>
                      <p>{selectedAgent.organization.department}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Operating Areas</Label>
                    <p>{selectedAgent.location.operatingAreas.join(', ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Farmers Target</span>
                      <span>{selectedAgent.stats.farmersRegistered} / {selectedAgent.assignments.currentTargets.farmers}</span>
                    </div>
                    <Progress 
                      value={(selectedAgent.stats.farmersRegistered / selectedAgent.assignments.currentTargets.farmers) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Forms Target</span>
                      <span>{selectedAgent.stats.formsCompleted} / {selectedAgent.assignments.currentTargets.forms}</span>
                    </div>
                    <Progress 
                      value={(selectedAgent.stats.formsCompleted / selectedAgent.assignments.currentTargets.forms) * 100} 
                      className="h-2" 
                    />
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Deadline: {selectedAgent.assignments.currentTargets.deadline.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAgent.deviceInfo ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${selectedAgent.deviceInfo.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span>{selectedAgent.deviceInfo.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Device ID</Label>
                      <p>{selectedAgent.deviceInfo.deviceId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">App Version</Label>
                      <p>{selectedAgent.deviceInfo.appVersion}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Last Seen</Label>
                      <p>{selectedAgent.deviceInfo.lastSeen.toLocaleString()}</p>
                    </div>
                    {selectedAgent.stats.lastSyncDate && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Last Sync</Label>
                        <p>{selectedAgent.stats.lastSyncDate.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No device information available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Create Farmers</span>
                    {selectedAgent.permissions.canCreateFarmers ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Edit Farmers</span>
                    {selectedAgent.permissions.canEditFarmers ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delete Data</span>
                    {selectedAgent.permissions.canDeleteData ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Export Data</span>
                    {selectedAgent.permissions.canExportData ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Manage Agents</span>
                    {selectedAgent.permissions.canManageAgents ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data Access Level</Label>
                    <Badge variant="outline">{selectedAgent.permissions.dataAccessLevel}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Management</h1>
        <p className="text-gray-600">Manage field agents, enumerators, and their assignments</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Button>
        <Button 
          variant={activeTab === 'agents' ? 'default' : 'outline'}
          onClick={() => setActiveTab('agents')}
        >
          Agents ({agents.length})
        </Button>
        <Button 
          variant={activeTab === 'assignments' ? 'default' : 'outline'}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </Button>
        <Button 
          variant={activeTab === 'performance' ? 'default' : 'outline'}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </Button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{totalStats.totalAgents}</p>
                    <p className="text-sm text-gray-600">Total Agents</p>
                  </div>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{totalStats.activeAgents}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{totalStats.onlineAgents}</p>
                    <p className="text-sm text-gray-600">Online Now</p>
                  </div>
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{totalStats.totalFarmers}</p>
                    <p className="text-sm text-gray-600">Farmers Registered</p>
                  </div>
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{totalStats.totalForms}</p>
                    <p className="text-sm text-gray-600">Forms Completed</p>
                  </div>
                  <Award className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agents
                  .sort((a, b) => b.stats.farmersRegistered - a.stats.farmersRegistered)
                  .slice(0, 5)
                  .map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index === 0 ? 'bg-yellow-500 text-white' : 
                          index === 1 ? 'bg-gray-400 text-white' : 
                          index === 2 ? 'bg-orange-500 text-white' : 
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{agent.personalInfo.firstName} {agent.personalInfo.lastName}</p>
                          <p className="text-sm text-gray-600">{agent.location.baseLocation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{agent.stats.farmersRegistered} farmers</p>
                        <p className="text-sm text-gray-600">{agent.stats.formsCompleted} forms</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      className="pl-10"
                      placeholder="Search agents by name, phone, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="field_agent">Field Agent</option>
                  <option value="enumerator">Enumerator</option>
                  <option value="extension_officer">Extension Officer</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="coordinator">Coordinator</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>

                <Button onClick={() => setShowCreateAgent(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(agent.status)}
                      <div>
                        <h3 className="font-semibold">
                          {agent.personalInfo.firstName} {agent.personalInfo.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{agent.personalInfo.employeeId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(agent.role)}>
                        {agent.role.replace('_', ' ')}
                      </Badge>
                      {agent.deviceInfo?.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {agent.personalInfo.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {agent.location.baseLocation}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {agent.organization.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="font-medium">{agent.stats.farmersRegistered}</p>
                      <p className="text-gray-600">Farmers</p>
                    </div>
                    <div>
                      <p className="font-medium">{agent.stats.formsCompleted}</p>
                      <p className="text-gray-600">Forms</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedAgent(agent)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No agents found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Assignment management coming soon</p>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Performance analytics coming soon</p>
        </div>
      )}
    </div>
  );
}

export default AgentManagement;