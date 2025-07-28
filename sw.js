// SuperClaude Blog Service Worker
// Enhanced with robust error handling and graceful fallbacks

const CACHE_NAME = 'superclaude-blog-v2'; // Updated version for GitHub Pages fixes
const OFFLINE_PAGE = './offline.html';

// Enhanced error logging with context
function logSWError(error, context, severity = 'error') {
    const errorInfo = {
        timestamp: new Date().toISOString(),
        message: error.message || error,
        context,
        severity,
        stack: error.stack,
        cacheKeys: [],
        url: self.location.href
    };
    
    // Get cache info for debugging
    caches.keys().then(keys => {
        errorInfo.cacheKeys = keys;
        console.group(`[SW] 🚨 ${severity.toUpperCase()}: ${context}`);
        console.error(error);
        console.log('Context:', context);
        console.log('Cache Keys:', keys);
        console.log('Timestamp:', errorInfo.timestamp);
        console.groupEnd();
    }).catch(() => {
        console.error(`[SW] ${context}:`, error);
    });
    
    // Broadcast error to main thread if possible
    try {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'SW_ERROR',
                    error: errorInfo
                });
            });
        });
    } catch (broadcastError) {
        console.warn('[SW] Failed to broadcast error:', broadcastError);
    }
}

// Essential files to cache immediately
const STATIC_CACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './favicon.ico',
  './favicon.svg',
  './offline.html'
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

// Install event - cache essential files with enhanced error handling
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Caching essential files');
        
        // Try to cache files individually to identify which ones fail
        const cachePromises = STATIC_CACHE_URLS.map(async (url) => {
          try {
            await cache.add(url);
            console.log(`[SW] ✅ Cached: ${url}`);
          } catch (error) {
            logSWError(error, `Cache Add: ${url}`, 'warning');
            
            // Try alternative fetch and cache strategy
            try {
              const response = await fetch(url);
              if (response.ok) {
                await cache.put(url, response);
                console.log(`[SW] ✅ Cached (fallback): ${url}`);
              } else {
                throw new Error(`HTTP ${response.status}`);
              }
            } catch (fallbackError) {
              logSWError(fallbackError, `Cache Fallback: ${url}`, 'error');
            }
          }
        });
        
        await Promise.allSettled(cachePromises);
        console.log('[SW] Installation complete');
        return self.skipWaiting();
        
      } catch (error) {
        logSWError(error, 'Service Worker Install', 'critical');
        // Continue with installation even if caching fails
        return self.skipWaiting();
      }
    })()
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

// Enhanced cache-first strategy with robust error handling
async function cacheFirst(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`[SW] ✅ Cache hit: ${request.url}`);
      
      // Update cache in background if resource is stale (older than 1 hour)
      const cacheTime = cachedResponse.headers.get('sw-cache-time');
      if (cacheTime && Date.now() - parseInt(cacheTime) > 3600000) {
        updateCacheInBackground(request).catch(error => {
          logSWError(error, `Background Cache Update: ${request.url}`, 'warning');
        });
      }
      
      return cachedResponse;
    }

    // Fetch from network with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const networkResponse = await fetch(request, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (networkResponse.ok) {
      try {
        const cache = await caches.open(CACHE_NAME);
        // Clone response and add timestamp header
        const responseToCache = networkResponse.clone();
        const headers = new Headers(responseToCache.headers);
        headers.set('sw-cache-time', Date.now().toString());
        
        const responseWithHeaders = new Response(responseToCache.body, {
          status: responseToCache.status,
          statusText: responseToCache.statusText,
          headers: headers
        });
        
        await cache.put(request, responseWithHeaders);
        console.log(`[SW] ✅ Cached from network: ${request.url}`);
      } catch (cacheError) {
        logSWError(cacheError, `Cache Put: ${request.url}`, 'warning');
        // Continue without caching
      }
    }
    
    return networkResponse;
    
  } catch (error) {
    logSWError(error, `Cache First: ${request.url}`, 'warning');
    
    // Fallback to cache even for failed requests
    try {
      const fallbackResponse = await caches.match(request);
      if (fallbackResponse) {
        console.log(`[SW] 🔄 Fallback cache hit: ${request.url}`);
        return fallbackResponse;
      }
    } catch (fallbackError) {
      logSWError(fallbackError, `Cache Fallback: ${request.url}`, 'error');
    }
    
    // Return minimal error response
    return new Response('Resource temporarily unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Background cache update function
async function updateCacheInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      const headers = new Headers(response.headers);
      headers.set('sw-cache-time', Date.now().toString());
      
      const responseWithHeaders = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
      
      await cache.put(request, responseWithHeaders);
      console.log(`[SW] 🔄 Background updated: ${request.url}`);
    }
  } catch (error) {
    throw error; // Re-throw for caller to handle
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
    const networkResponse = await fetchWithTimeout(request, 12000);
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