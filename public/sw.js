<<<<<<< HEAD
const CACHE_NAME = 'buildmaster-local-pro-v10-gameplay-ptbr';
=======
const CACHE_NAME = 'buildmaster-local-pro-v9-v7-v8-premium';
>>>>>>> ed5acd963172e3290ecb0b2e7777a13d8f1b4a55
const STATIC_ASSETS = ['/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
