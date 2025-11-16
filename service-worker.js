const CACHE_NAME = 'voiceexpense-static-v1';
const ROOT = 'https://preethampagad.github.io/voiceexpense-pwa/'; // replace this
const ASSETS_TO_CACHE = [
  `${ROOT}/`,
  `${ROOT}/dashboard`,
  `${ROOT}/manifest.json`,
  `${ROOT}/icons/icon-192.png`,
  `${ROOT}/icons/icon-512.png`,
  `${ROOT}/offline.html`
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cachedResp => {
      if (cachedResp) return cachedResp;
      return fetch(event.request)
        .then(networkResp => {
          if (networkResp && networkResp.status === 200 && event.request.destination !== 'document') {
            const respClone = networkResp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
          }
          return networkResp;
        })
        .catch(() => caches.match(`${ROOT}/offline.html`));
    })
  );
});
