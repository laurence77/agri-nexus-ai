import { openDB, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';

export interface SyncAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  userId: string;
  tenantId: string;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface OfflineData {
  id: string;
  table: string;
  data: any;
  lastModified: number;
  syncStatus: 'local' | 'synced' | 'conflict';
}

export class OfflineSyncService {
  private db: IDBPDatabase | null = null;
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private maxRetries = 5;

  constructor() {
    this.initializeDB();
    this.setupEventListeners();
  }

  private async initializeDB() {
    this.db = await openDB('AgriNexusOfflineDB', 1, {
      upgrade(db) {
        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status');
          syncStore.createIndex('timestamp', 'timestamp');
          syncStore.createIndex('table', 'table');
        }

        // Offline data stores for each critical table
        const tables = ['farms', 'crops', 'livestock', 'financial_records', 'profiles', 'weather_data'];
        
        tables.forEach(tableName => {
          if (!db.objectStoreNames.contains(tableName)) {
            const store = db.createObjectStore(tableName, { keyPath: 'id' });
            store.createIndex('lastModified', 'lastModified');
            store.createIndex('syncStatus', 'syncStatus');
          }
        });

        // Conflict resolution store
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id' });
          conflictStore.createIndex('table', 'table');
          conflictStore.createIndex('timestamp', 'timestamp');
        }

        // Backup metadata store
        if (!db.objectStoreNames.contains('backupMetadata')) {
          const backupStore = db.createObjectStore('backupMetadata', { keyPath: 'id' });
          backupStore.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }

  private setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Periodic sync when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingActions();
      }
    }, 30000); // Sync every 30 seconds when online
  }

  /**
   * Queue an action for sync when online
   */
  async queueAction(
    type: SyncAction['type'],
    table: string,
    data: any,
    userId: string,
    tenantId: string
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const actionId = uuidv4();
    const action: SyncAction = {
      id: actionId,
      type,
      table,
      data,
      userId,
      tenantId,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    await this.db.add('syncQueue', action);

    // Store data locally for immediate UI updates
    await this.storeOfflineData(table, data);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingActions();
    }

    return actionId;
  }

  /**
   * Store data locally for offline access
   */
  private async storeOfflineData(table: string, data: any) {
    if (!this.db) return;

    const offlineData: OfflineData = {
      id: data.id || uuidv4(),
      table,
      data,
      lastModified: Date.now(),
      syncStatus: 'local'
    };

    await this.db.put(table, offlineData);
  }

  /**
   * Get offline data for a table
   */
  async getOfflineData(table: string): Promise<OfflineData[]> {
    if (!this.db) return [];
    return await this.db.getAll(table);
  }

  /**
   * Sync pending actions with the server
   */
  private async syncPendingActions() {
    if (!this.db || this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;

    try {
      const pendingActions = await this.db.getAllFromIndex(
        'syncQueue', 
        'status', 
        IDBKeyRange.only('pending')
      );

      for (const action of pendingActions) {
        await this.processSyncAction(action);
      }

      // Also sync any local changes
      await this.syncLocalChanges();

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Process individual sync action
   */
  private async processSyncAction(action: SyncAction) {
    if (!this.db) return;

    try {
      // Update status to syncing
      action.status = 'syncing';
      await this.db.put('syncQueue', action);

      const { supabase } = await import('@/lib/supabase');
      
      let result;
      switch (action.type) {
        case 'CREATE':
          result = await supabase
            .from(action.table)
            .insert(action.data)
            .select()
            .single();
          break;
        
        case 'UPDATE':
          result = await supabase
            .from(action.table)
            .update(action.data)
            .eq('id', action.data.id)
            .select()
            .single();
          break;
        
        case 'DELETE':
          result = await supabase
            .from(action.table)
            .delete()
            .eq('id', action.data.id);
          break;
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Mark as completed
      action.status = 'completed';
      await this.db.put('syncQueue', action);

      // Update local data with server response
      if (result.data) {
        await this.updateOfflineData(action.table, result.data);
      }

      // Log successful sync
      await this.logSyncActivity(action, true);

    } catch (error) {
      action.retryCount++;
      action.errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (action.retryCount >= this.maxRetries) {
        action.status = 'failed';
      } else {
        action.status = 'pending';
      }

      await this.db.put('syncQueue', action);
      await this.logSyncActivity(action, false, action.errorMessage);
    }
  }

  /**
   * Update offline data with server response
   */
  private async updateOfflineData(table: string, serverData: any) {
    if (!this.db) return;

    const offlineData: OfflineData = {
      id: serverData.id,
      table,
      data: serverData,
      lastModified: Date.now(),
      syncStatus: 'synced'
    };

    await this.db.put(table, offlineData);
  }

  /**
   * Sync local changes that haven't been queued yet
   */
  private async syncLocalChanges() {
    if (!this.db) return;

    const tables = ['farms', 'crops', 'livestock', 'financial_records', 'profiles'];
    
    for (const table of tables) {
      const localData = await this.db.getAllFromIndex(
        table, 
        'syncStatus', 
        IDBKeyRange.only('local')
      );

      for (const item of localData) {
        // Check if this item has a pending sync action
        const existingAction = await this.findPendingSyncAction(table, item.data.id);
        
        if (!existingAction) {
          // Queue for sync
          await this.queueAction('UPDATE', table, item.data, item.data.userId, item.data.tenantId);
        }
      }
    }
  }

  /**
   * Find pending sync action for specific item
   */
  private async findPendingSyncAction(table: string, itemId: string): Promise<SyncAction | null> {
    if (!this.db) return null;

    const pendingActions = await this.db.getAllFromIndex(
      'syncQueue', 
      'status', 
      IDBKeyRange.only('pending')
    );

    return pendingActions.find(action => 
      action.table === table && action.data.id === itemId
    ) || null;
  }

  /**
   * Create full backup of offline data
   */
  async createBackup(): Promise<{ backupId: string; size: number }> {
    if (!this.db) throw new Error('Database not initialized');

    const backupId = uuidv4();
    const backupData: any = {};
    const tables = ['farms', 'crops', 'livestock', 'financial_records', 'profiles', 'syncQueue'];

    // Collect all data
    for (const table of tables) {
      backupData[table] = await this.db.getAll(table);
    }

    // Store backup metadata
    const metadata = {
      id: backupId,
      timestamp: Date.now(),
      tables: tables,
      recordCounts: Object.fromEntries(
        Object.entries(backupData).map(([table, data]) => [table, (data as any[]).length])
      )
    };

    await this.db.add('backupMetadata', metadata);

    // In a real implementation, you would upload this to cloud storage
    // For now, we'll store it in localStorage as a JSON string
    try {
      const backupString = JSON.stringify(backupData);
      localStorage.setItem(`backup_${backupId}`, backupString);
      
      return {
        backupId,
        size: backupString.length
      };
    } catch (error) {
      throw new Error('Failed to create backup: Storage quota exceeded');
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const backupString = localStorage.getItem(`backup_${backupId}`);
      if (!backupString) {
        throw new Error('Backup not found');
      }

      const backupData = JSON.parse(backupString);
      
      // Clear existing data and restore
      const tables = Object.keys(backupData);
      for (const table of tables) {
        if (this.db.objectStoreNames.contains(table)) {
          const tx = this.db.transaction(table, 'readwrite');
          await tx.store.clear();
          
          for (const item of backupData[table]) {
            await tx.store.add(item);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Backup restore failed:', error);
      return false;
    }
  }

  /**
   * Get sync status and statistics
   */
  async getSyncStatus(): Promise<{
    isOnline: boolean;
    pendingActions: number;
    lastSyncTime: number | null;
    failedActions: number;
    localDataSize: number;
  }> {
    if (!this.db) {
      return {
        isOnline: this.isOnline,
        pendingActions: 0,
        lastSyncTime: null,
        failedActions: 0,
        localDataSize: 0
      };
    }

    const pendingActions = await this.db.getAllFromIndex('syncQueue', 'status', IDBKeyRange.only('pending'));
    const failedActions = await this.db.getAllFromIndex('syncQueue', 'status', IDBKeyRange.only('failed'));
    const completedActions = await this.db.getAllFromIndex('syncQueue', 'status', IDBKeyRange.only('completed'));
    
    const lastSyncTime = completedActions.length > 0 
      ? Math.max(...completedActions.map(a => a.timestamp))
      : null;

    // Calculate local data size (rough estimate)
    let localDataSize = 0;
    const tables = ['farms', 'crops', 'livestock', 'financial_records', 'profiles'];
    for (const table of tables) {
      const data = await this.db.getAll(table);
      localDataSize += JSON.stringify(data).length;
    }

    return {
      isOnline: this.isOnline,
      pendingActions: pendingActions.length,
      lastSyncTime,
      failedActions: failedActions.length,
      localDataSize
    };
  }

  /**
   * Log sync activity for monitoring
   */
  private async logSyncActivity(action: SyncAction, success: boolean, errorMessage?: string) {
    try {
      const { SecurityService } = await import('@/lib/security');
      
      await SecurityService.logUserActivity({
        userId: action.userId,
        tenantId: action.tenantId,
        action: 'offline_sync',
        resourceType: action.table,
        resourceId: action.data.id,
        success,
        errorMessage,
        metadata: {
          syncActionId: action.id,
          syncType: action.type,
          retryCount: action.retryCount,
          isOnline: this.isOnline
        }
      });
    } catch (error) {
      console.error('Failed to log sync activity:', error);
    }
  }

  /**
   * Clear old sync logs to prevent storage bloat
   */
  async cleanupOldSyncData(olderThanDays: number = 30) {
    if (!this.db) return;

    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    // Clean up completed sync actions
    const completedActions = await this.db.getAllFromIndex('syncQueue', 'status', IDBKeyRange.only('completed'));
    const oldActions = completedActions.filter(action => action.timestamp < cutoffTime);
    
    for (const action of oldActions) {
      await this.db.delete('syncQueue', action.id);
    }

    // Clean up old backup metadata (keep last 5)
    const backups = await this.db.getAll('backupMetadata');
    const sortedBackups = backups.sort((a, b) => b.timestamp - a.timestamp);
    const oldBackups = sortedBackups.slice(5);
    
    for (const backup of oldBackups) {
      await this.db.delete('backupMetadata', backup.id);
      localStorage.removeItem(`backup_${backup.id}`);
    }
  }

  /**
   * Force sync specific table
   */
  async forceSyncTable(table: string) {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Get server data
      const { data: serverData, error } = await supabase
        .from(table)
        .select('*');

      if (error) throw error;

      if (this.db && serverData) {
        // Clear local data and replace with server data
        const tx = this.db.transaction(table, 'readwrite');
        await tx.store.clear();
        
        for (const item of serverData) {
          const offlineData: OfflineData = {
            id: item.id,
            table,
            data: item,
            lastModified: Date.now(),
            syncStatus: 'synced'
          };
          await tx.store.add(offlineData);
        }
      }
    } catch (error) {
      throw new Error(`Failed to sync ${table}: ${error}`);
    }
  }
}

/**
 * Hook for using offline sync in React components
 */
export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = React.useState({
    isOnline: navigator.onLine,
    pendingActions: 0,
    lastSyncTime: null as number | null,
    failedActions: 0,
    localDataSize: 0
  });

  React.useEffect(() => {
    const updateSyncStatus = async () => {
      const status = await offlineSyncService.getSyncStatus();
      setSyncStatus(status);
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const syncData = async (data: any) => {
    // Default implementation - can be customized per use case
    return await offlineSyncService.queueAction(
      'CREATE',
      'agent_collections',
      data,
      data.agentId || 'unknown',
      data.tenantId || 'default'
    );
  };

  const getPendingData = async () => {
    return await offlineSyncService.getOfflineData('agent_collections');
  };

  const markAsSynced = async (itemId: string) => {
    // Implementation to mark specific item as synced
    console.log('Marking as synced:', itemId);
  };

  const forceSyncAll = async () => {
    if (!syncStatus.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    
    // Force sync all critical tables
    const tables = ['farms', 'crops', 'livestock', 'financial_records', 'profiles'];
    for (const table of tables) {
      await offlineSyncService.forceSyncTable(table);
    }
  };

  const createBackup = async () => {
    return await offlineSyncService.createBackup();
  };

  const restoreBackup = async (backupId: string) => {
    return await offlineSyncService.restoreFromBackup(backupId);
  };

  return {
    syncStatus,
    syncData,
    getPendingData,
    markAsSynced,
    forceSyncAll,
    createBackup,
    restoreBackup
  };
}


// Export singleton instance
export const offlineSyncService = new OfflineSyncService();
export default offlineSyncService;