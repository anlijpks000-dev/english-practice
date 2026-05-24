var CACHE = 'english-practice-v1';
var ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.indexOf('/api/') !== -1) return;
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(resp) {
        return caches.open(CACHE).then(function(cache) {
          cache.put(e.request, resp.clone());
          return resp;
        });
      });
    })
  );
});
