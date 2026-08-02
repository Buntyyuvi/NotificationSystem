import { useEffect, useRef } from 'react';
import {
  getFirebaseConfig,
  getPushToken,
  isFirebaseConfigured
} from '../config/firebase';
import { pushService } from '../services/pushService';
import type { User } from '../types/user';

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  const config = getFirebaseConfig();
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then(async () => {
      const active = await navigator.serviceWorker.ready;
      active.active?.postMessage({ type: 'FIREBASE_CONFIG', config });
    })
    .catch(err => console.error('Service worker registration failed', err));
}

export function usePushNotifications(user: User | null): void {
  const registered = useRef(false);

  useEffect(() => {
    if (!user || !isFirebaseConfigured() || registered.current) return;

    let cancelled = false;

    (async () => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
        return;
      }

      registerServiceWorker();
      const token = await getPushToken();
      if (cancelled || !token) return;

      await pushService.registerDevice(token, 'web');
      registered.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);
}
