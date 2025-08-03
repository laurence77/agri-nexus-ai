import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Equipment, MaintenanceRecord } from '@/types';
import {
  Truck,
  Settings,
  Calendar,
  MapPin,
  Fuel,
  Clock,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  Wrench,
  DollarSign,
  BarChart3
} from 'lucide-react';

export function EquipmentDashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadEquipmentData();
  }, []);

  const loadEquipmentData = async () => {
    // Simulate API calls
    const mockEquipment = generateMockEquipment();
    const mockMaintenance = generateMockMaintenance();
    
    setEquipment(mockEquipment);
    setMaintenanceRecords(mockMaintenance);
    if (mockEquipment.length > 0) {
      setSelectedEquipment(mockEquipment[0]);
    }
  };

  const getEquipmentIcon = (type: Equipment['type']) => {
    switch (type) {
      case 'tractor': return <Truck className="h-5 w-5 text-green-600" />;
      case 'harvester': return <Settings className="h-5 w-5 text-orange-600" />;
      case 'planter': return <Activity className="h-5 w-5 text-blue-600" />;
      case 'sprayer': return <Droplets className="h-5 w-5 text-purple-600" />;
      case 'irrigation': return <Droplets className="h-5 w-5 text-cyan-600" />;
      case 'drone': return <Activity className="h-5 w-5 text-gray-600" />;
      default: return <Truck className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'repair': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'retired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getMaintenanceStatusColor = (status: MaintenanceRecord['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'scheduled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const operationalEquipment = equipment.filter(e => e.status === 'operational');
  const maintenanceNeeded = equipment.filter(e => e.status === 'maintenance' || e.status === 'repair');
  const overdueMaintenances = maintenanceRecords.filter(m => m.status === 'overdue');
  const totalMaintenanceCost = maintenanceRecords
    .filter(m => m.status === 'completed' && m.cost)
    .reduce((acc, m) => acc + (m.cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="h-6 w-6" />
            Equipment Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track equipment, schedule maintenance, and monitor performance
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
            </DialogHeader>
            <EquipmentForm onSubmit={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {operationalEquipment.length}
                </p>
                <p className="text-sm text-gray-500">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {maintenanceNeeded.length}
                </p>
                <p className="text-sm text-gray-500">Need Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overdueMaintenances.length}
                </p>
                <p className="text-sm text-gray-500">Overdue Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalMaintenanceCost.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Maintenance Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Equipment List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Equipment Fleet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {equipment.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedEquipment?.id === item.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedEquipment(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getEquipmentIcon(item.type)}
                    <div>
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.model} • {item.year}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {item.operatingHours}h • {item.location && '📍 Active'}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Equipment Details */}
        <div className="lg:col-span-3">
          {selectedEquipment ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <EquipmentOverview equipment={selectedEquipment} />
              </TabsContent>

              <TabsContent value="maintenance">
                <MaintenanceManagement 
                  equipment={selectedEquipment}
                  maintenanceRecords={maintenanceRecords.filter(r => r.equipmentId === selectedEquipment.id)}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <EquipmentAnalytics equipment={selectedEquipment} />
              </TabsContent>

              <TabsContent value="location">
                <LocationTracking equipment={selectedEquipment} />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select equipment to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface EquipmentOverviewProps {
  equipment: Equipment;
}

function EquipmentOverview({ equipment }: EquipmentOverviewProps) {
  const utilizationRate = Math.round((equipment.operatingHours / (365 * 8)) * 100); // Assuming 8h/day max
  const ageYears = new Date().getFullYear() - equipment.year;

  return (
    <div className="space-y-6">
      {/* Equipment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getEquipmentIcon(equipment.type)}
            {equipment.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-2">Basic Information</h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">Type:</span> {equipment.type}</p>
              <p><span className="font-medium">Model:</span> {equipment.model}</p>
              <p><span className="font-medium">Year:</span> {equipment.year}</p>
              <p><span className="font-medium">Age:</span> {ageYears} years</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Operational Status</h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">Status:</span> 
                <Badge className={`ml-2 ${getStatusColor(equipment.status)}`}>
                  {equipment.status}
                </Badge>
              </p>
              <p><span className="font-medium">Operating Hours:</span> {equipment.operatingHours.toLocaleString()}h</p>
              <p><span className="font-medium">Utilization:</span> {utilizationRate}%</p>
              {equipment.assignedField && (
                <p><span className="font-medium">Assigned Field:</span> {equipment.assignedField}</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Performance Metrics</h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {equipment.fuelConsumption && (
                <p><span className="font-medium">Fuel Efficiency:</span> {equipment.fuelConsumption}L/h</p>
              )}
              <p><span className="font-medium">Next Maintenance:</span> 
                {equipment.maintenanceSchedule.find(m => m.status === 'scheduled')?.scheduledDate.toLocaleDateString() || 'Not scheduled'}
              </p>
              {equipment.location && (
                <p><span className="font-medium">Last Location:</span> 
                  {equipment.location.lat.toFixed(4)}, {equipment.location.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Daily Utilization</span>
                  <span>{utilizationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Total Hours: {equipment.operatingHours.toLocaleString()}</p>
                <p>Hours This Week: {Math.round(Math.random() * 40)}</p>
                <p>Avg Daily Use: {Math.round(equipment.operatingHours / (ageYears * 365))}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {equipment.fuelConsumption && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Fuel Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {equipment.fuelConsumption}L/h
                  </div>
                  <p className="text-sm text-gray-500">Current Rate</p>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Weekly Usage: ~{Math.round(equipment.fuelConsumption * 40)}L</p>
                  <p>Monthly Cost: ~${Math.round(equipment.fuelConsumption * 160 * 1.5)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {equipment.maintenanceSchedule.slice(0, 3).map((maintenance, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{maintenance.type}</span>
                    <Badge className={getMaintenanceStatusColor(maintenance.status)}>
                      {maintenance.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MaintenanceManagementProps {
  equipment: Equipment;
  maintenanceRecords: MaintenanceRecord[];
}

function MaintenanceManagement({ equipment, maintenanceRecords }: MaintenanceManagementProps) {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Maintenance Schedule</h3>
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
            </DialogHeader>
            <MaintenanceForm 
              equipmentId={equipment.id}
              onSubmit={() => setIsScheduleDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled & Overdue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {equipment.maintenanceSchedule.filter(m => m.status !== 'completed').map((maintenance) => (
              <div key={maintenance.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{maintenance.description}</h4>
                  <Badge className={getMaintenanceStatusColor(maintenance.status)}>
                    {maintenance.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p><span className="font-medium">Type:</span> {maintenance.type}</p>
                  <p><span className="font-medium">Scheduled:</span> {maintenance.scheduledDate.toLocaleDateString()}</p>
                  {maintenance.cost && (
                    <p><span className="font-medium">Estimated Cost:</span> ${maintenance.cost}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm">
                    Mark Complete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Maintenance History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {maintenanceRecords.filter(r => r.status === 'completed').slice(0, 5).map((record) => (
              <div key={record.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{record.description}</h4>
                  <Badge className={getMaintenanceStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p><span className="font-medium">Type:</span> {record.type}</p>
                  <p><span className="font-medium">Completed:</span> {record.completedDate?.toLocaleDateString()}</p>
                  {record.cost && (
                    <p><span className="font-medium">Cost:</span> ${record.cost}</p>
                  )}
                  {record.technician && (
                    <p><span className="font-medium">Technician:</span> {record.technician}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EquipmentAnalytics({ equipment }: { equipment: Equipment }) {
  // Generate mock analytics data
  const utilizationData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    hours: Math.round(Math.random() * 12),
    efficiency: 80 + Math.random() * 20
  }));

  const maintenanceCostData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
    cost: Math.round(Math.random() * 2000 + 500)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Utilization (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Maintenance Costs (12 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={maintenanceCostData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                  <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((equipment.operatingHours / (new Date().getFullYear() - equipment.year) / 365) * 10) / 10}
              </div>
              <p className="text-sm text-gray-500">Avg Hours/Day</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <p className="text-sm text-gray-500">Reliability Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${Math.round(equipment.operatingHours * 12)}
              </div>
              <p className="text-sm text-gray-500">Operating Cost</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(equipment.operatingHours / (equipment.maintenanceSchedule.filter(m => m.status === 'completed').length || 1))}h
              </div>
              <p className="text-sm text-gray-500">MTBF</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LocationTracking({ equipment }: { equipment: Equipment }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Current Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          {equipment.location ? (
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>Interactive Map</p>
                  <p className="text-sm">Lat: {equipment.location.lat.toFixed(6)}</p>
                  <p className="text-sm">Lng: {equipment.location.lng.toFixed(6)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Last Update:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date().toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Field Assignment:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {equipment.assignedField || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <p>Location tracking not available</p>
              <p className="text-sm">Enable GPS tracking for this equipment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Form Components
function EquipmentForm({ onSubmit }: { onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'tractor' as Equipment['type'],
    model: '',
    year: new Date().getFullYear(),
    operatingHours: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Equipment form submitted:', formData);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Equipment Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(value: Equipment['type']) => 
            setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tractor">Tractor</SelectItem>
              <SelectItem value="harvester">Harvester</SelectItem>
              <SelectItem value="planter">Planter</SelectItem>
              <SelectItem value="sprayer">Sprayer</SelectItem>
              <SelectItem value="irrigation">Irrigation</SelectItem>
              <SelectItem value="drone">Drone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="operatingHours">Operating Hours</Label>
        <Input
          id="operatingHours"
          type="number"
          min="0"
          value={formData.operatingHours}
          onChange={(e) => setFormData(prev => ({ ...prev, operatingHours: parseInt(e.target.value) }))}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit">
          Add Equipment
        </Button>
      </div>
    </form>
  );
}

function MaintenanceForm({ equipmentId, onSubmit }: { equipmentId: string; onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    type: 'routine' as MaintenanceRecord['type'],
    description: '',
    scheduledDate: '',
    estimatedCost: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Maintenance form submitted:', formData, 'for equipment:', equipmentId);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Type</Label>
        <Select value={formData.type} onValueChange={(value: MaintenanceRecord['type']) => 
          setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="routine">Routine</SelectItem>
            <SelectItem value="repair">Repair</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="scheduledDate">Scheduled Date</Label>
          <Input
            id="scheduledDate"
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
          <Input
            id="estimatedCost"
            type="number"
            min="0"
            value={formData.estimatedCost}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit">
          Schedule Maintenance
        </Button>
      </div>
    </form>
  );
}

// Mock data generators
function generateMockEquipment(): Equipment[] {
  return [
    {
      id: 'eq-1',
      name: 'John Deere 8370R',
      type: 'tractor',
      model: '8370R',
      year: 2020,
      status: 'operational',
      location: { lat: 40.7128, lng: -74.0060 },
      maintenanceSchedule: [],
      fuelConsumption: 25,
      operatingHours: 2840,
      assignedField: 'North Field'
    },
    {
      id: 'eq-2',
      name: 'Case IH Axial-Flow 8250',
      type: 'harvester',
      model: 'Axial-Flow 8250',
      year: 2019,
      status: 'maintenance',
      maintenanceSchedule: [],
      operatingHours: 1650,
      assignedField: 'South Field'
    },
    {
      id: 'eq-3',
      name: 'Kinze 3700 Planter',
      type: 'planter',
      model: '3700',
      year: 2021,
      status: 'operational',
      maintenanceSchedule: [],
      operatingHours: 890
    }
  ];
}

function generateMockMaintenance(): MaintenanceRecord[] {
  return [
    {
      id: 'maint-1',
      equipmentId: 'eq-1',
      type: 'routine',
      description: 'Engine oil change and filter replacement',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'scheduled',
      cost: 150
    },
    {
      id: 'maint-2',
      equipmentId: 'eq-2',
      type: 'repair',
      description: 'Hydraulic pump replacement',
      scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedDate: new Date(),
      status: 'completed',
      cost: 1200,
      technician: 'Mike Johnson'
    }
  ];
}