const CACHE_NAME = 'william-calculate-v3';

self.addEventListener('install', (event) => {
	// Skip waiting to activate the new service worker immediately
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	// Claim clients to ensure the service worker is in control
	event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
	// Only handle requests when online
	if (!navigator.onLine) {
		return;
	}

	// Skip caching for TypeScript files and API requests
	if (event.request.url.includes('.ts') ||
		event.request.url.includes('.tsx') ||
		event.request.url.includes('/api/')) {
		return;
	}

	// Let the browser handle the request normally
	event.respondWith(fetch(event.request));
}); 