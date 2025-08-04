// Progressive Web App Components
// Offline-first functionality for rural connectivity challenges

export { OfflineStatusIndicator } from './OfflineStatusIndicator';
export { SyncConflictResolver } from './SyncConflictResolver';

// Re-export PWA service types for convenience
export type {
  OfflineData,
  SyncResult,
  ConflictResolution,
  OfflineCapabilities
} from '@/services/pwa/offline-service';

// PWA Component metadata
export const PWA_COMPONENTS_METADATA = {
  offlineStatusIndicator: {
    title: 'Offline Status Indicator',
    description: 'Real-time network and sync status display for offline-first functionality',
    features: [
      'Network connectivity monitoring',
      'Sync progress tracking',
      'Storage usage visualization',
      'Pending items counter',
      'Service Worker status'
    ],
    useCase: 'Essential for rural areas with poor connectivity'
  },
  syncConflictResolver: {
    title: 'Sync Conflict Resolver',
    description: 'User-friendly interface for resolving data conflicts during sync',
    features: [
      'Side-by-side conflict comparison',
      'Multiple resolution strategies',
      'Field-level diff visualization',
      'Batch conflict resolution',
      'Auto-merge capabilities'
    ],
    useCase: 'Handles conflicts when multiple users edit same data offline'
  }
} as const;

// PWA Configuration
export const PWA_CONFIG = {
  serviceWorker: {
    enabled: true,
    path: '/sw.js',
    scope: '/',
    updateViaCache: 'none',
    skipWaiting: true,
    clientsClaim: true
  },
  caching: {
    strategies: {
      static: 'cacheFirst',
      api: 'networkFirst',
      images: 'staleWhileRevalidate',
      fallback: 'cacheOnly'
    },
    maxAge: {
      static: 365 * 24 * 60 * 60 * 1000, // 1 year
      dynamic: 7 * 24 * 60 * 60 * 1000,   // 1 week
      api: 5 * 60 * 1000                   // 5 minutes
    }
  },
  sync: {
    backgroundSync: true,
    retryInterval: 5 * 60 * 1000, // 5 minutes
    maxRetries: 5,
    batchSize: 50
  },
  storage: {
    indexedDB: true,
    quota: 50 * 1024 * 1024, // 50MB
    cleanup: {
      enabled: true,
      interval: 24 * 60 * 60 * 1000, // Daily
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }
} as const;

// PWA Installation prompt helper
export const PWA_INSTALL = {
  /**
   * Check if PWA can be installed
   */
  canInstall: (): boolean => {
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
  },

  /**
   * Prompt user to install PWA
   */
  promptInstall: async (): Promise<boolean> => {
    try {
      // This would be triggered by beforeinstallprompt event
      // Implementation depends on the event being captured
      return false;
    } catch (error) {
      console.error('PWA install prompt failed:', error);
      return false;
    }
  },

  /**
   * Check if app is running as PWA
   */
  isPWA: (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           document.referrer.includes('android-app://') ||
           (window.navigator as any).standalone === true;
  }
};

// PWA Utility functions
export const pwaUtils = {
  /**
   * Initialize PWA features
   */
  init: async (): Promise<boolean> => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register(
          PWA_CONFIG.serviceWorker.path,
          {
            scope: PWA_CONFIG.serviceWorker.scope,
            updateViaCache: PWA_CONFIG.serviceWorker.updateViaCache as ServiceWorkerUpdateViaCache
          }
        );

        console.log('PWA Service Worker registered:', registration);

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          console.log('New service worker version found');
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('PWA initialization failed:', error);
      return false;
    }
  },

  /**
   * Check if device supports PWA features
   */
  checkSupport: () => {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      indexedDB: 'indexedDB' in window,
      cacheAPI: 'caches' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      pushNotifications: 'serviceWorker' in navigator && 'PushManager' in window,
      webShare: 'share' in navigator,
      webAppManifest: 'webkitGetUserMedia' in navigator // Basic check
    };
  },

  /**
   * Get PWA installation status
   */
  getInstallStatus: () => {
    return {
      canInstall: PWA_INSTALL.canInstall(),
      isPWA: PWA_INSTALL.isPWA(),
      hasServiceWorker: 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null
    };
  },

  /**
   * Handle PWA app updates
   */
  handleUpdate: async (skipWaiting: boolean = false) => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting && skipWaiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  }
};

// Export default object for convenient imports
export default {
  OfflineStatusIndicator,
  SyncConflictResolver,
  PWA_COMPONENTS_METADATA,
  PWA_CONFIG,
  PWA_INSTALL,
  pwaUtils
};