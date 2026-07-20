const CACHE = 'routine-tracker-v4';
const ASSETS = [
  '/routine-tracker/manifest.json',
  '/routine-tracker/icon-192.png',
  '/routine-tracker/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firestore') || e.request.url.includes('firebase')) return;
  // HTML/JS는 항상 네트워크 우선
  if (e.request.mode === 'navigate' || e.request.url.endsWith('.html') || e.request.url.endsWith('.js')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
