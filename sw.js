// sw.js
const CACHE_NAME = 'college-connect-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './login-background.jpg',
  './favicon.png',
  './favicon-512.png'
];

// Install event: cache basic assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
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