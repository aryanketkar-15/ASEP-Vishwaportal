// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.20.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.20.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyB7VAhpgtEnAbjUZGmMmUnAv2i8m6N_hO0",
    authDomain: "vishwaportal-8fe95.firebaseapp.com",
    projectId: "vishwaportal-8fe95",
    storageBucket: "vishwaportal-8fe95.firebasestorage.app",
    messagingSenderId: "1060321212945",
    appId: "1:1060321212945:web:030cd7f8b7370135ff0fb0",
    measurementId: "G-2K6ZBCCR1S"
  });

const messaging = firebase.messaging();


// KEEP ONLY ONE HANDLER - Delete this duplicate block:
messaging.onBackgroundMessage(async (payload) => {
    console.log('Received background message:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'VITLogo.png'  // <- Remove leading slash
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});



// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Service worker installed');
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('Service worker activated');
  });
