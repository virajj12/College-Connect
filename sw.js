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
  
  // Open the app to the specific URL
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});