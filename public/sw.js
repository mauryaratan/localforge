// LocalForge Service Worker
// Strategy:
//   - Navigations: network-first with cache fallback to the app shell
//   - Hashed static assets: cache-first (content-hashed, immutable)
//   - Other same-origin GETs: stale-while-revalidate
//   - Cross-origin / non-GET: pass through, do not intercept
//
// Bump the version suffix whenever this file changes so activate() drops
// stale caches.

const CACHE_PREFIX = "localforge-";
const CACHE = `${CACHE_PREFIX}v2`;

// Derive paths from the registration scope so the worker also functions
// when the app is deployed under a base path (e.g. /devtools/).
const SCOPE_PATH = new URL(self.registration.scope).pathname;
const STATIC_PREFIX = `${SCOPE_PATH}_next/static/`;

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(SCOPE_PATH))
      .catch(() => {
        // Pre-caching failure must not abort installation
      })
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            // Only touch caches in our own namespace — a shared origin may
            // host caches belonging to other applications
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Only intercept same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests: network-first, fall back to cache
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigate(request));
    return;
  }

  // Hashed static assets: cache-first (immutable)
  if (url.pathname.startsWith(STATIC_PREFIX)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else same-origin (icons, manifest, wasm, etc.): stale-while-revalidate
  event.respondWith(staleWhileRevalidate(event, request));
});

// ── Strategies ───────────────────────────────────────────────────────────────

async function networkFirstNavigate(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok || networkResponse.type === "opaqueredirect") {
      const cache = await caches.open(CACHE);
      cache.put(request, networkResponse.clone()).catch(() => {
        // Cache write failure must not break the response
      });
    }
    return networkResponse;
  } catch (_err) {
    // Network failed — try cache for this URL, then the shell as fallback
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    const shell = await caches.match(SCOPE_PATH);
    if (shell) {
      return shell;
    }
    // Nothing cached at all — let the browser show its own error
    throw _err;
  }
}

async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, networkResponse.clone()).catch(() => {
        // Cache write failure must not break the response
      });
    }
    return networkResponse;
  } catch (_err) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw _err;
  }
}

async function staleWhileRevalidate(event, request) {
  try {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);

    const networkFetch = fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone()).catch(() => {
            // Cache write failure must not break the response
          });
        }
        return networkResponse;
      })
      .catch(() => null);

    // Keep the worker alive until the background refresh lands, otherwise
    // the runtime may kill it and leave the cache stale
    event.waitUntil(networkFetch.then(() => undefined));

    if (cached) {
      return cached;
    }

    const networkResponse = await networkFetch;
    if (networkResponse) {
      return networkResponse;
    }
    throw new Error("No cached response and network unavailable");
  } catch (_err) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw _err;
  }
}
