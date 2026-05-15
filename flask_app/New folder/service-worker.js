const CACHE_NAME = "xceltutor-v2";
const APP_SHELL = [
    "/",
    "/upload",
    "/static/style.css",
    "/static/script.js",
    "/static/pwa.js",
    "/static/icons/xceltutor.svg",
    "/manifest.json"
];

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => (
            cached || fetch(event.request)
        ))
    );
});
