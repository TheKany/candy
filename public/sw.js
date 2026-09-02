const CACHE_NAME = "tarot-tart-v1";
const PRECACHE_PATHS = [
  "/",
  "/select",
  "/offline.html",
  "/main.png",
  "/cardBack.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_PATHS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("tarot-tart-") && cacheName !== CACHE_NAME,
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheSuccessfulResponse(request, response) {
  if (response.ok && new URL(response.url || request.url).origin === self.location.origin) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstNavigation(request) {
  try {
    return await cacheSuccessfulResponse(request, await fetch(request));
  } catch {
    return (await caches.match(request)) || (await caches.match("/offline.html"));
  }
}

async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  return cacheSuccessfulResponse(request, await fetch(request));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(cacheFirstAsset(request));
  }
});
