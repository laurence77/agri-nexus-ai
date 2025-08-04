/**
 * Offline Service for Rural Connectivity
 * Manages offline data storage, background sync, and conflict resolution
 * Optimized for African agricultural environments with poor connectivity
 */

import { DatabaseService } from '@/lib/supabase';

export interface OfflineData {
  id: string;
  type: 'activity' | 'sensor_reading' | 'image' | 'user_data' | 'sync_metadata';
  data: any;
  timestamp: Date;
  userId: string;
  tenantId: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  lastSyncAttempt?: Date;
  syncAttempts: number;
  conflictData?: any;
  priority: 'high' | 'medium' | 'low';
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
  errors: string[];
}

export interface ConflictResolution {
  strategy: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  resolvedData?: any;
  metadata?: Record<string, any>;
}

export interface OfflineCapabilities {
  isOnline: boolean;
  hasIndexedDB: boolean;
  hasCacheAPI: boolean;
  hasServiceWorker: boolean;
  estimatedStorage: number;
  usedStorage: number;
  lastSync: Date | null;
  pendingItems: number;
}

/**
 * Offline Service Class
 * Handles all offline functionality including data caching, background sync, and conflict resolution
 */
export class OfflineService {
  private dbName = 'AgriNexusOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private syncQueue: OfflineData[] = [];
  private syncInProgress = false;
  private onlineStatusCallbacks: Array<(isOnline: boolean) => void> = [];
  private storageQuota = 50 * 1024 * 1024; // 50MB default quota

  constructor() {
    this.initializeOfflineService();
    this.setupOnlineStatusMonitoring();
    this.setupPeriodicSync();
  }

  /**
   * Initialize the offline service and IndexedDB
   */
  private async initializeOfflineService(): Promise<void> {
    try {
      // Check for IndexedDB support
      if (!('indexedDB' in window)) {
        throw new Error('IndexedDB not supported');
      }

      // Open IndexedDB database
      this.db = await this.openDatabase();
      this.isInitialized = true;

      console.log('Offline service initialized successfully');

      // Load pending sync items
      await this.loadSyncQueue();

      // Register service worker if supported
      if ('serviceWorker' in navigator) {
        await this.registerServiceWorker();
      }

    } catch (error) {
      console.error('Failed to initialize offline service:', error);
      throw error;
    }
  }

  /**
   * Open IndexedDB database with proper schema
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create offline data store
        const offlineStore = db.createObjectStore('offlineData', { keyPath: 'id' });
        offlineStore.createIndex('type', 'type', { unique: false });
        offlineStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        offlineStore.createIndex('userId', 'userId', { unique: false });
        offlineStore.createIndex('tenantId', 'tenantId', { unique: false });

        // Create cache metadata store
        const cacheStore = db.createObjectStore('cacheMetadata', { keyPath: 'key' });
        cacheStore.createIndex('expiry', 'expiry', { unique: false });

        // Create user preferences store
        const prefsStore = db.createObjectStore('userPreferences', { keyPath: 'userId' });

        console.log('IndexedDB schema created');
      };
    });
  }

  /**
   * Register service worker for background sync and caching
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Listen for sync events
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        registration.addEventListener('sync', (event: any) => {
          if (event.tag === 'background-sync') {
            event.waitUntil(this.performBackgroundSync());
          }
        });
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Setup online/offline status monitoring
   */
  private setupOnlineStatusMonitoring(): void {
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.notifyOnlineStatusChange(true);
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.notifyOnlineStatusChange(false);
    });
  }

  /**
   * Setup periodic sync attempts
   */
  private setupPeriodicSync(): void {
    // Attempt sync every 5 minutes when online
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.triggerSync();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Store data for offline use
   */
  async storeOfflineData(
    type: OfflineData['type'],
    data: any,
    userId: string,
    tenantId: string,
    priority: OfflineData['priority'] = 'medium'
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Offline service not initialized');
    }

    const offlineData: OfflineData = {
      id: this.generateId(),
      type,
      data,
      timestamp: new Date(),
      userId,
      tenantId,
      syncStatus: 'pending',
      syncAttempts: 0,
      priority
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.add(offlineData);

      request.onsuccess = () => {
        this.syncQueue.push(offlineData);
        console.log('Data stored offline:', offlineData.id);
        resolve(offlineData.id);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve offline data by type
   */
  async getOfflineData(
    type?: OfflineData['type'],
    userId?: string,
    tenantId?: string
  ): Promise<OfflineData[]> {
    if (!this.isInitialized) {
      throw new Error('Offline service not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as OfflineData[];

        // Apply filters
        if (type) {
          results = results.filter(item => item.type === type);
        }
        if (userId) {
          results = results.filter(item => item.userId === userId);
        }
        if (tenantId) {
          results = results.filter(item => item.tenantId === tenantId);
        }

        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cache API responses for offline use
   */
  async cacheResponse(key: string, data: any, expiryMinutes: number = 60): Promise<void> {
    if (!this.isInitialized) return;

    const cacheData = {
      key,
      data,
      timestamp: new Date(),
      expiry: new Date(Date.now() + expiryMinutes * 60 * 1000)
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cacheMetadata'], 'readwrite');
      const store = transaction.objectStore('cacheMetadata');
      const request = store.put(cacheData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve cached data
   */
  async getCachedData(key: string): Promise<any | null> {
    if (!this.isInitialized) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cacheMetadata'], 'readonly');
      const store = transaction.objectStore('cacheMetadata');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if cache has expired
        if (new Date() > new Date(result.expiry)) {
          this.deleteCachedData(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete cached data
   */
  async deleteCachedData(key: string): Promise<void> {
    if (!this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cacheMetadata'], 'readwrite');
      const store = transaction.objectStore('cacheMetadata');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Trigger background sync
   */
  async triggerSync(): Promise<SyncResult> {
    if (this.syncInProgress || !navigator.onLine) {
      return { success: false, synced: 0, failed: 0, conflicts: 0, errors: ['Sync already in progress or offline'] };
    }

    this.syncInProgress = true;
    console.log('Starting background sync...');

    try {
      const result = await this.performSync();
      console.log('Sync completed:', result);
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      return { 
        success: false, 
        synced: 0, 
        failed: this.syncQueue.length, 
        conflicts: 0, 
        errors: [error instanceof Error ? error.message : 'Unknown sync error'] 
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Perform the actual sync operation
   */
  private async performSync(): Promise<SyncResult> {
    const dbService = new DatabaseService();
    let synced = 0;
    let failed = 0;
    let conflicts = 0;
    const errors: string[] = [];

    // Sort by priority and timestamp
    const sortedQueue = [...this.syncQueue].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    for (const item of sortedQueue) {
      try {
        await this.updateSyncStatus(item.id, 'syncing');
        
        const syncResult = await this.syncSingleItem(item, dbService);
        
        if (syncResult.success) {
          if (syncResult.conflict) {
            await this.handleConflict(item, syncResult.conflictData);
            conflicts++;
          } else {
            await this.updateSyncStatus(item.id, 'synced');
            synced++;
          }
        } else {
          await this.updateSyncStatus(item.id, 'failed');
          await this.incrementSyncAttempts(item.id);
          failed++;
          errors.push(syncResult.error || 'Unknown sync error');
        }
      } catch (error) {
        console.error('Error syncing item:', item.id, error);
        await this.updateSyncStatus(item.id, 'failed');
        await this.incrementSyncAttempts(item.id);
        failed++;
        errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Remove successfully synced items from queue
    this.syncQueue = this.syncQueue.filter(item => item.syncStatus !== 'synced');

    return { success: true, synced, failed, conflicts, errors };
  }

  /**
   * Sync a single item to the server
   */
  private async syncSingleItem(item: OfflineData, dbService: DatabaseService): Promise<{
    success: boolean;
    conflict?: boolean;
    conflictData?: any;
    error?: string;
  }> {
    try {
      switch (item.type) {
        case 'activity':
          return await this.syncActivity(item, dbService);
        case 'sensor_reading':
          return await this.syncSensorReading(item, dbService);
        case 'image':
          return await this.syncImage(item, dbService);
        case 'user_data':
          return await this.syncUserData(item, dbService);
        default:
          return { success: false, error: `Unknown data type: ${item.type}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sync failed' 
      };
    }
  }

  /**
   * Sync agricultural activity data
   */
  private async syncActivity(item: OfflineData, dbService: DatabaseService): Promise<{
    success: boolean;
    conflict?: boolean;
    conflictData?: any;
    error?: string;
  }> {
    try {
      // Check if activity already exists (for conflict detection)
      const existing = await dbService.query('activities', { 
        id: item.data.id,
        tenant_id: item.tenantId 
      });

      if (existing.length > 0) {
        const serverData = existing[0];
        const clientData = item.data;

        // Check for conflicts (server data newer than client data)
        if (new Date(serverData.updated_at) > new Date(clientData.updated_at)) {
          return {
            success: false,
            conflict: true,
            conflictData: { server: serverData, client: clientData }
          };
        }
      }

      // Insert or update activity
      if (existing.length > 0) {
        await dbService.update('activities', item.data.id, {
          ...item.data,
          updated_at: new Date().toISOString()
        });
      } else {
        await dbService.insert('activities', {
          ...item.data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Activity sync failed' 
      };
    }
  }

  /**
   * Sync sensor reading data
   */
  private async syncSensorReading(item: OfflineData, dbService: DatabaseService): Promise<{
    success: boolean;
    conflict?: boolean;
    conflictData?: any;
    error?: string;
  }> {
    try {
      // Sensor readings are typically append-only, so no conflict resolution needed
      await dbService.insert('sensor_readings', {
        ...item.data,
        created_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sensor reading sync failed' 
      };
    }
  }

  /**
   * Sync image data
   */
  private async syncImage(item: OfflineData, dbService: DatabaseService): Promise<{
    success: boolean;
    conflict?: boolean;
    conflictData?: any;
    error?: string;
  }> {
    try {
      // Upload image to storage service (Supabase Storage)
      // This is a simplified implementation
      const imageUrl = await this.uploadImage(item.data.imageData, item.data.fileName);
      
      // Store image metadata
      await dbService.insert('images', {
        id: item.data.id,
        field_id: item.data.fieldId,
        tenant_id: item.tenantId,
        image_url: imageUrl,
        metadata: item.data.metadata,
        created_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Image sync failed' 
      };
    }
  }

  /**
   * Sync user data
   */
  private async syncUserData(item: OfflineData, dbService: DatabaseService): Promise<{
    success: boolean;
    conflict?: boolean;
    conflictData?: any;
    error?: string;
  }> {
    try {
      await dbService.update('profiles', item.userId, {
        ...item.data,
        updated_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'User data sync failed' 
      };
    }
  }

  /**
   * Handle sync conflicts
   */
  private async handleConflict(item: OfflineData, conflictData: any): Promise<void> {
    // Update item with conflict status and data
    await this.updateOfflineData(item.id, {
      syncStatus: 'conflict',
      conflictData
    });

    console.log('Conflict detected for item:', item.id);
    
    // In a real implementation, you might:
    // 1. Show user a conflict resolution UI
    // 2. Apply automatic merge strategies
    // 3. Log conflicts for manual review
  }

  /**
   * Resolve a conflict with user choice
   */
  async resolveConflict(itemId: string, resolution: ConflictResolution): Promise<boolean> {
    try {
      const item = await this.getOfflineDataById(itemId);
      if (!item || item.syncStatus !== 'conflict') {
        throw new Error('Conflict item not found');
      }

      let resolvedData: any;

      switch (resolution.strategy) {
        case 'client_wins':
          resolvedData = item.data;
          break;
        case 'server_wins':
          resolvedData = item.conflictData?.server;
          break;
        case 'merge':
          resolvedData = this.mergeConflictData(item.data, item.conflictData?.server);
          break;
        case 'manual':
          resolvedData = resolution.resolvedData;
          break;
        default:
          throw new Error('Invalid resolution strategy');
      }

      // Update item with resolved data
      await this.updateOfflineData(itemId, {
        data: resolvedData,
        syncStatus: 'pending',
        conflictData: undefined
      });

      // Add back to sync queue
      const updatedItem = await this.getOfflineDataById(itemId);
      if (updatedItem) {
        this.syncQueue.push(updatedItem);
      }

      return true;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return false;
    }
  }

  /**
   * Merge conflict data using simple strategy
   */
  private mergeConflictData(clientData: any, serverData: any): any {
    // Simple merge strategy - server data takes precedence for system fields,
    // client data for user-modified fields
    return {
      ...serverData,
      ...clientData,
      // System fields from server
      id: serverData.id,
      created_at: serverData.created_at,
      // Keep the latest update time
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Get current offline capabilities and status
   */
  async getOfflineCapabilities(): Promise<OfflineCapabilities> {
    const storage = await this.estimateStorage();
    const pendingItems = await this.getPendingItemsCount();
    const lastSync = await this.getLastSyncTime();

    return {
      isOnline: navigator.onLine,
      hasIndexedDB: 'indexedDB' in window,
      hasCacheAPI: 'caches' in window,
      hasServiceWorker: 'serviceWorker' in navigator,
      estimatedStorage: storage.quota,
      usedStorage: storage.used,
      lastSync,
      pendingItems
    };
  }

  /**
   * Background sync for service worker
   */
  async performBackgroundSync(): Promise<void> {
    console.log('Performing background sync...');
    try {
      await this.triggerSync();
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  /**
   * Clear all offline data (for troubleshooting)
   */
  async clearOfflineData(): Promise<void> {
    if (!this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.clear();

      request.onsuccess = () => {
        this.syncQueue = [];
        console.log('Offline data cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Helper methods
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadSyncQueue(): Promise<void> {
    const pendingData = await this.getOfflineData();
    this.syncQueue = pendingData.filter(item => 
      item.syncStatus === 'pending' || item.syncStatus === 'failed'
    );
  }

  private async updateSyncStatus(id: string, status: OfflineData['syncStatus']): Promise<void> {
    await this.updateOfflineData(id, { 
      syncStatus: status,
      lastSyncAttempt: new Date()
    });
  }

  private async incrementSyncAttempts(id: string): Promise<void> {
    const item = await this.getOfflineDataById(id);
    if (item) {
      await this.updateOfflineData(id, { 
        syncAttempts: item.syncAttempts + 1 
      });
    }
  }

  private async updateOfflineData(id: string, updates: Partial<OfflineData>): Promise<void> {
    if (!this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          const updatedItem = { ...item, ...updates };
          const putRequest = store.put(updatedItem);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Item not found'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  private async getOfflineDataById(id: string): Promise<OfflineData | null> {
    if (!this.isInitialized) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async estimateStorage(): Promise<{ quota: number; used: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota || this.storageQuota,
        used: estimate.usage || 0
      };
    }
    return { quota: this.storageQuota, used: 0 };
  }

  private async getPendingItemsCount(): Promise<number> {
    const pendingData = await this.getOfflineData();
    return pendingData.filter(item => 
      item.syncStatus === 'pending' || item.syncStatus === 'failed'
    ).length;
  }

  private async getLastSyncTime(): Promise<Date | null> {
    const syncedData = await this.getOfflineData();
    const lastSyncedItem = syncedData
      .filter(item => item.syncStatus === 'synced' && item.lastSyncAttempt)
      .sort((a, b) => 
        new Date(b.lastSyncAttempt!).getTime() - new Date(a.lastSyncAttempt!).getTime()
      )[0];

    return lastSyncedItem ? new Date(lastSyncedItem.lastSyncAttempt!) : null;
  }

  private async uploadImage(imageData: string, fileName: string): Promise<string> {
    // Mock implementation - in production, upload to Supabase Storage
    // Return a mock URL
    return `https://storage.agrinexus.ai/images/${fileName}`;
  }

  private notifyOnlineStatusChange(isOnline: boolean): void {
    this.onlineStatusCallbacks.forEach(callback => callback(isOnline));
  }

  /**
   * Register callback for online status changes
   */
  onOnlineStatusChange(callback: (isOnline: boolean) => void): void {
    this.onlineStatusCallbacks.push(callback);
  }

  /**
   * Unregister online status callback
   */
  offOnlineStatusChange(callback: (isOnline: boolean) => void): void {
    const index = this.onlineStatusCallbacks.indexOf(callback);
    if (index > -1) {
      this.onlineStatusCallbacks.splice(index, 1);
    }
  }
}

export default OfflineService;