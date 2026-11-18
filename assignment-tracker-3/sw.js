/**
 * Service Worker — Assignment Tracker Edition 3 (Sanctuary Edition)
 * Stale-While-Revalidate Caching for 100% Offline Resilience
 */
const CACHE_NAME = 'assignment-tracker-3-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './css/theme.css',
  './css/app.css',
  './css/components.css',
  './js/engine.js',
  './js/storage.js',
  './js/config.js',
  './js/tutorials.js',
  './js/app.js',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/favicon-32.png',
  './assets/app-qr.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback or network error while offline
      });

      return cachedResponse || fetchPromise;
    })
  );
});
