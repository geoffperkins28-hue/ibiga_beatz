// Ibiga Beatz service worker — gives the installed PWA a native feel with an
// app-shell cache and an offline fallback. Bump CACHE on each release.
const CACHE = "ibiga-beatz-v2";
const APP_SHELL = ["/", "/store", "/songs", "/portfolio", "/request", "/booking", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Let Next's build assets, admin, auth and cross-origin requests go straight
  // to the network — caching hashed chunks causes stale 404s after rebuilds.
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api")
  ) {
    return;
  }

  // Navigations: network-first, fall back to cache, then offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/offline")))
    );
    return;
  }

  // Static assets: cache-first.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone();
          if (res.ok) caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
    )
  );
});
