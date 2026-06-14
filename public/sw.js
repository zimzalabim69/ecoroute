const CACHE_NAME = 'ecoroute-v1';
const STATIC_ASSETS = [
  '/',
  '/map',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

const MAP_TILE_CACHE = 'ecoroute-map-tiles-v1';
const OCM_CACHE = 'ecoroute-ocm-v2';

const OCM_MAX_ENTRIES = 100;
const OCM_TTL_MS = 60 * 60 * 1000; // 1 hour

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== MAP_TILE_CACHE && k !== OCM_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

async function evictLRU(cache) {
  const requests = await cache.keys();
  if (requests.length < OCM_MAX_ENTRIES) return;

  const entries = [];
  for (const request of requests) {
    const response = await cache.match(request);
    const cachedAt = response?.headers?.get('X-SW-Cached-At');
    entries.push({ request, time: cachedAt ? parseInt(cachedAt, 10) : 0 });
  }

  entries.sort((a, b) => a.time - b.time);
  const toDelete = entries.slice(0, entries.length - OCM_MAX_ENTRIES + 1);
  await Promise.all(toDelete.map((e) => cache.delete(e.request)));
}

async function cacheOCM(request, response) {
  const cache = await caches.open(OCM_CACHE);
  await evictLRU(cache);

  const headers = new Headers(response.headers);
  headers.set('X-SW-Cached-At', String(Date.now()));

  const cloned = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  await cache.put(request, cloned);
}

async function fetchOCM(request) {
  const cache = await caches.open(OCM_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    const cachedAt = cached.headers.get('X-SW-Cached-At');
    const age = cachedAt ? Date.now() - parseInt(cachedAt, 10) : Infinity;

    if (age < OCM_TTL_MS) {
      return cached;
    }

    // Stale-while-revalidate: return cached, update in background
    const fetchPromise = fetch(request)
      .then((response) => {
        if (response.ok) cacheOCM(request, response.clone());
        return response;
      })
      .catch(() => cached);

    // For expired entries, we can return stale immediately and let the
    // next refresh pick up the new data. This matches stale-while-revalidate.
    // To keep things simple, we fire the revalidate in the background.
    event?.waitUntil?.(fetchPromise);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cacheOCM(request, response.clone());
    }
    return response;
  } catch {
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.hostname === 'tile.openstreetmap.org') {
    event.respondWith(
      caches.open(MAP_TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  if (url.pathname === '/api/ocm') {
    event.respondWith(fetchOCM(request));
    return;
  }

  if (url.pathname === '/map') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) return response;
          throw new Error('Network response was not ok');
        })
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
