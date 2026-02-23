const CACHE_NAME = 'otrebor-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Push notification event listener
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Notificação', body: 'Nova atualização no sistema OTREBOR.' };

    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3662/3662817.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3662/3662817.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            { action: 'explore', title: 'Ver Detalhes' },
            { action: 'close', title: 'Fechar' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
