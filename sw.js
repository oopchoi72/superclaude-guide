// SuperClaude Blog Service Worker
// Minimal, performant caching with offline fallback

const CACHE_NAME = 'superclaude-blog-v1';
const OFFLINE_PAGE = '/offline.html';

// Essential files to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  OFFLINE_PAGE
];

// Cache-first strategy for static assets
const CACHE_FIRST_PATTERNS = [
  /\.(?:css|js|woff2?|ttf|eot)$/,
  /\/images\//,
  /\/assets\//
];

// Network-first strategy for dynamic content
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\.(?:json)$/
];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching essential files');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch(err => {
        console.warn('[SW] Cache installation failed:', err);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (url.origin !== location.origin) return;

  // Cache-first for static assets
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first for dynamic content
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: network-first with offline fallback
  event.respondWith(networkFirstWithFallback(request));
});

// Cache-first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Cache-first failed:', error);
    return caches.match(request);
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network-first fallback to cache:', error);
    return caches.match(request);
  }
}

// Network-first with offline fallback
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_PAGE);
    }

    // Return minimal fallback response
    return new Response('Offline content unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Background sync for cache updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    event.waitUntil(updateCache());
  }
});

// Update cache with new content
async function updateCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    await Promise.all(
      requests.map(async request => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response);
            console.log('[SW] Updated cache for:', request.url);
          }
        } catch (error) {
          console.warn('[SW] Failed to update:', request.url, error);
        }
      })
    );
    
    console.log('[SW] Cache update complete');
  } catch (error) {
    console.error('[SW] Cache update failed:', error);
  }
}

// Periodic cache cleanup (optional optimization)
self.addEventListener('sync', event => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    // Remove entries older than 7 days
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      const date = response.headers.get('date');
      
      if (date && new Date(date).getTime() < oneWeekAgo) {
        await cache.delete(request);
        console.log('[SW] Cleaned up old cache entry:', request.url);
      }
    }
  } catch (error) {
    console.warn('[SW] Cache cleanup failed:', error);
  }
}