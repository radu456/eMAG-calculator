const CACHE_NAME = 'calculator-emag-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalarea service worker-ului
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache deschis');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptarea cererilor de rețea
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Returnează resursa din cache dacă există
        if (response) {
          return response;
        }
        
        // Altfel, încearcă să o descarce din rețea
        return fetch(event.request).then(
          function(response) {
            // Verifică dacă răspunsul este valid
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonează răspunsul pentru a-l pune în cache
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// Actualizarea cache-ului
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Ștergere cache vechi:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
