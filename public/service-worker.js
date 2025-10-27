const CACHE_VERSION = 'train-car-logger-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/img/icon.png',
  '/img/1.svg',
  '/img/2.svg',
  '/img/3.svg',
  '/img/4.svg',
  '/img/5.svg',
  '/img/6.svg',
  '/img/7.svg',
  '/img/a.svg',
  '/img/b.svg',
  '/img/c.svg',
  '/img/d.svg',
  '/img/e.svg',
  '/img/f.svg',
  '/img/g.svg',
  '/img/j.svg',
  '/img/l.svg',
  '/img/m.svg',
  '/img/n.svg',
  '/img/q.svg',
  '/img/r.svg',
  '/img/s.svg',
  '/img/w.svg',
  '/img/z.svg',
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
