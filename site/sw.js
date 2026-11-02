/* Service worker: caches the app shell so the site opens on poor connections. API calls are never cached (they carry personal data). */
const CACHE = 'awaaz-v4';
const SHELL = ['/', 'index.html', 'styles.css', 'app.js', 'voice.js', 'gltext.js', 'bg.js', 'theme.js', 'i18n.js', 'i18n-extra.js', 'about.html', 'privacy.html', 'verify.html', 'manifest.webmanifest', 'icon-192.png'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  // network first, fall back to cache when offline
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(m => m || caches.match('index.html'))));
});
