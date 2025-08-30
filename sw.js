const CACHE_NAME = 'rocco-portfolio-v1.3'; // Bumped version
const STATIC_CACHE_NAME = 'rocco-static-v1.3'; // Bumped version  
const DYNAMIC_CACHE_NAME = 'rocco-dynamic-v1.3'; // Bumped version

// Assets to cache immediately (excluding theme-critical files)
const STATIC_ASSETS = [
  '/manifest.json',
  'assets/favicon-16x16.png',
  'assets/favicon-32x32.png',
  'assets/android-chrome-192x192.png',
  'assets/android-chrome-512x512.png',
  'assets/apple-touch-icon.png',
  'assets/baby-yoda.svg',
  'assets/darth-vader.svg',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Theme-critical resources that should always be fresh
const THEME_CRITICAL = [
  '/',
  '/index.html'
];

// Runtime caching for dynamic content
const RUNTIME_CACHE = [
  'https://fonts.gstatic.com',
  'https://api.github.com/repos/roccogold/my-website/actions/runs',
  'https://www.googletagmanager.com',
  'https://cdn.emailjs.com'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing v1.3...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Service Worker: Error caching static assets:', error);
      })
  );
  // Force immediate activation to ensure theme updates apply
  self.skipWaiting();
});

// Activate event - clean up old caches aggressively
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating v1.3...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('rocco-') && 
              ![STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME].includes(cacheName)
            )
            .map(cacheName => {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Force reload of all clients to get fresh theme code
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'CACHE_UPDATED' });
          });
        });
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - modified caching strategy for theme issues
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method !== 'GET') {
    return; // Only handle GET requests
  }

  // Theme-critical resources - always network first for immediate updates
  if (THEME_CRITICAL.some(asset => request.url.endsWith(asset)) || 
      request.url === self.registration.scope) {
    event.respondWith(networkFirstNoCache(request));
    return;
  }

  // API requests - network first, cache fallback
  if (url.origin === 'https://api.github.com' || url.origin === 'https://api.emailjs.com') {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Static assets (non-theme-critical) - cache first
  if (STATIC_ASSETS.some(asset => request.url.includes(asset)) || 
      request.url.includes('fonts.') || 
      request.url.includes('cdnjs.cloudflare.com')) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Default - network first for everything else to ensure freshness
  event.respondWith(networkFirst(request));
});

// Network first strategy without caching (for theme-critical resources)
async function networkFirstNoCache(request) {
  try {
    console.log('Fetching fresh (no cache):', request.url);
    const networkResponse = await fetch(request, {
      cache: 'no-store' // Force fresh fetch
    });
    return networkResponse;
  } catch (error) {
    console.log('Network first no-cache failed, trying regular cache');
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Enhanced cache first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Enhanced network first with better error handling
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network first: Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return appropriate offline response based on request type
    if (request.url.includes('api.github.com')) {
      return new Response(JSON.stringify({
        workflow_runs: [],
        message: 'Offline - cached data unavailable'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response('Offline', { status: 503 });
  }
}

// Handle client messages - including force refresh for theme updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle force refresh request
  if (event.data && event.data.type === 'FORCE_REFRESH') {
    // Clear theme-critical caches
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('rocco-')) {
              console.log('Clearing cache for theme update:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

// Background sync for contact form (unchanged)
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  try {
    const pendingForms = await getPendingForms();
    
    for (const formData of pendingForms) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          await removePendingForm(formData.id);
          
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'FORM_SYNC_SUCCESS',
                message: 'Your message was sent successfully!'
              });
            });
          });
        }
      } catch (error) {
        console.error('Failed to sync form:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations (unchanged)
async function getPendingForms() {
  return [];
}

async function removePendingForm(id) {
  console.log('Removing pending form:', id);
}

// Push notification handling (unchanged)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New update available!',
      icon: '/assets/android-chrome-192x192.png',
      badge: '/assets/favicon-32x32.png',
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/assets/favicon-32x32.png'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Rocco Portfolio Update', options)
    );
  }
});

// Handle notification clicks (unchanged)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker v1.3: Loaded successfully with theme-optimized caching');
