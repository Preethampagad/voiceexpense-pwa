// VoiceExpense — Offline page service worker (PWABuilder adapted)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "voiceexpense-cache-v1";
// Absolute URL to your offline fallback page hosted on GitHub Pages
const offlineFallbackPage = "https://preethampagad.github.io/voiceexpense-pwa/offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
      .then(() => self.skipWaiting())
  );
});

if (workbox && workbox.navigationPreload && workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  // only handle navigation requests (pages)
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // try to use the navigation preload response if available
        const preloadResp = await event.preloadResponse;
        if (preloadResp) {
          return preloadResp;
        }

        // otherwise try network
        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        // if network fails, serve the offline page from cache
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});
