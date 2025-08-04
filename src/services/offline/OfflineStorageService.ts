/**
 * Offline Storage Service using IndexedDB
 * Handles offline data synchronization for rural connectivity
 */

export interface OfflineItem {
  id: string;
  type: 'activity' | 'sensor_reading' | 'form_submission' | 'image_upload' | 'marketplace_order';
  data: any;
  timestamp: number;
  tenantId: string;
  userId: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastAttempt?: number;
  error?: string;
}

export interface OfflineConfig {
  dbName: string;
  version: number;
  maxRetries: number;
  retryDelay: number;
  maxStorageItems: number;
}

export class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private config: OfflineConfig;

  constructor(config: Partial<OfflineConfig> = {}) {
    this.config = {
      dbName: 'AgriPlatformOffline',
      version: 1,
      maxRetries: 3,
      retryDelay: 5000,
      maxStorageItems: 1000,
      ...config
    };
  }

  /**
   * Initialize IndexedDB database
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('offline_items')) {
          const store = db.createObjectStore('offline_items', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('tenantId', 'tenantId', { unique: false });
        }

        if (!db.objectStoreNames.contains('cached_data')) {
          const cacheStore = db.createObjectStore('cached_data', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync_conflicts')) {
          const conflictStore = db.createObjectStore('sync_conflicts', { keyPath: 'id' });
          conflictStore.createIndex('resolved', 'resolved', { unique: false });
        }
      };
    });
  }

  /**
   * Store data for offline sync
   */
  async storeForSync(
    type: OfflineItem['type'],
    data: any,
    tenantId: string,
    userId: string
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const item: OfflineItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      tenantId,
      userId,
      syncStatus: 'pending',
      retryCount: 0
    };

    const transaction = this.db.transaction(['offline_items'], 'readwrite');
    const store = transaction.objectStore('offline_items');
    
    await new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Clean up old items if we exceed max storage
    await this.cleanupOldItems();

    // Register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(`sync-${type}`);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }

    return item.id;
  }

  /**
   * Get all pending sync items
   */
  async getPendingSyncItems(type?: OfflineItem['type']): Promise<OfflineItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['offline_items'], 'readonly');
    const store = transaction.objectStore('offline_items');
    
    let request: IDBRequest;
    if (type) {
      const index = store.index('type');
      request = index.getAll(type);
    } else {
      request = store.getAll();
    }

    const items = await new Promise<OfflineItem[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return items.filter(item => item.syncStatus === 'pending' || item.syncStatus === 'failed');
  }

  /**
   * Update sync status of an item
   */
  async updateSyncStatus(
    id: string, 
    status: OfflineItem['syncStatus'], 
    error?: string
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['offline_items'], 'readwrite');
    const store = transaction.objectStore('offline_items');
    
    const item = await new Promise<OfflineItem>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (item) {
      item.syncStatus = status;
      item.lastAttempt = Date.now();
      if (error) {
        item.error = error;
        item.retryCount++;
      }

      await new Promise((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  }

  /**
   * Remove synced items
   */
  async removeSyncedItems(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['offline_items'], 'readwrite');
    const store = transaction.objectStore('offline_items');
    const index = store.index('syncStatus');
    
    const syncedItems = await new Promise<OfflineItem[]>((resolve, reject) => {
      const request = index.getAll('synced');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    let removedCount = 0;
    for (const item of syncedItems) {
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(item.id);
        request.onsuccess = () => {
          removedCount++;
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    }

    return removedCount;
  }

  /**
   * Cache data for offline access
   */
  async cacheData(key: string, data: any, type: string, ttl?: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const cachedItem = {
      key,
      data,
      type,
      timestamp: Date.now(),
      ttl: ttl || (7 * 24 * 60 * 60 * 1000) // Default 7 days
    };

    const transaction = this.db.transaction(['cached_data'], 'readwrite');
    const store = transaction.objectStore('cached_data');
    
    await new Promise((resolve, reject) => {
      const request = store.put(cachedItem);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cached_data'], 'readonly');
    const store = transaction.objectStore('cached_data');
    
    const item = await new Promise<any>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      await this.removeCachedData(key);
      return null;
    }

    return item.data;
  }

  /**
   * Remove cached data
   */
  async removeCachedData(key: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cached_data'], 'readwrite');
    const store = transaction.objectStore('cached_data');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get offline statistics
   */
  async getOfflineStats(): Promise<{
    pendingItems: number;
    syncedItems: number;
    failedItems: number;
    cachedItems: number;
    totalSize: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const [offlineItems, cachedItems] = await Promise.all([
      this.getAllOfflineItems(),
      this.getAllCachedItems()
    ]);

    const stats = {
      pendingItems: offlineItems.filter(item => item.syncStatus === 'pending').length,
      syncedItems: offlineItems.filter(item => item.syncStatus === 'synced').length,
      failedItems: offlineItems.filter(item => item.syncStatus === 'failed').length,
      cachedItems: cachedItems.length,
      totalSize: this.calculateStorageSize(offlineItems, cachedItems)
    };

    return stats;
  }

  /**
   * Clean up old items to manage storage
   */
  private async cleanupOldItems(): Promise<void> {
    if (!this.db) return;

    const items = await this.getAllOfflineItems();
    
    if (items.length > this.config.maxStorageItems) {
      // Sort by timestamp (oldest first) and remove synced items
      const sortedItems = items
        .filter(item => item.syncStatus === 'synced')
        .sort((a, b) => a.timestamp - b.timestamp);

      const itemsToRemove = sortedItems.slice(0, items.length - this.config.maxStorageItems);
      
      const transaction = this.db.transaction(['offline_items'], 'readwrite');
      const store = transaction.objectStore('offline_items');

      for (const item of itemsToRemove) {
        store.delete(item.id);
      }
    }
  }

  /**
   * Get all offline items
   */
  private async getAllOfflineItems(): Promise<OfflineItem[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['offline_items'], 'readonly');
    const store = transaction.objectStore('offline_items');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all cached items
   */
  private async getAllCachedItems(): Promise<any[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['cached_data'], 'readonly');
    const store = transaction.objectStore('cached_data');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Calculate approximate storage size
   */
  private calculateStorageSize(offlineItems: OfflineItem[], cachedItems: any[]): number {
    const offlineSize = JSON.stringify(offlineItems).length;
    const cacheSize = JSON.stringify(cachedItems).length;
    return offlineSize + cacheSize;
  }

  /**
   * Handle sync conflicts
   */
  async handleSyncConflict(
    localItem: OfflineItem,
    serverData: any,
    resolution: 'local' | 'server' | 'merge'
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const conflict = {
      id: `conflict_${Date.now()}`,
      localItem,
      serverData,
      resolution,
      resolved: false,
      timestamp: Date.now()
    };

    const transaction = this.db.transaction(['sync_conflicts'], 'readwrite');
    const store = transaction.objectStore('sync_conflicts');
    
    await new Promise((resolve, reject) => {
      const request = store.add(conflict);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get unresolved sync conflicts
   */
  async getUnresolvedConflicts(): Promise<any[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['sync_conflicts'], 'readonly');
    const store = transaction.objectStore('sync_conflicts');
    const index = store.index('resolved');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['offline_items', 'cached_data', 'sync_conflicts'], 'readwrite');
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('offline_items').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('cached_data').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('sync_conflicts').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ]);
  }
}

// Singleton instance
export const offlineStorageService = new OfflineStorageService();
export default offlineStorageService;