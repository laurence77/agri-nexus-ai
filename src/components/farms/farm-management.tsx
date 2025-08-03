import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Farm, Field, Crop, Task } from '@/types';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Droplets,
  Thermometer,
  Zap,
  Users,
  BarChart3,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export function FarmManagement() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isCreateFarmOpen, setIsCreateFarmOpen] = useState(false);
  const [isCreateFieldOpen, setIsCreateFieldOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    // Simulate API call
    const mockFarms = generateMockFarms();
    setFarms(mockFarms);
    if (mockFarms.length > 0) {
      setSelectedFarm(mockFarms[0]);
    }
  };

  const getFieldStatusColor = (field: Field) => {
    if (!field.currentCrop) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    
    const daysToHarvest = field.expectedHarvestDate ? 
      Math.ceil((field.expectedHarvestDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    if (daysToHarvest < 0) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    if (daysToHarvest < 30) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  const getFieldStatusText = (field: Field) => {
    if (!field.currentCrop) return 'Fallow';
    
    const daysToHarvest = field.expectedHarvestDate ? 
      Math.ceil((field.expectedHarvestDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    if (daysToHarvest < 0) return 'Overdue';
    if (daysToHarvest < 30) return `${daysToHarvest}d to harvest`;
    return field.currentCrop.growthStage;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Farm Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your farms, fields, and crop planning
          </p>
        </div>
        
        <Dialog open={isCreateFarmOpen} onOpenChange={setIsCreateFarmOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Farm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Farm</DialogTitle>
            </DialogHeader>
            <FarmForm onSubmit={() => setIsCreateFarmOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Farm List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Your Farms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {farms.map((farm) => (
              <div
                key={farm.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedFarm?.id === farm.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedFarm(farm)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{farm.name}</h3>
                    <p className="text-sm text-gray-500">{farm.location.city}, {farm.location.state}</p>
                    <p className="text-xs text-gray-400">{farm.totalArea} acres</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {farm.fields.length} fields
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Farm Details */}
        <div className="lg:col-span-3">
          {selectedFarm ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="crops">Crops</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <FarmOverview farm={selectedFarm} />
              </TabsContent>

              <TabsContent value="fields">
                <FieldManagement 
                  farm={selectedFarm} 
                  onAddField={() => setIsCreateFieldOpen(true)}
                />
              </TabsContent>

              <TabsContent value="crops">
                <CropManagement farm={selectedFarm} />
              </TabsContent>

              <TabsContent value="tasks">
                <TaskManagement farmId={selectedFarm.id} />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a farm to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Field Dialog */}
      <Dialog open={isCreateFieldOpen} onOpenChange={setIsCreateFieldOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Field</DialogTitle>
          </DialogHeader>
          <FieldForm 
            farmId={selectedFarm?.id} 
            onSubmit={() => setIsCreateFieldOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FarmOverviewProps {
  farm: Farm;
}

function FarmOverview({ farm }: FarmOverviewProps) {
  const activeFields = farm.fields.filter(f => f.currentCrop);
  const totalSensors = farm.fields.reduce((acc, field) => acc + field.sensors.length, 0);
  const activeSensors = farm.fields.reduce((acc, field) => 
    acc + field.sensors.filter(s => s.status === 'active').length, 0);

  return (
    <div className="space-y-6">
      {/* Farm Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {farm.fields.length}
                </p>
                <p className="text-sm text-gray-500">Total Fields</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {farm.totalArea}
                </p>
                <p className="text-sm text-gray-500">Acres</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeSensors}/{totalSensors}
                </p>
                <p className="text-sm text-gray-500">Active Sensors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeFields.length}
                </p>
                <p className="text-sm text-gray-500">Active Crops</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farm Details */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Location</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {farm.location.address}<br />
              {farm.location.city}, {farm.location.state} {farm.location.zipCode}
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Farm Details</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Type: {farm.farmType}<br />
              Established: {farm.establishedDate.getFullYear()}<br />
              Total Area: {farm.totalArea} acres
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Field Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Field Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farm.fields.map((field) => (
              <div key={field.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{field.name}</h4>
                  <Badge className={getFieldStatusColor(field)}>
                    {getFieldStatusText(field)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {field.area} acres • {field.soilType}
                </p>
                {field.currentCrop && (
                  <p className="text-sm text-gray-500 mt-1">
                    {field.currentCrop.name} ({field.currentCrop.variety})
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {field.sensors.length} sensors
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {field.irrigationType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface FieldManagementProps {
  farm: Farm;
  onAddField: () => void;
}

function FieldManagement({ farm, onAddField }: FieldManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Fields ({farm.fields.length})</h3>
        <Button onClick={onAddField} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {farm.fields.map((field) => (
          <Card key={field.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {field.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getFieldStatusColor(field)}>
                    {getFieldStatusText(field)}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Area:</span> {field.area} acres
                </div>
                <div>
                  <span className="font-medium">Soil:</span> {field.soilType}
                </div>
                <div>
                  <span className="font-medium">Irrigation:</span> {field.irrigationType}
                </div>
                <div>
                  <span className="font-medium">Sensors:</span> {field.sensors.length}
                </div>
              </div>

              {field.currentCrop && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Current Crop</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Crop:</span> {field.currentCrop.name} ({field.currentCrop.variety})</p>
                    <p><span className="font-medium">Planted:</span> {field.plantingDate?.toLocaleDateString()}</p>
                    <p><span className="font-medium">Expected Harvest:</span> {field.expectedHarvestDate?.toLocaleDateString()}</p>
                    <p><span className="font-medium">Growth Stage:</span> {field.currentCrop.growthStage}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CropManagement({ farm }: { farm: Farm }) {
  const activeCrops = farm.fields.filter(f => f.currentCrop).map(f => ({
    field: f,
    crop: f.currentCrop!
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Active Crops ({activeCrops.length})</h3>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Plan Crop
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeCrops.map(({ field, crop }) => (
          <Card key={field.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{crop.name} - {field.name}</span>
                <Badge variant={crop.healthStatus === 'excellent' ? 'default' : 'secondary'}>
                  {crop.healthStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Variety:</span> {crop.variety}
                </div>
                <div>
                  <span className="font-medium">Stage:</span> {crop.growthStage}
                </div>
                <div>
                  <span className="font-medium">Planted:</span> {crop.plantingDate.toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Harvest:</span> {crop.expectedHarvestDate.toLocaleDateString()}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Yield Forecast</h4>
                <div className="text-sm">
                  <p>Expected: {crop.yieldExpected} bushels/acre</p>
                  {crop.yieldActual && (
                    <p>Actual: {crop.yieldActual} bushels/acre</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TaskManagement({ farmId }: { farmId: string }) {
  const [tasks] = useState<Task[]>(generateMockTasks(farmId));

  const getTaskPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tasks & Activities</h3>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Tasks ({pendingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <Badge className={getTaskPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {task.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{task.scheduledDate.toLocaleDateString()}</span>
                  <span>{task.estimatedDuration}h</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* In Progress Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              In Progress ({inProgressTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressTasks.map((task) => (
              <div key={task.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <Badge className={getTaskStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {task.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Started: {task.scheduledDate.toLocaleDateString()}</span>
                  <span>{task.estimatedDuration}h estimated</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Form Components
function FarmForm({ onSubmit }: { onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    totalArea: '',
    farmType: 'crop' as Farm['farmType']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Farm form submitted:', formData);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Farm Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="farmType">Farm Type</Label>
          <Select value={formData.farmType} onValueChange={(value: Farm['farmType']) => 
            setFormData(prev => ({ ...prev, farmType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="crop">Crop</SelectItem>
              <SelectItem value="livestock">Livestock</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
              <SelectItem value="organic">Organic</SelectItem>
              <SelectItem value="greenhouse">Greenhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="totalArea">Total Area (acres)</Label>
        <Input
          id="totalArea"
          type="number"
          value={formData.totalArea}
          onChange={(e) => setFormData(prev => ({ ...prev, totalArea: e.target.value }))}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit">
          Create Farm
        </Button>
      </div>
    </form>
  );
}

function FieldForm({ farmId, onSubmit }: { farmId?: string; onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    soilType: '',
    irrigationType: 'drip' as Field['irrigationType']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Field form submitted:', formData);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fieldName">Field Name</Label>
          <Input
            id="fieldName"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="area">Area (acres)</Label>
          <Input
            id="area"
            type="number"
            value={formData.area}
            onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="soilType">Soil Type</Label>
          <Input
            id="soilType"
            value={formData.soilType}
            onChange={(e) => setFormData(prev => ({ ...prev, soilType: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Irrigation Type</Label>
          <Select value={formData.irrigationType} onValueChange={(value: Field['irrigationType']) => 
            setFormData(prev => ({ ...prev, irrigationType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="drip">Drip</SelectItem>
              <SelectItem value="sprinkler">Sprinkler</SelectItem>
              <SelectItem value="flood">Flood</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit">
          Create Field
        </Button>
      </div>
    </form>
  );
}

// Mock data generators
function generateMockFarms(): Farm[] {
  return [
    {
      id: 'farm-1',
      name: 'Sunset Valley Farm',
      ownerId: 'user-1',
      location: {
        address: '1234 Farm Road',
        city: 'Riverside',
        state: 'CA',
        zipCode: '92501',
        coordinates: { lat: 33.9533, lng: -117.3962 }
      },
      totalArea: 450,
      fields: [
        {
          id: 'field-1',
          name: 'North Field',
          farmId: 'farm-1',
          area: 120,
          coordinates: [
            { lat: 33.9540, lng: -117.3970 },
            { lat: 33.9545, lng: -117.3965 },
            { lat: 33.9540, lng: -117.3955 },
            { lat: 33.9535, lng: -117.3960 }
          ],
          soilType: 'Clay Loam',
          currentCrop: {
            id: 'crop-1',
            name: 'Corn',
            variety: 'Sweet Corn',
            plantingDate: new Date('2024-03-15'),
            expectedHarvestDate: new Date('2024-08-15'),
            growthStage: 'flowering',
            healthStatus: 'good',
            yieldExpected: 180
          },
          plantingDate: new Date('2024-03-15'),
          expectedHarvestDate: new Date('2024-08-15'),
          irrigationType: 'drip',
          sensors: []
        },
        {
          id: 'field-2',
          name: 'South Field',
          farmId: 'farm-1',
          area: 200,
          coordinates: [
            { lat: 33.9525, lng: -117.3970 },
            { lat: 33.9530, lng: -117.3965 },
            { lat: 33.9525, lng: -117.3955 },
            { lat: 33.9520, lng: -117.3960 }
          ],
          soilType: 'Sandy Loam',
          currentCrop: {
            id: 'crop-2',
            name: 'Soybeans',
            variety: 'Non-GMO',
            plantingDate: new Date('2024-04-01'),
            expectedHarvestDate: new Date('2024-09-15'),
            growthStage: 'vegetative',
            healthStatus: 'excellent',
            yieldExpected: 55
          },
          plantingDate: new Date('2024-04-01'),
          expectedHarvestDate: new Date('2024-09-15'),
          irrigationType: 'sprinkler',
          sensors: []
        }
      ],
      establishedDate: new Date('2010-01-01'),
      farmType: 'crop'
    },
    {
      id: 'farm-2',
      name: 'Green Acres Organic',
      ownerId: 'user-1',
      location: {
        address: '5678 Organic Way',
        city: 'Davis',
        state: 'CA',
        zipCode: '95616',
        coordinates: { lat: 38.5449, lng: -121.7405 }
      },
      totalArea: 280,
      fields: [
        {
          id: 'field-3',
          name: 'East Pasture',
          farmId: 'farm-2',
          area: 180,
          coordinates: [
            { lat: 38.5455, lng: -121.7415 },
            { lat: 38.5460, lng: -121.7410 },
            { lat: 38.5455, lng: -121.7395 },
            { lat: 38.5450, lng: -121.7400 }
          ],
          soilType: 'Silty Clay',
          irrigationType: 'flood',
          sensors: []
        }
      ],
      establishedDate: new Date('2015-06-01'),
      farmType: 'organic'
    }
  ];
}

function generateMockTasks(farmId: string): Task[] {
  return [
    {
      id: 'task-1',
      title: 'Apply Fertilizer to North Field',
      description: 'Apply nitrogen-rich fertilizer to corn crop in North Field',
      type: 'fertilizing',
      priority: 'high',
      status: 'pending',
      farmId,
      fieldId: 'field-1',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      estimatedDuration: 3
    },
    {
      id: 'task-2',
      title: 'Inspect Irrigation System',
      description: 'Weekly inspection of drip irrigation system',
      type: 'maintenance',
      priority: 'medium',
      status: 'in_progress',
      farmId,
      fieldId: 'field-1',
      scheduledDate: new Date(),
      estimatedDuration: 2
    },
    {
      id: 'task-3',
      title: 'Pest Monitoring',
      description: 'Check for signs of corn borer infestation',
      type: 'monitoring',
      priority: 'urgent',
      status: 'pending',
      farmId,
      fieldId: 'field-1',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      estimatedDuration: 1
    }
  ];
}