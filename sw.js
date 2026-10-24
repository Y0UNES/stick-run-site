// Stick Run service worker: lets the game open (and the offline modes play) without a connection once it has been opened once.
// The pages and scripts always go to the network first, so a new version shows up right away; the cache is only the fallback.
const VER = 'sr-v1', FONTS = 'sr-fonts';
const CORE = ['./', 'index.html', 'config.js', 'vendor/supabase.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin === location.origin){
    if(url.search) return;                                       // the update check and anything with a query goes straight to the network
    if(req.mode === 'navigate' || /\.(html|js|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/')){
      e.respondWith(fetch(req).then(r => {
        if(r.ok){ const copy = r.clone(); caches.open(VER).then(c => c.put(req, copy)); }
        return r;
      }).catch(() => caches.match(req).then(m => m || caches.match('index.html') || caches.match('./'))));
      return;
    }
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => {
      if(r.ok){ const copy = r.clone(); caches.open(VER).then(c => c.put(req, copy)); }
      return r;
    })));
    return;
  }
  if(url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'){
    e.respondWith(caches.open(FONTS).then(c => c.match(req).then(m => {
      const net = fetch(req).then(r => { if(r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => m);
      return m || net;
    })));
  }
  // anything else (the database, the live channel) is never touched
});
