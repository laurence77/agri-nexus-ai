import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { OfflineStatusIndicator } from '@/components/pwa';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Smartphone, 
  Database,
  CheckCircle2,
  AlertCircle,
  Activity,
  Users,
  Leaf,
  BarChart3,
  Camera,
  MapPin,
  Calendar
} from 'lucide-react';
import { OfflineService } from '@/services/pwa/offline-service';

/**
 * Offline Page
 * Shows when the app is offline and provides limited functionality
 */
export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [offlineService] = useState(() => new OfflineService());
  const [cachedData, setCachedData] = useState<any>(null);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    // Monitor online status
    const handleOnline = () => {
      setIsOnline(true);
      // Redirect to dashboard when back online
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    };

    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const loadOfflineData = async () => {
    try {
      // Get offline capabilities
      const capabilities = await offlineService.getOfflineCapabilities();
      setPendingActions(capabilities.pendingItems);

      // Try to load cached dashboard data
      const dashboardData = await offlineService.getCachedData('/api/dashboard');
      if (dashboardData) {
        setCachedData(dashboardData);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const handleRetryConnection = () => {
    window.location.reload();
  };

  const handleLogActivity = async () => {
    try {
      // Example of logging activity while offline
      await offlineService.storeOfflineData(
        'activity',
        {
          id: `activity_${Date.now()}`,
          type: 'field_visit',
          description: 'Offline field inspection',
          timestamp: new Date().toISOString(),
          location: { lat: 0, lng: 0 }, // Would use GPS
          notes: 'Recorded while offline'
        },
        'current-user-id', // Would get from auth
        'current-tenant-id', // Would get from auth
        'high'
      );

      alert('Activity logged offline - will sync when connected');
      loadOfflineData(); // Refresh pending count
    } catch (error) {
      console.error('Failed to log offline activity:', error);
    }
  };

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center max-w-md">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-400" />
          <h1 className="text-2xl font-bold text-white mb-2">Back Online!</h1>
          <p className="text-gray-300 mb-6">
            Connection restored. Redirecting to dashboard...
          </p>
          <div className="flex justify-center">
            <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AgriNexus AI</h1>
              <p className="text-xs text-gray-300">Offline Mode</p>
            </div>
          </div>

          <OfflineStatusIndicator 
            offlineService={offlineService}
            position="relative"
            showDetails={true}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Offline Status Banner */}
          <GlassCard className="p-6 border-red-500/30">
            <div className="flex items-center space-x-4">
              <WifiOff className="h-8 w-8 text-red-400" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">
                  You're Working Offline
                </h2>
                <p className="text-gray-300">
                  No internet connection detected. Some features are limited, but you can still:
                </p>
              </div>
              <GlassButton
                variant="primary"
                onClick={handleRetryConnection}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </GlassButton>
            </div>
          </GlassCard>

          {/* Available Offline Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <Camera className="h-12 w-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Photo Capture
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Take photos of crops and fields. They'll sync when you're back online.
              </p>
              <GlassButton variant="secondary" size="sm" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </GlassButton>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-green-400" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Log Activities
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Record field visits, treatments, and observations offline.
              </p>
              <GlassButton 
                variant="secondary" 
                size="sm" 
                className="w-full"
                onClick={handleLogActivity}
              >
                <Activity className="h-4 w-4 mr-2" />
                Log Activity
              </GlassButton>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-lg font-semibold text-white mb-2">
                View Cached Data
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Access previously loaded field and crop information.
              </p>
              <GlassButton variant="secondary" size="sm" className="w-full">
                <Database className="h-4 w-4 mr-2" />
                View Data
              </GlassButton>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold text-white mb-2">
                GPS Tracking
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Record locations and create geo-tagged activities.
              </p>
              <GlassButton variant="secondary" size="sm" className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Get Location
              </GlassButton>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Schedule Tasks
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Plan future activities and set reminders.
              </p>
              <GlassButton variant="secondary" size="sm" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Add Task
              </GlassButton>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-orange-400" />
              <h3 className="text-lg font-semibold text-white mb-2">
                View Reports
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Access cached analytics and field reports.
              </p>
              <GlassButton variant="secondary" size="sm" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </GlassButton>
            </GlassCard>
          </div>

          {/* Cached Data Summary */}
          {cachedData && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-400" />
                <span>Cached Dashboard Data</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {cachedData.fields?.length || 0}
                  </div>
                  <div className="text-xs text-gray-300">Fields</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {cachedData.activities?.length || 0}
                  </div>
                  <div className="text-xs text-gray-300">Activities</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {cachedData.sensors?.length || 0}
                  </div>
                  <div className="text-xs text-gray-300">Sensors</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {pendingActions}
                  </div>
                  <div className="text-xs text-gray-300">Pending Sync</div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Sync Status */}
          {pendingActions > 0 && (
            <GlassCard className="p-6 border-orange-500/30">
              <div className="flex items-center space-x-4">
                <AlertCircle className="h-8 w-8 text-orange-400" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {pendingActions} Items Waiting to Sync
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Your offline changes will automatically sync when internet connection is restored.
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Tips for Offline Use */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-green-400" />
              <span>Offline Tips</span>
            </h3>
            
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p>All your offline actions are saved locally and will sync automatically</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p>Photos and data are compressed to save storage space</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p>GPS location is captured even without internet connection</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p>Use voice notes feature to record observations hands-free</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}