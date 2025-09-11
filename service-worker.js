// panguplay PWA Service Worker
const CACHE_NAME = "1109250100";
const urlsToCache = [
  "/",
  "/index.html",
  "/movies.html",
  "/shows.html",
  "/dubbed.html",
  "/player.html",
  "/720p.html",
  "/test.html",
  "/request.html",
  "/images/twitter-image.jpg",
  "/images/og-image.jpg",
  "/favicon.png",
  "/manifest.json",
  "/ply-logo.png",
  "/icon-192.png",
  "/icon-512.png",
  "/orientation-lock.js",
  "https://cdnjs.cloudflare.com/ajax/libs/Swiper/9.4.1/swiper-bundle.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/Swiper/9.4.1/swiper-bundle.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/plyr/3.7.8/plyr.min.css",
  "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
  // Add more assets as needed
];

// Install event - Cache assets when the service worker is installed
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app shell and assets');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - Clean up old caches when new service worker activates
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('Removing old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener("fetch", event => {
  // Skip cross-origin requests and video files
  if (!event.request.url.startsWith(self.location.origin) ||
      event.request.url.match(/\.(mp4|webm|m3u8)$/)) {
    return;
  }

  // CDN resources: cache-first
  if (event.request.url.includes('cdnjs.cloudflare.com') ||
      event.request.url.includes('gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // HTML pages: network-first with cache fallback
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      }).catch(() => caches.match(event.request).then(cached => {
        return cached || caches.match('/index.html');
      }))
    );
    return;
  }

  // All other assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;

  const notification = event.data.json();
  const title = notification.title || 'New on panguplay';
  const options = {
    body: notification.body || 'Check out new content!',
    icon: '/icon-192.png',
    badge: '/favicon.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});