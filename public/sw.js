const CACHE_NAME = 'otrebor-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Estratégia Network First (Tenta rede, se falhar vai pro cache)
    // Isso é mais seguro para evitar telas pretas por cache corrompido ou antigo
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Opcional: atualizar o cache com a nova resposta
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Limpar caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// Push notification event listener
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Notificação', body: 'Nova atualização no sistema OTREBOR.' };

    const options = {
        body: data.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
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
