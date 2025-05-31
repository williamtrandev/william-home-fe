importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
	apiKey: "AIzaSyCx_d8znLnhWkf1e4RsouvABNMiOhpyEy4",
	authDomain: "codingduo1012.firebaseapp.com",
	projectId: "codingduo1012",
	storageBucket: "codingduo1012.firebasestorage.app",
	messagingSenderId: "508315214147",
	appId: "1:508315214147:web:8bf8c5368630faf5010ff6"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
	const notificationTitle = payload.notification.title;
	const notificationOptions = {
		body: payload.notification.body,
		icon: '/icon-192x192.png',
		badge: '/badge-96x96.png',
		data: payload.data
	};

	self.registration.showNotification(notificationTitle, notificationOptions);
}); 