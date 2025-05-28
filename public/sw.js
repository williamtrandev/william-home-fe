const CACHE_NAME = 'william-calculate-v3';
const urlsToCache = [
	'/',
	'/index.html',
	'/manifest.json',
	'/icons/icon-72x72.png',
	'/icons/icon-96x96.png'
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => {
				console.log('Opened cache');
				return cache.addAll(urlsToCache);
			})
	);
});

self.addEventListener('fetch', (event) => {
	// Skip caching for TypeScript files and API requests
	if (event.request.url.includes('.ts') ||
		event.request.url.includes('.tsx') ||
		event.request.url.includes('/api/')) {
		return;
	}

	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				if (response) {
					return response;
				}
				return fetch(event.request)
					.then((response) => {
						if (!response || response.status !== 200 || response.type !== 'basic') {
							return response;
						}
						const responseToCache = response.clone();
						caches.open(CACHE_NAME)
							.then((cache) => {
								cache.put(event.request, responseToCache);
							});
						return response;
					});
			})
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						console.log('Deleting old cache:', cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
}); 