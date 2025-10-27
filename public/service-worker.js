const CACHE_VERSION = 'train-car-logger-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/img/icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const request = event.request;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put('/index.html', clonedResponse));
          return response;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  const requestURL = new URL(request.url);

  if (requestURL.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

function cacheFirst(request) {
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) {
      fetchAndCache(request);
      return cachedResponse;
    }

    return fetchAndCache(request);
  });
}

function networkFirst(request) {
  return fetchAndCache(request).catch(() => caches.match(request));
}

function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      const responseClone = response.clone();
      caches.open(CACHE_VERSION).then((cache) => cache.put(request, responseClone));
      return response;
    })
    .catch((error) => {
      throw error;
    });
}
