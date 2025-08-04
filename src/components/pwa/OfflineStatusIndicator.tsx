import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Database,
  Upload,
  X
} from 'lucide-react';
import { OfflineService, OfflineCapabilities } from '@/services/pwa/offline-service';

interface OfflineStatusIndicatorProps {
  offlineService?: OfflineService;
  className?: string;
  showDetails?: boolean;
  position?: 'fixed' | 'relative';
}

/**
 * Offline Status Indicator Component
 * Shows network status, sync progress, and offline capabilities
 */
export function OfflineStatusIndicator({ 
  offlineService,
  className,
  showDetails = false,
  position = 'fixed'
}: OfflineStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [capabilities, setCapabilities] = useState<OfflineCapabilities | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(showDetails);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial capabilities
    loadCapabilities();

    // Update capabilities periodically
    const interval = setInterval(loadCapabilities, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [offlineService]);

  const loadCapabilities = async () => {
    if (!offlineService) return;

    try {
      const caps = await offlineService.getOfflineCapabilities();
      setCapabilities(caps);
      setLastSyncTime(caps.lastSync);
    } catch (error) {
      console.error('Failed to load offline capabilities:', error);
    }
  };

  const handleSync = async () => {
    if (!offlineService || !isOnline || syncInProgress) return;

    setSyncInProgress(true);
    try {
      await offlineService.triggerSync();
      await loadCapabilities(); // Refresh capabilities after sync
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-400 bg-red-500/20';
    if (syncInProgress) return 'text-yellow-400 bg-yellow-500/20';
    if (capabilities?.pendingItems && capabilities.pendingItems > 0) {
      return 'text-orange-400 bg-orange-500/20';
    }
    return 'text-green-400 bg-green-500/20';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (syncInProgress) return <RefreshCw className="h-4 w-4 animate-spin" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncInProgress) return 'Syncing...';
    if (capabilities?.pendingItems && capabilities.pendingItems > 0) {
      return `${capabilities.pendingItems} pending`;
    }
    return 'Online';
  };

  if (!capabilities && !isOnline) {
    return null; // Don't show until we have data
  }

  return (
    <>
      {/* Main Status Indicator */}
      <div 
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer',
          getStatusColor(),
          'border-white/20 backdrop-filter backdrop-blur-md',
          position === 'fixed' && 'fixed bottom-4 right-4 z-50',
          className
        )}
        onClick={() => setShowDetailPanel(!showDetailPanel)}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        
        {capabilities?.pendingItems && capabilities.pendingItems > 0 && (
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
        )}
      </div>

      {/* Detailed Status Panel */}
      {showDetailPanel && (
        <div className={cn(
          'backdrop-filter backdrop-blur-md',
          position === 'fixed' 
            ? 'fixed bottom-20 right-4 z-50 w-80' 
            : 'absolute top-full right-0 w-80 mt-2'
        )}>
          <GlassCard className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                {getStatusIcon()}
                <span>Connection Status</span>
              </h3>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => setShowDetailPanel(false)}
              >
                <X className="h-4 w-4" />
              </GlassButton>
            </div>

            {/* Connection Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Network</span>
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className={cn(
                    'text-sm font-medium',
                    isOnline ? 'text-green-400' : 'text-red-400'
                  )}>
                    {isOnline ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Offline Capabilities */}
              {capabilities && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Offline Storage</span>
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-white">
                        {capabilities.hasIndexedDB ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Service Worker</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className={cn(
                        'h-4 w-4',
                        capabilities.hasServiceWorker ? 'text-green-400' : 'text-red-400'
                      )} />
                      <span className="text-sm text-white">
                        {capabilities.hasServiceWorker ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Storage Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Storage Used</span>
                      <span className="text-sm text-white">
                        {formatBytes(capabilities.usedStorage)} / {formatBytes(capabilities.estimatedStorage)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600/30 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-400 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((capabilities.usedStorage / capabilities.estimatedStorage) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Pending Items */}
                  {capabilities.pendingItems > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Pending Sync</span>
                      <div className="flex items-center space-x-2">
                        <Upload className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-orange-400 font-medium">
                          {capabilities.pendingItems} items
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Last Sync */}
                  {lastSyncTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Last Sync</span>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-white">
                          {lastSyncTime.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-6">
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleSync}
                disabled={!isOnline || syncInProgress}
                className="flex-1"
              >
                {syncInProgress ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Now
              </GlassButton>
              
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={loadCapabilities}
                className="flex-1"
              >
                <Database className="h-4 w-4 mr-2" />
                Refresh
              </GlassButton>
            </div>

            {/* Status Messages */}
            <div className="mt-4 text-xs text-gray-400 space-y-1">
              {!isOnline && (
                <p>• Working offline - changes will sync when connected</p>
              )}
              {capabilities?.pendingItems && capabilities.pendingItems > 0 && (
                <p>• {capabilities.pendingItems} items waiting to sync</p>
              )}
              {!capabilities?.hasServiceWorker && (
                <p>• Service Worker unavailable - limited offline support</p>
              )}
              {!capabilities?.hasIndexedDB && (
                <p>• IndexedDB unavailable - no offline storage</p>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}

export default OfflineStatusIndicator;