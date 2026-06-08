// sw.js
const CACHE_NAME = 'college-connect-v1.1'; // Change to v2, v3, etc. when pushing updates
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './login-background.jpg',
  './favicon.png',
  './favicon-512.png'
];

// Install event: cache basic assets and force immediate install
self.addEventListener('install', (event) => {
  // 1. Force the waiting service worker to become the active one instantly
  self.skipWaiting(); 

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event: Clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 2. Delete any old caches that don't match the current CACHE_NAME
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 3. Tell the active service worker to take control of the page immediately
      return clients.claim();
    })
  );
});

// Fetch event: serve from cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Listen for incoming Push events
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || 'College Connect';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || '/favicon.png',
    badge: '/favicon.png', // Small monochrome icon for Android status bar
    vibrate: [100, 50, 100, 10, 75, 10, 100], // Vibrate pattern
    data: {
      url: data.url || '/College-Connect/index.html' // Where to go when clicked
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle what happens when the user taps the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification

  const targetUrl = event.notification.data.url || '/College-Connect/index.html';

  event.waitUntil(
    // Scan all open browser tabs/windows
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      
      // 1. Check if the app is already open in any tab
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        
        // If an open tab matches your app's URL, focus it
        if (client.url.includes('/College-Connect/') && 'focus' in client) {
          client.focus();
          return client.navigate(client.url);
        }
      }
      
      // 2. If the app is NOT open anywhere, spawn a new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});