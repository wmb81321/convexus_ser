const CACHE_NAME = 'convexo-wallet-v2'; // Updated version to clear old cache
const STATIC_CACHE = 'convexo-static-v2';

// Only cache static assets - NO API CALLS OR DYNAMIC CONTENT
const staticAssetsToCache = [
  '/manifest.json',
  '/favicon.ico',
  '/favicon_io/favicon-16x16.png',
  '/favicon_io/favicon-32x32.png',
  '/favicon_io/apple-touch-icon.png',
  '/favicon_io/android-chrome-192x192.png',
  '/favicon_io/android-chrome-512x512.png',
  '/convexo-logo.png',
  '/bg-main.webp',
  '/smart-wallets.svg',
];

// URLs that should NEVER be cached (real-time data)
const neverCache = [
  'api.coingecko.com',
  'rpc.sepolia.org',
  'sepolia.etherscan.io',
  'api.uniswap.org',
  'gateway.pinata.cloud',
  '/api/',
  '_next/static/chunks/', // Dynamic Next.js chunks
];

// Install event - cache static resources only
self.addEventListener('install', (event) => {
  console.log('🔧 Installing service worker v2 with proper caching strategy');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets only');
        return cache.addAll(staticAssetsToCache);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Fetch event - Network-first strategy for dynamic content
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Never cache API calls or dynamic content
  const shouldNeverCache = neverCache.some(pattern => url.includes(pattern));
  
  if (shouldNeverCache) {
    console.log('🌐 Network-only for:', url);
    // Always go to network for API calls and dynamic content
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For static assets, use cache-first strategy
  if (staticAssetsToCache.some(asset => url.endsWith(asset))) {
    console.log('💾 Cache-first for static asset:', url);
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
    return;
  }
  
  // For HTML pages, use network-first strategy to ensure fresh content
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    console.log('📄 Network-first for HTML:', url);
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response for offline access but prioritize network
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache only when network fails
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Default: network-first for everything else
  console.log('🔀 Network-first for:', url);
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('🚀 Activating new service worker v2');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all open tabs immediately
      self.clients.claim()
    ])
  );
  
  console.log('✅ Service worker v2 activated with network-first strategy for DeFi app');
}); 