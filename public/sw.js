const CACHE_VERSION = 'ecoroute-v2';
const STATIC_ASSETS = [
  '/',
  '/map',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/logo-navbar.png',
];

const MAP_TILE_CACHE = 'ecoroute-map-tiles-v2';
const OCM_CACHE = 'ecoroute-ocm-v3';

const OCM_MAX_ENTRIES = 100;
const OCM_TTL_MS = 60 * 60 * 1000;

// Listen for SKIP_WAITING message from the page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      await cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith('ecoroute-map-tiles') && !k.startsWith('ecoroute-ocm'))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
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

    fetch(request)
      .then((response) => {
        if (response.ok) cacheOCM(request, response.clone());
      })
      .catch(() => {});

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

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Tile caching
  if (url.hostname === 'tile.openstreetmap.org' || url.hostname.includes('basemaps.cartocdn.com')) {
    event.respondWith(
      caches.open(MAP_TILE_CACHE).then(async (cache) => {
        try {
          const cached = await cache.match(request);
          if (cached) return cached;
          const response = await fetch(request);
          if (response.ok) await cache.put(request, response.clone());
          return response;
        } catch {
          return new Response(null, { status: 204 });
        }
      })
    );
    return;
  }

  // OCM API caching
  if (url.pathname === '/api/ocm') {
    event.respondWith(fetchOCM(request));
    return;
  }

  // Offline fallback for /map
  if (url.pathname === '/map') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/offline.html'))
        .then((response) => response || caches.match('/offline.html'))
        .catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }

  // Network-first for everything else — only cache static assets we know about
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok || networkResponse.status === 304) {
          const isStaticAsset = STATIC_ASSETS.some(
            (asset) => url.pathname === asset || url.pathname.startsWith(asset + '?')
          );
          if (isStaticAsset) {
            const cache = await caches.open(CACHE_VERSION);
            await cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }
        throw new Error('Network error');
      } catch {
        const isStaticAsset = STATIC_ASSETS.some(
          (asset) => url.pathname === asset || url.pathname.startsWith(asset + '?')
        );
        if (isStaticAsset) {
          const cached = await caches.match(request);
          if (cached) return cached;
        }
        // Don't break on failed JS/CSS — just return 404
        if (request.destination === 'script' || request.destination === 'style') {
          return new Response('', { status: 404, headers: { 'Content-Type': 'text/plain' } });
        }
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});
