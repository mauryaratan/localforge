// LocalForge Service Worker
// Strategy:
//   - Navigations: network-first with cache fallback to "/" shell
//   - /_next/static/: cache-first (content-hashed, immutable)
//   - Other same-origin GETs: stale-while-revalidate
//   - Cross-origin / non-GET: pass through, do not intercept

const CACHE = "localforge-v1";

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add("/"))
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
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
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
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else same-origin (icons, manifest, wasm, etc.): stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
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
    // Network failed — try cache for this URL, then "/" as shell fallback
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    const shell = await caches.match("/");
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

async function staleWhileRevalidate(request) {
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
