const CACHE = 'flashcards-v1';

// Cache app shell on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add('/'))
  );
  self.skipWaiting();
});

// Remove old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // External images (loremflickr etc): cache-first so they work offline
  if (url.hostname !== self.location.hostname) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request)
            .then((res) => {
              if (res.ok) cache.put(request, res.clone());
              return res;
            })
            .catch(() => new Response('', { status: 408 }));
        })
      )
    );
    return;
  }

  // Next.js hashed static assets: cache-first (they're immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // HTML navigation: network-first, fall back to cached root
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            caches.open(CACHE).then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Everything else: network-first, cache on success
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
