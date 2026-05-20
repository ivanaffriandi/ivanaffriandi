const CACHE_NAME = "ivan-affriandi-cache-v1";
const OFFLINE_URLS = [
  "/",
  "/ask",
  "/icon.svg"
];

// 1. Install Event: Precaches static shells for offline accessibility
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clears out legacy caches cleanly
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Intercepts network requests to implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Focus only on GET requests within our same origin to keep caches clean
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Avoid intercepting local Webpack or Next.js developer hot-reload assets
  if (url.pathname.includes("_next") || url.pathname.includes("webpack") || url.pathname.includes("hot-update")) {
    return;
  }

  // Network-First with Cache Fallback for dynamic api requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Stale-While-Revalidate strategy for static resources & general navigation
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Silently absorb network failures since we revalidate in background
        });

      return cachedResponse || fetchPromise;
    })
  );
});
