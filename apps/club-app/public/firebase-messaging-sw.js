/**
 * Firebase Cloud Messaging Service Worker
 * Phase 8: Background Push Notifications
 * 
 * WICHTIG: Diese Datei muss im public/ Verzeichnis liegen und darf NICHT transpiliert werden!
 * Service Worker läuft außerhalb des Next.js-Builds.
 */

// Firebase SDK importieren (Version 10+)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase-Konfiguration
// WICHTIG: Diese Werte müssen mit den Werten in .env übereinstimmen!
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Firebase initialisieren
firebase.initializeApp(firebaseConfig);

// Messaging-Instanz holen
const messaging = firebase.messaging();

// Background-Nachricht empfangen
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'Nightlife OS';
  const notificationOptions = {
    body: payload.notification?.body || 'Neue Benachrichtigung',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data,
  };
  
  // Benachrichtigung anzeigen
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification-Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Optional: App öffnen
  event.waitUntil(
    clients.openWindow('/')
  );
});
