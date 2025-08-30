const CACHE_NAME = 'rocco-portfolio-v1.2';
const STATIC_CACHE_NAME = 'rocco-static-v1.2';
const DYNAMIC_CACHE_NAME = 'rocco-dynamic-v1.2';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
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

// Runtime caching for dynamic content
const RUNTIME_CACHE = [
  'https://fonts.gstatic.com',
  'https://api.github.com/repos/roccogold/my-website/actions/runs',
  'https://www.googletagmanager.com',
  'https://cdn.emailjs.com'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
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
  
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
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
        // Claim all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method !== 'GET') {
    return; // Only handle GET requests
  }

  // API requests - network first, cache fallback
  if (url.origin === 'https://api.github.com' || url.origin === 'https://api.emailjs.com') {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Static assets - cache first, network fallback
  if (STATIC_ASSETS.some(asset => request.url.includes(asset)) || 
      request.url.includes('fonts.') || 
      request.url.includes('cdnjs.cloudflare.com')) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // HTML pages - stale while revalidate
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Default - network first
  event.respondWith(networkFirst(request));
});

// Caching strategies
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
    // Return offline fallback if available
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network first: Network failed, trying cache');
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

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch fresh version in background
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cachedResponse);
  
  // Return cached version immediately, or wait for network
  return cachedResponse || networkResponsePromise;
}

// Background sync for contact form
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  try {
    // Get pending form submissions from IndexedDB
    const pendingForms = await getPendingForms();
    
    for (const formData of pendingForms) {
      try {
        // Attempt to send the form
        const response = await fetch('/api/contact', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          // Remove from pending queue
          await removePendingForm(formData.id);
          
          // Notify user of successful send
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

// Placeholder functions for IndexedDB operations
async function getPendingForms() {
  // Implementation would use IndexedDB to store/retrieve pending forms
  return [];
}

async function removePendingForm(id) {
  // Implementation would remove form from IndexedDB
  console.log('Removing pending form:', id);
}

// Push notification handling (for future blog updates)
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

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: Loaded successfully');