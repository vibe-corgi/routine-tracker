const CACHE = 'routine-tracker-v5';
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
  const url = e.request.url;

  // 같은 출처(GitHub Pages)만 처리, 외부 URL·chrome-extension 제외
  if (!url.startsWith(self.location.origin)) return;
  // Firebase 실시간 요청 제외
  if (url.includes('firestore') || url.includes('firebase') || url.includes('googleapis')) return;

  // HTML은 항상 네트워크 우선 (최신 코드 보장)
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // 나머지 동일 출처 리소스는 캐시 우선
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
