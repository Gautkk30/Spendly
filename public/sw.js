const CACHE_NAME = 'spendly-shell-v1';
const OFFLINE_URL = '/';

// Core assets to cache immediately upon installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activation event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message listener to handle 'SKIP_WAITING' from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event listener with robust routing and security checks
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 2. STAGE/DEV server or websocket connections (ignored)
  if (url.pathname.includes('/vite') || url.pathname.includes('ws') || url.pathname.includes('hmr')) {
    return;
  }

  // 3. EXCLUDE ALL SENSITIVE USER DATA & AUTHENTICATION ENDPOINTS
  // These should ALWAYS come directly from the network.
  const isApiRequest = url.pathname.startsWith('/api/');
  const isAuthRequest = url.pathname.startsWith('/auth/');
  
  if (isApiRequest || isAuthRequest) {
    // Exception: App configuration is safe to cache with a network-first strategy,
    // so we have a fallback if completely offline. But financial data is strictly network-only.
    const isConfigRoute = url.pathname === '/api/config' || url.pathname === '/api/pwa-icon';
    if (!isConfigRoute) {
      // Direct network fetch, no caching
      return;
    }
  }

  // 4. Handle non-sensitive static assets (JS, CSS, Images, Fonts, HTML)
  const isStaticAsset = 
    url.pathname.includes('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/manifest.json';

  if (isStaticAsset) {
    // Use Stale-While-Revalidate strategy for static assets
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            // Cache a copy of the updated asset
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Silent error on network failure (offline)
          });

          // Return cached response immediately if available, otherwise wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 5. Default network-first fallback for any other safe pages
  event.respondWith(
    fetch(request).catch(() => {
      // If offline, try to return the cached root '/' (the App Shell)
      if (request.mode === 'navigate') {
        return caches.match(OFFLINE_URL);
      }
      return Promise.reject('offline');
    })
  );
});
