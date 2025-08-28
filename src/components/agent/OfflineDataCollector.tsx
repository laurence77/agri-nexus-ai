import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Download, 
  WifiOff, 
  Wifi, 
  Database,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Sync,
  MapPin,
  Signal,
  Battery,
  Save
} from 'lucide-react';
import { useOfflineSync } from '@/lib/offline-sync';

interface CollectedData {
  id: string;
  type: 'farmer' | 'farm' | 'livestock' | 'crop' | 'survey';
  data: Record<string, any>;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: Date;
  status: 'draft' | 'completed' | 'synced' | 'error';
  agentId: string;
  formTemplateId: string;
  photos?: string[];
  signature?: string;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingUploads: number;
  syncInProgress: boolean;
  syncErrors: number;
}

export function OfflineDataCollector() {
  const [collectedData, setCollectedData] = useState<CollectedData[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingUploads: 0,
    syncInProgress: false,
    syncErrors: 0
  });
  const [storageUsed, setStorageUsed] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);

  const { syncData, getPendingData, markAsSynced } = useOfflineSync();

  const loadCollectedData = useCallback(() => {
    try {
      const stored = localStorage.getItem('collected_data');
      if (stored) {
        const data = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setCollectedData(data);
        updateSyncStatus(data);
      }
    } catch (error) {
      console.error('Error loading collected data:', error);
    }
  }, []);

  useEffect(() => {
    loadCollectedData();
    initializeLocationTracking();
    initializeBatteryTracking();
    setupNetworkMonitoring();
    calculateStorageUsage();
  }, [loadCollectedData]);

  const saveCollectedData = (data: CollectedData[]) => {
    try {
      localStorage.setItem('collected_data', JSON.stringify(data));
      setCollectedData(data);
      updateSyncStatus(data);
      calculateStorageUsage();
    } catch (error) {
      console.error('Error saving collected data:', error);
    }
  };

  const updateSyncStatus = (data: CollectedData[]) => {
    const pending = data.filter(item => item.status !== 'synced').length;
    const errors = data.filter(item => item.status === 'error').length;
    
    setSyncStatus(prev => ({
      ...prev,
      pendingUploads: pending,
      syncErrors: errors
    }));
  };

  const initializeLocationTracking = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const initializeBatteryTracking = async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      } catch (error) {
        console.error('Battery API not supported');
      }
    }
  };

  const setupNetworkMonitoring = () => {
    const updateOnlineStatus = () => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  };

  const calculateStorageUsage = () => {
    try {
      const data = localStorage.getItem('collected_data') || '';
      const photos = localStorage.getItem('collected_photos') || '';
      const totalSize = new Blob([data + photos]).size;
      setStorageUsed(Math.round(totalSize / 1024 / 1024 * 100) / 100); // MB
    } catch (error) {
      console.error('Error calculating storage usage:', error);
    }
  };

  const handleSync = async () => {
    if (!syncStatus.isOnline) {
      alert('Cannot sync while offline. Please connect to the internet.');
      return;
    }

    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));

    try {
      const pendingData = collectedData.filter(item => item.status !== 'synced');
      
      for (const item of pendingData) {
        try {
          await syncData(item);
          
          // Update item status to synced
          const updatedData = collectedData.map(d => 
            d.id === item.id ? { ...d, status: 'synced' as const } : d
          );
          saveCollectedData(updatedData);
          
          // Mark as synced in offline storage
          markAsSynced(item.id);
          
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
          
          // Mark item as error
          const updatedData = collectedData.map(d => 
            d.id === item.id ? { ...d, status: 'error' as const } : d
          );
          saveCollectedData(updatedData);
        }
      }

      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        syncInProgress: false
      }));

    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }));
    }
  };

  const exportData = () => {
    const dataToExport = collectedData.map(item => ({
      ...item,
      timestamp: item.timestamp.toISOString()
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collected_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearSyncedData = () => {
    if (window.confirm('Clear all synced data? This will free up storage space.')) {
      const unsyncedData = collectedData.filter(item => item.status !== 'synced');
      saveCollectedData(unsyncedData);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'synced':
        return <Sync className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'synced':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRecords = collectedData.length;
  const completedRecords = collectedData.filter(d => d.status === 'completed' || d.status === 'synced').length;
  const syncedRecords = collectedData.filter(d => d.status === 'synced').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Data Collection</h1>
        <p className="text-gray-600">Offline-first bulk data collection and synchronization</p>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {syncStatus.isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <Signal className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{syncStatus.pendingUploads}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <Upload className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{storageUsed} MB</p>
                <p className="text-sm text-gray-600">Storage Used</p>
              </div>
              <Database className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{batteryLevel}%</p>
                <p className="text-sm text-gray-600">Battery</p>
              </div>
              <Battery className={`h-5 w-5 ${batteryLevel > 20 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-xs">
                  {currentLocation ? 'GPS Active' : 'No GPS'}
                </p>
              </div>
              <MapPin className={`h-5 w-5 ${currentLocation ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Collection Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Total Records</span>
                <span>{totalRecords}</span>
              </div>
              <Progress value={totalRecords > 0 ? 100 : 0} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completed</span>
                <span>{completedRecords} / {totalRecords}</span>
              </div>
              <Progress 
                value={totalRecords > 0 ? (completedRecords / totalRecords) * 100 : 0} 
                className="h-2" 
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Synced</span>
                <span>{syncedRecords} / {totalRecords}</span>
              </div>
              <Progress 
                value={totalRecords > 0 ? (syncedRecords / totalRecords) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleSync}
              disabled={!syncStatus.isOnline || syncStatus.syncInProgress || syncStatus.pendingUploads === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {syncStatus.syncInProgress ? (
                <>
                  <Sync className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Sync Data ({syncStatus.pendingUploads})
                </>
              )}
            </Button>

            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button variant="outline" onClick={clearSyncedData}>
              <Save className="h-4 w-4 mr-2" />
              Clean Storage
            </Button>
          </div>

          {syncStatus.lastSync && (
            <p className="text-sm text-gray-600 mt-2">
              Last sync: {syncStatus.lastSync.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Collections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Collections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collectedData.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No data collected yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Start collecting data to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {collectedData.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="font-medium capitalize">
                        {item.type} - {item.data.name || item.data.farmName || 'Unnamed'}
                      </p>
                      <div className="text-sm text-gray-600">
                        <p>ID: {item.id}</p>
                        <p>Collected: {item.timestamp.toLocaleString()}</p>
                        {item.location && (
                          <p>Location: {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    {item.photos && item.photos.length > 0 && (
                      <Badge variant="outline">
                        {item.photos.length} photos
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {collectedData.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Showing 10 of {collectedData.length} records
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Status Warning */}
      {!syncStatus.isOnline && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border border-orange-300 rounded-lg p-4 max-w-sm">
          <div className="flex items-start gap-2">
            <WifiOff className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Working Offline</p>
              <p className="text-sm text-orange-800">
                Data will be saved locally and synced when connection is restored.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfflineDataCollector;