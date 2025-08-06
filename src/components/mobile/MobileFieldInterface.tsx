import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Smartphone,
  Wifi,
  WifiOff,
  Camera,
  MapPin,
  Clock,
  Thermometer,
  Droplets,
  CheckCircle,
  AlertTriangle,
  Upload,
  Download,
  Sync,
  User,
  Activity,
  Target,
  Plus,
  Send,
  Eye,
  Bell
} from 'lucide-react';

interface OfflineData {
  id: string;
  type: 'health_check' | 'feeding' | 'observation' | 'treatment' | 'breeding';
  animalId?: string;
  cropId?: string;
  timestamp: Date;
  location: { lat: number; lng: number };
  data: any;
  photos: string[];
  synced: boolean;
}

interface FieldTask {
  id: string;
  title: string;
  description: string;
  type: 'health_check' | 'feeding' | 'treatment' | 'observation' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  dueDate: Date;
  location: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  animals?: string[];
  crops?: string[];
  estimatedDuration: number; // minutes
}

interface WorkerProfile {
  id: string;
  name: string;
  role: string;
  skills: string[];
  currentLocation?: { lat: number; lng: number };
  activeTask?: string;
  shift: { start: string; end: string };
  performance: {
    tasksCompleted: number;
    averageRating: number;
    onTimeCompletion: number;
  };
}

export function MobileFieldInterface() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [offlineData, setOfflineData] = useState<OfflineData[]>(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('offlineData');
    return stored ? JSON.parse(stored) : [];
  });
  const [fieldTasks, setFieldTasks] = useState<FieldTask[]>([]);
  const [activeTask, setActiveTask] = useState<FieldTask | null>(null);
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [quickReport, setQuickReport] = useState({
    type: 'observation',
    notes: '',
    photos: [] as string[]
  });

  useEffect(() => {
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error)
      );
    }

    loadSampleData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist offlineData to localStorage on change
  useEffect(() => {
    localStorage.setItem('offlineData', JSON.stringify(offlineData));
  }, [offlineData]);

  const loadSampleData = () => {
    const sampleWorker: WorkerProfile = {
      id: 'worker-001',
      name: 'John Kimani',
      role: 'Field Worker',
      skills: ['Animal Care', 'Crop Monitoring', 'Equipment Operation'],
      currentLocation: currentLocation,
      shift: { start: '06:00', end: '18:00' },
      performance: {
        tasksCompleted: 45,
        averageRating: 4.3,
        onTimeCompletion: 89
      }
    };

    const sampleTasks: FieldTask[] = [
      {
        id: 'task-001',
        title: 'Morning Health Check - Dairy Cows',
        description: 'Check temperature and general health of all dairy cows in Block A',
        type: 'health_check',
        priority: 'high',
        assignedTo: 'worker-001',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        location: 'Dairy Block A',
        status: 'pending',
        animals: ['COW-001', 'COW-002', 'COW-003'],
        estimatedDuration: 45
      },
      {
        id: 'task-002',
        title: 'Feed Distribution - Poultry',
        description: 'Distribute layer feed to all chicken coops',
        type: 'feeding',
        priority: 'medium',
        assignedTo: 'worker-001',
        dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        location: 'Poultry Section',
        status: 'pending',
        animals: ['COOP-001', 'COOP-002'],
        estimatedDuration: 30
      },
      {
        id: 'task-003',
        title: 'Crop Inspection - Maize Field',
        description: 'Check for pest damage and growth progress',
        type: 'observation',
        priority: 'medium',
        assignedTo: 'worker-001',
        dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        location: 'Field A - Maize',
        status: 'pending',
        crops: ['MAIZE-001'],
        estimatedDuration: 60
      }
    ];

    setWorker(sampleWorker);
    setFieldTasks(sampleTasks);
  };

  const startTask = (task: FieldTask) => {
    setActiveTask(task);
    setFieldTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: 'in_progress' } : t
    ));
  };

  const completeTask = (taskId: string, notes: string, photos: string[]) => {
    const completedData: OfflineData = {
      id: `data-${Date.now()}`,
      type: activeTask?.type || 'observation',
      timestamp: new Date(),
      location: currentLocation || { lat: 0, lng: 0 },
      data: { taskId, notes, completedAt: new Date() },
      photos,
      synced: isOnline
    };

    setOfflineData(prev => [...prev, completedData]);
    setFieldTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'completed' } : t
    ));
    setActiveTask(null);

    if (isOnline) {
      syncData([completedData]);
    }
  };

  const syncData = async (data: OfflineData[]) => {
    // Simulate API sync
    console.log('Syncing data:', data);
    
    setOfflineData(prev => prev.map(item => 
      data.find(d => d.id === item.id) ? { ...item, synced: true } : item
    ));
  };

  const syncAllData = async () => {
    const unsyncedData = offlineData.filter(item => !item.synced);
    if (unsyncedData.length > 0 && isOnline) {
      await syncData(unsyncedData);
    }
  };

  const capturePhoto = () => {
    // Simulate photo capture
    const photoUrl = `photo-${Date.now()}.jpg`;
    setQuickReport(prev => ({ ...prev, photos: [...prev.photos, photoUrl] }));
  };

  const submitQuickReport = () => {
    const reportData: OfflineData = {
      id: `report-${Date.now()}`,
      type: quickReport.type as any,
      timestamp: new Date(),
      location: currentLocation || { lat: 0, lng: 0 },
      data: { notes: quickReport.notes },
      photos: quickReport.photos,
      synced: isOnline
    };

    setOfflineData(prev => [...prev, reportData]);
    setQuickReport({ type: 'observation', notes: '', photos: [] });

    if (isOnline) {
      syncData([reportData]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="font-bold text-lg">Field Interface</h1>
                <p className="text-sm text-gray-600">{worker?.name} • {worker?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <Badge variant="outline" className="text-xs">
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Alert */}
      {!isOnline && offlineData.some(item => !item.synced) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {offlineData.filter(item => !item.synced).length} items pending sync
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={syncAllData}
              disabled={!isOnline}
            >
              <Sync className="h-4 w-4 mr-1" />
              Sync
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Current Location */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium">Current Location</p>
                  <p className="text-sm text-gray-600">
                    {currentLocation ? 
                      `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 
                      'Getting location...'
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Task */}
        {activeTask && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-900">Active Task</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-medium">{activeTask.title}</h3>
                <p className="text-sm text-gray-600">{activeTask.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium">{activeTask.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">{activeTask.estimatedDuration} min</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => completeTask(activeTask.id, '', [])}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Task
                  </Button>
                  <Button variant="outline" onClick={capturePhoto}>
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fieldTasks.filter(task => task.status !== 'completed').map((task) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>📍 {task.location}</div>
                    <div>⏱️ {task.estimatedDuration} min</div>
                  </div>
                  {task.status === 'pending' && (
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => startTask(task)}
                    >
                      Start Task
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Report */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={quickReport.type}
                  onChange={(e) => setQuickReport(prev => ({ ...prev, type: e.target.value }))}
                  aria-label="Select report type"
                  title="Select report type"
                >
                  <option value="observation">Observation</option>
                  <option value="health_check">Health Issue</option>
                  <option value="treatment">Treatment Applied</option>
                  <option value="feeding">Feeding Completed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  className="mt-1"
                  value={quickReport.notes}
                  onChange={(e) => setQuickReport(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter observations, issues, or notes..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={capturePhoto} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photo ({quickReport.photos.length})
                </Button>
                <Button 
                  onClick={submitQuickReport}
                  disabled={!quickReport.notes}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {worker?.performance.tasksCompleted}
                </p>
                <p className="text-sm text-gray-600">Tasks Done</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {worker?.performance.averageRating}
                </p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {worker?.performance.onTimeCompletion}%
                </p>
                <p className="text-sm text-gray-600">On Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offline Data Status */}
        <Card>
          <CardHeader>
            <CardTitle>Data Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Total Records</span>
                <Badge variant="outline">{offlineData.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Synced</span>
                <Badge className="bg-green-100 text-green-800">
                  {offlineData.filter(item => item.synced).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Pending Sync</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {offlineData.filter(item => !item.synced).length}
                </Badge>
              </div>
            </div>
            {offlineData.filter(item => !item.synced).length > 0 && (
              <Button 
                className="w-full mt-3"
                onClick={syncAllData}
                disabled={!isOnline}
              >
                <Upload className="h-4 w-4 mr-2" />
                Sync All Data
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Button variant="ghost" className="flex flex-col gap-1 h-auto py-2">
            <Activity className="h-5 w-5" />
            <span className="text-xs">Tasks</span>
          </Button>
          <Button variant="ghost" className="flex flex-col gap-1 h-auto py-2">
            <Camera className="h-5 w-5" />
            <span className="text-xs">Capture</span>
          </Button>
          <Button variant="ghost" className="flex flex-col gap-1 h-auto py-2">
            <MapPin className="h-5 w-5" />
            <span className="text-xs">Location</span>
          </Button>
          <Button variant="ghost" className="flex flex-col gap-1 h-auto py-2 relative">
            <Bell className="h-5 w-5" />
            <span className="text-xs">Alerts</span>
            {offlineData.filter(item => !item.synced).length > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {offlineData.filter(item => !item.synced).length}
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MobileFieldInterface;