import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  GlassCard, 
  GlassButton,
  QuickActionButton,
  WeatherWidget,
  MiniWeatherCard
} from '@/components/glass';
import { 
  Clock, 
  CheckCircle2, 
  Circle,
  Camera, 
  MapPin, 
  Calendar,
  User,
  Activity,
  Truck,
  Sprout,
  FileText,
  Send,
  ChevronRight,
  AlertTriangle,
  Timer,
  Target,
  Upload,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { DatabaseService } from '@/lib/supabase';

interface WorkerDashboardProps {
  className?: string;
}

interface WorkerTask {
  id: string;
  title: string;
  description: string;
  field_name: string;
  field_location: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  estimated_duration: number; // in minutes
  task_type: 'planting' | 'harvesting' | 'irrigation' | 'spraying' | 'transport' | 'maintenance';
  assigned_by: string;
  instructions?: string;
  photos_required: boolean;
  completion_notes?: string;
  started_at?: string;
  completed_at?: string;
}

interface WorkerDashboardData {
  worker: any;
  todayTasks: WorkerTask[];
  upcomingTasks: WorkerTask[];
  completedTasks: WorkerTask[];
  activeTask: WorkerTask | null;
  workSession: {
    clockedIn: boolean;
    clockInTime: string | null;
    totalHoursToday: number;
  };
  weather: any;
  notifications: any[];
}

/**
 * Worker Dashboard for Field Workers, Harvesters, and Drivers
 * Features: assigned tasks, check-in/out, task updates, photo upload
 */
export function WorkerDashboard({ className }: WorkerDashboardProps) {
  const { user, userRole, tenantId } = useAuth();
  const [data, setData] = useState<WorkerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<WorkerTask | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [taskNotes, setTaskNotes] = useState('');

  useEffect(() => {
    loadWorkerData();
    // Refresh data every 5 minutes
    const interval = setInterval(loadWorkerData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tenantId]);

  const loadWorkerData = async () => {
    if (!tenantId || !user) return;

    try {
      setLoading(true);
      const dbService = new DatabaseService();

      // Load worker profile and tasks
      const [workerProfile, allTasks] = await Promise.all([
        dbService.query('profiles', { id: user.id, tenant_id: tenantId }),
        dbService.query('activities', { 
          worker_id: user.id, 
          tenant_id: tenantId,
          date_filter: 'this_week'
        })
      ]);

      const worker = workerProfile[0];
      
      // Categorize tasks
      const now = new Date();
      const today = now.toDateString();
      
      const todayTasks = allTasks.filter(task => 
        new Date(task.scheduled_date).toDateString() === today && 
        task.status !== 'completed'
      );
      
      const upcomingTasks = allTasks.filter(task => 
        new Date(task.scheduled_date) > now && 
        task.status !== 'completed'
      );
      
      const completedTasks = allTasks.filter(task => 
        task.status === 'completed' &&
        new Date(task.completed_at).toDateString() === today
      );

      const activeTask = todayTasks.find(task => task.status === 'in_progress') || null;

      // Mock work session data
      const workSession = {
        clockedIn: worker?.work_status === 'active',
        clockInTime: worker?.last_clock_in || null,
        totalHoursToday: calculateTodayHours(worker?.last_clock_in, worker?.work_status === 'active')
      };

      // Generate mock weather and notifications
      const weather = generateMockWeather();
      const notifications = generateNotifications(todayTasks, upcomingTasks);

      setData({
        worker,
        todayTasks: todayTasks.map(mapTaskData),
        upcomingTasks: upcomingTasks.map(mapTaskData),
        completedTasks: completedTasks.map(mapTaskData),
        activeTask: activeTask ? mapTaskData(activeTask) : null,
        workSession,
        weather,
        notifications
      });
    } catch (error) {
      console.error('Worker dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapTaskData = (task: any): WorkerTask => ({
    id: task.id,
    title: task.activity_type.charAt(0).toUpperCase() + task.activity_type.slice(1),
    description: task.description || `${task.activity_type} activity`,
    field_name: task.field_name || 'Field',
    field_location: task.field_location || 'Location TBD',
    priority: task.priority || 'medium',
    status: task.status,
    due_date: task.scheduled_date,
    estimated_duration: task.estimated_duration || 120,
    task_type: task.activity_type,
    assigned_by: task.assigned_by_name || 'Farm Manager',
    instructions: task.instructions,
    photos_required: task.metadata?.photos_required || false,
    completion_notes: task.completion_notes,
    started_at: task.started_at,
    completed_at: task.completed_at
  });

  const calculateTodayHours = (clockInTime: string | null, isActive: boolean) => {
    if (!clockInTime) return 0;
    const clockIn = new Date(clockInTime);
    const now = new Date();
    const hours = isActive ? (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60) : 0;
    return Math.max(0, hours);
  };

  const generateMockWeather = () => ({
    temperature: 28,
    humidity: 65,
    conditions: 'Partly Cloudy',
    windSpeed: 12,
    uvIndex: 6
  });

  const generateNotifications = (todayTasks: any[], upcomingTasks: any[]) => [
    ...(todayTasks.length > 0 ? [{
      id: 1,
      type: 'info',
      title: 'Daily Tasks',
      message: `You have ${todayTasks.length} tasks scheduled for today`,
      timestamp: new Date()
    }] : []),
    ...(upcomingTasks.filter(t => new Date(t.due_date).getTime() - Date.now() < 24 * 60 * 60 * 1000).length > 0 ? [{
      id: 2,
      type: 'warning',
      title: 'Upcoming Deadlines',
      message: 'You have tasks due within 24 hours',
      timestamp: new Date()
    }] : [])
  ];

  const handleClockInOut = async () => {
    if (!data) return;

    try {
      const dbService = new DatabaseService();
      const isClockingIn = !data.workSession.clockedIn;
      
      await dbService.update('profiles', user!.id, {
        work_status: isClockingIn ? 'active' : 'inactive',
        last_clock_in: isClockingIn ? new Date().toISOString() : null,
        last_clock_out: !isClockingIn ? new Date().toISOString() : null
      });

      // Reload data to reflect changes
      loadWorkerData();
    } catch (error) {
      console.error('Clock in/out error:', error);
    }
  };

  const handleStartTask = async (task: WorkerTask) => {
    try {
      const dbService = new DatabaseService();
      await dbService.update('activities', task.id, {
        status: 'in_progress',
        started_at: new Date().toISOString()
      });
      
      setSelectedTask(task);
      loadWorkerData();
    } catch (error) {
      console.error('Start task error:', error);
    }
  };

  const handleCompleteTask = async (task: WorkerTask) => {
    try {
      const dbService = new DatabaseService();
      await dbService.update('activities', task.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_notes: taskNotes
      });
      
      setSelectedTask(null);
      setTaskNotes('');
      loadWorkerData();
    } catch (error) {
      console.error('Complete task error:', error);
    }
  };

  const handlePhotoUpload = async (taskId: string, file: File) => {
    setUploadingPhoto(true);
    try {
      // Mock photo upload - in real implementation, upload to Supabase Storage
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Photo uploaded for task:', taskId);
    } catch (error) {
      console.error('Photo upload error:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'planting': return <Sprout className="h-5 w-5" />;
      case 'harvesting': return <Target className="h-5 w-5" />;
      case 'irrigation': return <Activity className="h-5 w-5" />;
      case 'transport': return <Truck className="h-5 w-5" />;
      default: return <Circle className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className={cn('worker-dashboard space-y-6', className)}>
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/10 rounded-lg backdrop-blur-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <GlassCard className={cn('text-center py-12', className)}>
        <p className="text-gray-300">Unable to load worker dashboard</p>
      </GlassCard>
    );
  }

  return (
    <div className={cn('worker-dashboard space-y-6 p-4', className)}>
      {/* Header with Clock In/Out */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {data.worker?.full_name || 'Worker'}
          </h1>
          <p className="text-gray-300 text-sm">
            {data.workSession.clockedIn ? 'You are clocked in' : 'Ready to start your day?'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {data.workSession.clockedIn && (
            <div className="text-right text-sm">
              <p className="text-gray-300">Hours Today</p>
              <p className="text-white font-bold">
                {data.workSession.totalHoursToday.toFixed(1)}h
              </p>
            </div>
          )}
          
          <GlassButton
            variant={data.workSession.clockedIn ? 'danger' : 'primary'}
            size="field"
            onClick={handleClockInOut}
            className="min-w-[120px]"
          >
            <Clock className="h-5 w-5 mr-2" />
            {data.workSession.clockedIn ? 'Clock Out' : 'Clock In'}
          </GlassButton>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-white">{data.todayTasks.length}</div>
          <div className="text-xs text-gray-300">Today's Tasks</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{data.completedTasks.length}</div>
          <div className="text-xs text-gray-300">Completed</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{data.upcomingTasks.length}</div>
          <div className="text-xs text-gray-300">Upcoming</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {data.weather.temperature}°C
          </div>
          <div className="text-xs text-gray-300">Current Temp</div>
        </GlassCard>
      </div>

      {/* Active Task (if any) */}
      {data.activeTask && (
        <GlassCard variant="agricultural" className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                {getTaskIcon(data.activeTask.task_type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Active Task</h3>
                <p className="text-green-400 text-sm">In Progress</p>
              </div>
            </div>
            <Timer className="h-5 w-5 text-green-400 animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-white">{data.activeTask.title}</h4>
              <p className="text-gray-300 text-sm">{data.activeTask.description}</p>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{data.activeTask.field_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{data.activeTask.estimated_duration} min</span>
              </div>
            </div>

            {data.activeTask.instructions && (
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-white text-sm">{data.activeTask.instructions}</p>
              </div>
            )}

            <div className="flex space-x-3">
              {data.activeTask.photos_required && (
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    capture="camera"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(data.activeTask!.id, file);
                    }}
                  />
                  <GlassButton 
                    as="div"
                    variant="secondary" 
                    size="field" 
                    className="w-full cursor-pointer"
                    disabled={uploadingPhoto}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    {uploadingPhoto ? 'Uploading...' : 'Take Photo'}
                  </GlassButton>
                </label>
              )}
              
              <GlassButton
                variant="primary"
                size="field"
                onClick={() => handleCompleteTask(data.activeTask!)}
                className="flex-1"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Complete Task
              </GlassButton>
            </div>

            <textarea
              placeholder="Add completion notes (optional)..."
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm resize-none"
              rows={2}
            />
          </div>
        </GlassCard>
      )}

      {/* Today's Tasks */}
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Today's Tasks</h3>
          <span className="text-sm text-gray-300">
            {data.todayTasks.filter(t => t.status === 'completed').length} of {data.todayTasks.length} completed
          </span>
        </div>

        {data.todayTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-300">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tasks scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.todayTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border transition-colors',
                  task.status === 'completed' ? 'bg-green-500/10 border-green-500/30' :
                  task.status === 'in_progress' ? 'bg-blue-500/10 border-blue-500/30' :
                  'bg-white/5 border-white/10 hover:bg-white/10'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  )}>
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      getTaskIcon(task.task_type)
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-white">{task.title}</h4>
                      <span className={cn('text-xs px-2 py-1 rounded-full', getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{task.field_name} • {task.estimated_duration} min</p>
                  </div>
                </div>

                {task.status === 'pending' && !data.activeTask && (
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartTask(task)}
                  >
                    Start
                  </GlassButton>
                )}
                
                {task.status === 'in_progress' && (
                  <span className="text-blue-400 text-sm font-medium">In Progress</span>
                )}
                
                {task.status === 'completed' && (
                  <span className="text-green-400 text-sm font-medium">Completed</span>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Weather & Upcoming Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather Widget */}
        <MiniWeatherCard
          temperature={data.weather.temperature}
          conditions={data.weather.conditions}
          humidity={data.weather.humidity}
          windSpeed={data.weather.windSpeed}
        />

        {/* Upcoming Tasks Preview */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Tasks</h3>
          {data.upcomingTasks.length === 0 ? (
            <p className="text-gray-300 text-sm">No upcoming tasks</p>
          ) : (
            <div className="space-y-3">
              {data.upcomingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{task.title}</p>
                    <p className="text-gray-400 text-xs">
                      {task.field_name} • {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn('text-xs px-2 py-1 rounded-full', getPriorityColor(task.priority))}>
                    {task.priority}
                  </span>
                </div>
              ))}
              {data.upcomingTasks.length > 3 && (
                <p className="text-gray-400 text-xs text-center pt-2">
                  +{data.upcomingTasks.length - 3} more tasks
                </p>
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <QuickActionButton
          icon={<MessageSquare className="h-6 w-6" />}
          label="Report Issue"
          variant="warning"
          size="field"
          onClick={() => console.log('Report issue')}
        />
        <QuickActionButton
          icon={<FileText className="h-6 w-6" />}
          label="View Schedule"
          variant="secondary"
          size="field"
          onClick={() => console.log('View schedule')}
        />
      </div>
    </div>
  );
}

export default WorkerDashboard;