import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sync, 
  Upload,
  Download,
  WifiOff,
  Wifi,
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  CloudUpload,
  CloudDownload,
  Server,
  Activity,
  FileCheck,
  AlertCircle,
  Shield,
  History,
  Trash2
} from 'lucide-react';
import { useOfflineSync } from '@/lib/offline-sync';

interface SyncMetrics {
  totalRecords: number;
  pendingUploads: number;
  syncedRecords: number;
  failedRecords: number;
  lastSyncTime: Date | null;
  syncInProgress: boolean;
  dataSize: {
    local: number;
    pending: number;
  };
  conflicts: number;
  backups: number;
}

interface DataConflict {
  id: string;
  table: string;
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  timestamp: Date;
  resolved: boolean;
}

export function DataSyncManager() {
  const {
    syncStatus,
    syncData,
    getPendingData,
    forceSyncAll,
    createBackup,
    restoreBackup
  } = useOfflineSync();

  const [metrics, setMetrics] = useState<SyncMetrics>({
    totalRecords: 0,
    pendingUploads: 0,
    syncedRecords: 0,
    failedRecords: 0,
    lastSyncTime: null,
    syncInProgress: false,
    dataSize: { local: 0, pending: 0 },
    conflicts: 0,
    backups: 0
  });

  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);

  const loadSyncMetrics = useCallback(async () => {
    try {
      // Load pending data to calculate metrics
      const pendingData = await getPendingData();
      const totalRecords = pendingData.length;
      const syncedRecords = pendingData.filter((item: { syncStatus?: string }) => item.syncStatus === 'synced').length;
      const failedRecords = pendingData.filter((item: { syncStatus?: string }) => item.syncStatus === 'failed').length;

      // Calculate data sizes (rough estimates)
      const localSize = Math.round(syncStatus.localDataSize / 1024 / 1024 * 100) / 100; // MB
      const pendingSize = Math.round((totalRecords - syncedRecords) * 0.001 * 100) / 100; // Estimate

      // Load conflicts from localStorage
      const storedConflicts = localStorage.getItem('data_conflicts');
      const conflictList = storedConflicts ? JSON.parse(storedConflicts) : [];
      setConflicts(conflictList);

      // Load backup count
      const backupMetadata = localStorage.getItem('backup_metadata') || '[]';
      const backups = JSON.parse(backupMetadata);

      setMetrics({
        totalRecords,
        pendingUploads: syncStatus.pendingActions,
        syncedRecords,
        failedRecords: syncStatus.failedActions,
        lastSyncTime: syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime) : null,
        syncInProgress: isSyncing,
        dataSize: {
          local: localSize,
          pending: pendingSize
        },
        conflicts: conflictList.filter((c: { resolved?: boolean }) => !c.resolved).length,
        backups: backups.length
      });
    } catch (error) {
      console.error('Error loading sync metrics:', error);
    }
  }, [getPendingData, syncStatus, isSyncing]);

  useEffect(() => {
    loadSyncMetrics();
    const interval = setInterval(loadSyncMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [loadSyncMetrics]);

  const handleForceSyncAll = async () => {
    if (!syncStatus.isOnline) {
      alert('Cannot sync while offline. Please connect to the internet and try again.');
      return;
    }

    setIsSyncing(true);
    try {
      await forceSyncAll();
      alert('Data synchronization completed successfully!');
      await loadSyncMetrics();
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateBackup = async () => {
    setBackupInProgress(true);
    try {
      const backup = await createBackup();
      alert(`Backup created successfully! ID: ${backup.backupId}\nSize: ${Math.round(backup.size / 1024)} KB`);
      await loadSyncMetrics();
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleRestoreBackup = async () => {
    const backupId = prompt('Enter backup ID to restore:');
    if (!backupId) return;

    if (!confirm('This will replace all current data with the backup. Are you sure?')) {
      return;
    }

    try {
      const success = await restoreBackup(backupId);
      if (success) {
        alert('Data restored successfully!');
        await loadSyncMetrics();
      } else {
        alert('Restore failed. Please check the backup ID and try again.');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Restore failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const resolveConflict = (conflictId: string, useLocal: boolean) => {
    const updatedConflicts = conflicts.map(conflict => {
      if (conflict.id === conflictId) {
        return {
          ...conflict,
          resolved: true,
          resolution: useLocal ? 'local' : 'server'
        };
      }
      return conflict;
    });

    setConflicts(updatedConflicts);
    localStorage.setItem('data_conflicts', JSON.stringify(updatedConflicts));
    loadSyncMetrics();
  };

  const clearSyncedData = () => {
    if (!confirm('Clear all synced data from local storage? This will free up space but require re-sync when needed.')) {
      return;
    }

    try {
      // Clear synced data from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('synced_') || key.startsWith('cached_')) {
          localStorage.removeItem(key);
        }
      });

      alert('Synced data cleared successfully!');
      loadSyncMetrics();
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getSyncStatusColor = () => {
    if (!syncStatus.isOnline) return 'bg-red-100 text-red-800';
    if (metrics.failedRecords > 0) return 'bg-yellow-100 text-yellow-800';
    if (metrics.pendingUploads > 0) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getSyncStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (metrics.syncInProgress) return 'Syncing...';
    if (metrics.failedRecords > 0) return 'Sync Issues';
    if (metrics.pendingUploads > 0) return 'Pending Sync';
    return 'All Synced';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Synchronization</h1>
        <p className="text-gray-600">Manage offline data sync and backup operations</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {syncStatus.isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                <Badge className={getSyncStatusColor()}>
                  {getSyncStatusText()}
                </Badge>
              </div>
              <Activity className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metrics.pendingUploads}</p>
                <p className="text-sm text-gray-600">Pending Uploads</p>
              </div>
              <Upload className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metrics.syncedRecords}</p>
                <p className="text-sm text-gray-600">Synced Records</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metrics.dataSize.local} MB</p>
                <p className="text-sm text-gray-600">Local Storage</p>
              </div>
              <HardDrive className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Progress */}
      {metrics.totalRecords > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sync Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Sync Progress</span>
                  <span>
                    {metrics.syncedRecords} / {metrics.totalRecords} records
                    ({Math.round((metrics.syncedRecords / metrics.totalRecords) * 100)}%)
                  </span>
                </div>
                <Progress 
                  value={(metrics.syncedRecords / metrics.totalRecords) * 100} 
                  className="h-2" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{metrics.syncedRecords} Synced</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>{metrics.pendingUploads} Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>{metrics.failedRecords} Failed</span>
                </div>
              </div>

              {metrics.lastSyncTime && (
                <p className="text-sm text-gray-600">
                  Last sync: {metrics.lastSyncTime.toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sync className="h-5 w-5" />
              Data Synchronization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={handleForceSyncAll}
                disabled={!syncStatus.isOnline || isSyncing}
                className="w-full"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-4 w-4 mr-2" />
                    Force Sync All Data
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={clearSyncedData}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Synced Data
              </Button>

              {!syncStatus.isOnline && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <WifiOff className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900">Offline Mode</p>
                      <p className="text-yellow-800">
                        Data will be queued for sync when connection is restored.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup & Restore
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={handleCreateBackup}
                disabled={backupInProgress}
                className="w-full"
                variant="outline"
              >
                {backupInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={handleRestoreBackup}
                className="w-full"
              >
                <CloudDownload className="h-4 w-4 mr-2" />
                Restore from Backup
              </Button>

              <div className="text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Available Backups:</span>
                  <span>{metrics.backups}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Storage Used:</span>
                  <span>{metrics.dataSize.local} MB</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Conflicts */}
      {metrics.conflicts > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Data Conflicts ({metrics.conflicts})
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowConflicts(!showConflicts)}
              >
                {showConflicts ? 'Hide' : 'Show'} Conflicts
              </Button>
            </div>
          </CardHeader>
          {showConflicts && (
            <CardContent>
              <div className="space-y-4">
                {conflicts.filter(c => !c.resolved).map((conflict) => (
                  <div key={conflict.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">
                          Conflict in {conflict.table}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {conflict.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="destructive">Conflict</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900 mb-2">Local Version</p>
                        <pre className="text-xs text-blue-800 overflow-x-auto">
                          {JSON.stringify(conflict.localData, null, 2)}
                        </pre>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="font-medium text-green-900 mb-2">Server Version</p>
                        <pre className="text-xs text-green-800 overflow-x-auto">
                          {JSON.stringify(conflict.serverData, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => resolveConflict(conflict.id, true)}
                        variant="outline"
                      >
                        Use Local Version
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => resolveConflict(conflict.id, false)}
                        variant="outline"
                      >
                        Use Server Version
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Sync Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Mock sync history - in real implementation, load from service */}
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Farmer data sync completed</p>
                  <p className="text-xs text-gray-600">45 records synchronized</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Backup created successfully</p>
                  <p className="text-xs text-gray-600">3.2 MB backup file</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Partial sync failed</p>
                  <p className="text-xs text-gray-600">3 records failed to sync</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">3 hours ago</span>
            </div>
          </div>

          {metrics.totalRecords === 0 && (
            <div className="text-center py-8">
              <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No sync activity yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Sync activity will appear here as data is synchronized
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DataSyncManager;