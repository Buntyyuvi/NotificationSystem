importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

let messaging = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    try {
      firebase.initializeApp(event.data.config);
      messaging = firebase.messaging();
      messaging.onBackgroundMessage((payload) => {
        const title = (payload.notification && payload.notification.title) || 'Notification';
        const body = (payload.notification && payload.notification.body) || '';
        self.registration.showNotification(title, {
          body,
          icon: '/favicon.ico',
          data: { url: payload.data && payload.data.url ? payload.data.url : '/' }
        });
      });
    } catch (err) {
      console.error('Firebase SW init failed', err);
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(clients.openWindow(url));
});
