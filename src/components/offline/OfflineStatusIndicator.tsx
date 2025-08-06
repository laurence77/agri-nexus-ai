import React, { useState, useEffect } from 'react';
import { WifiIcon, WifiSlashIcon, CloudArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { offlineSyncService } from '@/lib/offline-sync';

interface OfflineStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export default function OfflineStatusIndicator({ className = '', showDetails = false }: OfflineStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({
    pendingActions: 0,
    failedActions: 0,
    lastSyncTime: null as number | null,
    localDataSize: 0
  });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update sync status periodically
    const updateSyncStatus = async () => {
      try {
        const status = await offlineSyncService.getSyncStatus();
        setSyncStatus({
          pendingActions: status.pendingActions,
          failedActions: status.failedActions,
          lastSyncTime: status.lastSyncTime,
          localDataSize: status.localDataSize
        });
      } catch (error) {
        console.error('Failed to get sync status:', error);
      }
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 5000); // Update every 5 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const formatDataSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600';
    if (syncStatus.failedActions > 0) return 'text-yellow-600';
    if (syncStatus.pendingActions > 0) return 'text-blue-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!isOnline) return WifiSlashIcon;
    if (syncStatus.failedActions > 0) return ExclamationTriangleIcon;
    if (syncStatus.pendingActions > 0) return CloudArrowUpIcon;
    return WifiIcon;
  };

  const StatusIcon = getStatusIcon();

  const handleForceSync = async () => {
    if (!isOnline) return;
    
    try {
      // Force sync critical tables
      const criticalTables = ['farms', 'crops', 'livestock'];
      for (const table of criticalTables) {
        await offlineSyncService.forceSyncTable(table);
      }
      
      // Update status after sync
      const status = await offlineSyncService.getSyncStatus();
      setSyncStatus({
        pendingActions: status.pendingActions,
        failedActions: status.failedActions,
        lastSyncTime: status.lastSyncTime,
        localDataSize: status.localDataSize
      });
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <StatusIcon className={`w-5 h-5 ${getStatusColor()}`} />
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
        {syncStatus.pendingActions > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {syncStatus.pendingActions} syncing
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${getStatusColor()} border-gray-300 hover:bg-gray-50`}
      >
        <StatusIcon className={`w-5 h-5 ${getStatusColor()}`} />
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
        {syncStatus.pendingActions > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {syncStatus.pendingActions}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Sync Status</h3>
              <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isOnline ? 'Connected' : 'Offline Mode'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {syncStatus.pendingActions}
                  </div>
                  <div className="text-sm text-blue-800">Pending Syncs</div>
                </div>
                
                <div className={`p-3 rounded-lg ${syncStatus.failedActions > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className={`text-2xl font-bold ${syncStatus.failedActions > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {syncStatus.failedActions}
                  </div>
                  <div className={`text-sm ${syncStatus.failedActions > 0 ? 'text-red-800' : 'text-gray-600'}`}>
                    Failed Syncs
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Last Sync</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatLastSync(syncStatus.lastSyncTime)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">Local Data</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDataSize(syncStatus.localDataSize)}
                  </span>
                </div>

                {isOnline && (
                  <button
                    onClick={handleForceSync}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Force Sync Now
                  </button>
                )}

                {!isOnline && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">
                          Offline Mode Active
                        </h4>
                        <p className="text-sm text-yellow-700">
                          Your changes are being saved locally and will sync when connection is restored.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}