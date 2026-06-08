const CACHE = 'sao-joao-v3';

// Deriva o base URL do próprio SW — funciona em localhost e GitHub Pages
const BASE = self.location.href.replace(/sw\.js.*$/, '');

const SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'css/styles.css',
  BASE + 'css/leaflet.css',
  BASE + 'js/leaflet.js',
  BASE + 'js/lucide.min.js',
  BASE + 'js/data.js',
  BASE + 'js/app.js',
  BASE + 'manifest.json',
  BASE + 'icons/icon-192.svg',
  BASE + 'icons/icon-512.svg',
  'https://fonts.googleapis.com/css2?family=Anton&family=Arvo:wght@700&family=Poppins:wght@500&family=Roboto:wght@400&family=Inter:wght@700&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname === 'tile.openstreetmap.org') {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok && res.type !== 'opaque') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
