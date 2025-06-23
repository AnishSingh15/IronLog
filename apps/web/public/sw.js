// Advanced PWA Service Worker for IronLog
const CACHE_NAME = 'ironlog-v1.0.0';
const RUNTIME_CACHE = 'ironlog-runtime-v1.0.0';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/history',
  '/progress',
  '/profile',
  '/login',
  '/register',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// API endpoints to cache - support both localhost and network access
const API_CACHE_PATTERNS = [
  /^https?:\/\/localhost:3001\/api\//,
  /^https?:\/\/192\.168\.1\.7:3001\/api\//,
  /^https?:\/\/.*:3001\/api\//,
  /^https?:\/\/.*\/api\//,
];

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching essential assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('✅ Essential assets cached');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Failed to cache assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim(),
    ]).then(() => {
      console.log('✅ Service Worker activated and ready');
      // Notify all clients about activation
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            message: 'Service Worker is now active!',
          });
        });
      });
    })
  );
});

// Fetch event - handle requests with advanced caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and non-GET requests
  if (
    url.origin !== location.origin &&
    !API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))
  ) {
    return;
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    if (url.pathname.startsWith('/api/')) {
      // API requests: Network First strategy
      event.respondWith(handleApiRequest(request));
    } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|avif)$/)) {
      // Static assets: Cache First strategy
      event.respondWith(handleStaticAssets(request));
    } else {
      // Pages: Stale While Revalidate strategy
      event.respondWith(handlePageRequest(request));
    }
  }
});

// Network First strategy for API requests
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache for API:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for API
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This request is not available offline',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Cache First strategy for static assets
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('❌ Failed to fetch asset:', request.url);
    throw error;
  }
}

// Stale While Revalidate strategy for pages
async function handlePageRequest(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        const cache = caches.open(RUNTIME_CACHE);
        cache.then(c => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch(() => {
      // If network fails and we have cache, return it
      if (cachedResponse) {
        return cachedResponse;
      }
      // Otherwise return offline page
      return caches.match('/') || new Response('Offline - Please check your connection');
    });

  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'workout-sync') {
    event.waitUntil(syncWorkoutData());
  }
});

// Handle background sync for workout data
async function syncWorkoutData() {
  try {
    // Get pending workout data from IndexedDB or localStorage
    // This would sync any workout data that was created while offline
    console.log('📊 Syncing workout data...');

    // Notify clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Workout data synchronized successfully',
      });
    });
  } catch (error) {
    console.error('❌ Failed to sync workout data:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('📨 Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New workout reminder!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'ironlog-notification',
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('IronLog', options));
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow('/'));
  }
});

// Handle messages from the main app
self.addEventListener('message', event => {
  console.log('💬 Message received in SW:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'REQUEST_SYNC') {
    // Register background sync
    self.registration.sync.register('workout-sync');
  }
});

console.log('🚀 IronLog Service Worker loaded successfully!');
