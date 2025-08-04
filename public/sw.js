/**
 * Service Worker for AgriNexus AI PWA
 * Handles caching, background sync, and offline functionality for rural connectivity
 */

const CACHE_NAME = 'agrinexus-v1';
const STATIC_CACHE_NAME = 'agrinexus-static-v1';
const DYNAMIC_CACHE_NAME = 'agrinexus-dynamic-v1';

// Files to cache immediately for offline use
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/fields',
  '/offline',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = {
  '/api/fields': 'networkFirst',
  '/api/crops': 'networkFirst', 
  '/api/dashboard': 'networkFirst',
  '/api/weather': 'cacheFirst',
  '/api/ai/crop-monitoring': 'networkOnly'
};

// Background sync tags
const SYNC_TAGS = {
  SENSOR_DATA: 'sensor-data-sync',
  ACTIVITY_LOG: 'activity-log-sync',
  IMAGE_UPLOAD: 'image-upload-sync',
  OFFLINE_ACTIONS: 'offline-actions-sync'
};

/**
 * Service Worker Installation Event
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

/**
 * Service Worker Activation Event
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

/**
 * Fetch Event Handler - Network requests interception
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different request types
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith('/_next/static/') || 
             url.pathname.startsWith('/static/')) {
    event.respondWith(handleStaticAsset(request));
  } else if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

/**
 * Handle API requests with different caching strategies
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pattern = Object.keys(API_CACHE_PATTERNS).find(p => 
    url.pathname.startsWith(p)
  );
  
  const strategy = pattern ? API_CACHE_PATTERNS[pattern] : 'networkFirst';
  
  try {
    switch (strategy) {
      case 'networkFirst':
        return await networkFirst(request, DYNAMIC_CACHE_NAME);
      case 'cacheFirst':
        return await cacheFirst(request, DYNAMIC_CACHE_NAME);
      case 'networkOnly':
        return await fetch(request);
      default:
        return await networkFirst(request, DYNAMIC_CACHE_NAME);
    }
  } catch (error) {
    console.error('API request failed:', error);
    
    // Return offline fallback for critical endpoints
    if (url.pathname.includes('/dashboard')) {
      return new Response(JSON.stringify({
        offline: true,
        message: 'Dashboard data unavailable offline',
        cached: false
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      });
    }
    
    throw error;
  }
}

/**
 * Handle static asset requests
 */
async function handleStaticAsset(request) {
  return await cacheFirst(request, STATIC_CACHE_NAME);
}

/**
 * Handle image requests with caching
 */
async function handleImageRequest(request) {
  try {
    return await cacheFirst(request, DYNAMIC_CACHE_NAME);
  } catch (error) {
    // Return placeholder image for failed image loads
    return new Response(
      '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image Unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

/**
 * Handle page requests with offline fallback
 */
async function handlePageRequest(request) {
  try {
    return await networkFirst(request, DYNAMIC_CACHE_NAME);
  } catch (error) {
    // Return offline page for navigation requests
    const cache = await caches.open(STATIC_CACHE_NAME);
    const offlinePage = await cache.match('/offline');
    
    if (offlinePage) {
      return offlinePage;
    }
    
    // Fallback offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AgriNexus - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 2rem;
              background: linear-gradient(135deg, #1e3a8a 0%, #059669 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
            }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { margin-bottom: 0.5rem; }
            p { opacity: 0.8; margin-bottom: 2rem; }
            button {
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              color: white;
              cursor: pointer;
              backdrop-filter: blur(10px);
            }
            button:hover { background: rgba(255,255,255,0.3); }
          </style>
        </head>
        <body>
          <div class="icon">🌾</div>
          <h1>You're Offline</h1>
          <p>AgriNexus is working offline. Some features may be limited.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 503
    });
  }
}

/**
 * Network First caching strategy
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Cache First strategy  
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

/**
 * Background Sync Event Handler
 */
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.SENSOR_DATA:
      event.waitUntil(syncSensorData());
      break;
    case SYNC_TAGS.ACTIVITY_LOG:
      event.waitUntil(syncActivityLog());
      break;
    case SYNC_TAGS.IMAGE_UPLOAD:
      event.waitUntil(syncImageUploads());
      break;
    case SYNC_TAGS.OFFLINE_ACTIONS:
      event.waitUntil(syncOfflineActions());
      break;
    default:
      console.log('Unknown sync tag:', event.tag);
  }
});

/**
 * Sync sensor data when back online
 */
async function syncSensorData() {
  try {
    console.log('Syncing sensor data...');
    
    // Get offline service from main thread
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      clients[0].postMessage({
        type: 'SYNC_REQUEST',
        data: { syncType: 'sensor_data' }
      });
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Sensor data sync failed:', error);
    throw error;
  }
}

/**
 * Sync activity logs
 */
async function syncActivityLog() {
  try {
    console.log('Syncing activity logs...');
    
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      clients[0].postMessage({
        type: 'SYNC_REQUEST', 
        data: { syncType: 'activity' }
      });
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Activity log sync failed:', error);
    throw error;
  }
}

/**
 * Sync uploaded images
 */
async function syncImageUploads() {
  try {
    console.log('Syncing image uploads...');
    
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      clients[0].postMessage({
        type: 'SYNC_REQUEST',
        data: { syncType: 'image' }
      });
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Image upload sync failed:', error);
    throw error;
  }
}

/**
 * Sync all offline actions
 */
async function syncOfflineActions() {
  try {
    console.log('Syncing all offline actions...');
    
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      clients[0].postMessage({
        type: 'SYNC_REQUEST',
        data: { syncType: 'all' }
      });
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Offline actions sync failed:', error);
    throw error;
  }
}

/**
 * Push notification handler
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'AgriNexus notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'AgriNexus', options)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      // Try to focus existing client
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new client if none found
      if (clients.openWindow) {
        const url = data.url || '/dashboard';
        return clients.openWindow(url);
      }
    })
  );
});

/**
 * Message handler for communication with main thread
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLAIM_CLIENTS':
      self.clients.claim();
      break;
    case 'CACHE_UPDATE':
      updateCache(data);
      break;
    case 'SYNC_STATUS':
      event.ports[0].postMessage({
        type: 'SYNC_STATUS_RESPONSE',
        data: { syncing: false } // Simplified status
      });
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

/**
 * Update cache with new data
 */
async function updateCache(data) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(data.content), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(data.url, response);
    console.log('Cache updated for:', data.url);
  } catch (error) {
    console.error('Cache update failed:', error);
  }
}

/**
 * Periodic cache cleanup
 */
async function cleanupCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const request of requests) {
      try {
        const response = await cache.match(request);
        if (response) {
          const cached = new Date(response.headers.get('date')).getTime();
          if (now - cached > maxAge) {
            await cache.delete(request);
            console.log('Cleaned up old cache entry:', request.url);
          }
        }
      } catch (error) {
        console.error('Error cleaning cache entry:', error);
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}

// Run cache cleanup every 6 hours
setInterval(cleanupCache, 6 * 60 * 60 * 1000);

console.log('AgriNexus Service Worker loaded successfully');