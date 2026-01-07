// Service Worker for Twilio Calculator PWA
const CACHE_NAME = 'twilio-calculator-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/data.js',
    '/js/utils.js',
    '/js/charts.js',
    '/js/calculator.js',
    '/js/app.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
            .catch(error => {
                console.error('Service Worker: Cache failed', error);
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cache => {
                        if (cache !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip chrome extensions and non-http requests
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }

                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone response (can only be consumed once)
                        const responseToCache = response.clone();

                        // Cache the new resource
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('Service Worker: Fetch failed', error);

                        // Return offline page or fallback
                        return new Response(
                            '<html><body><h1>Sin conexión</h1><p>No se puede cargar el recurso sin conexión a internet.</p></body></html>',
                            {
                                headers: { 'Content-Type': 'text/html' }
                            }
                        );
                    });
            })
    );
});

// Background sync (for future enhancements)
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event.tag);

    if (event.tag === 'sync-scenarios') {
        event.waitUntil(
            // Sync scenarios with cloud storage (future feature)
            Promise.resolve()
        );
    }
});

// Push notifications (for future enhancements)
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification('Calculadora Twilio', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});

// Message from client
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);

    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

console.log('Service Worker: Loaded successfully');
