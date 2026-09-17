// Minimal hand-written service worker for the MVP.
//
// This is intentionally simple: cache the app shell + static assets so the
// PWA is installable and re-opens instantly, and fall back to network for
// everything else (menu data should always be fresh). For production,
// replace this with `next-pwa`/Workbox to get proper runtime caching
// strategies (stale-while-revalidate for images, cache-first for the
// glTF/USDZ 3D models which are large and immutable once uploaded, etc.)
const CACHE_NAME = "cardapio-shell-v1";
const APP_SHELL = ["/", "/manifest.json", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Network-first for navigations/menu data so pratos/preços nunca fiquem
  // desatualizados; cache is only an offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((res) => res || caches.match("/"))),
    );
    return;
  }

  // Cache-first for static, hashed Next.js assets and the app shell.
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request)),
    );
  }
});
