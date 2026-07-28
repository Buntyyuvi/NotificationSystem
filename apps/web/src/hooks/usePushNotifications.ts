import { useState, useEffect } from 'react';
import { initFirebase, messaging } from '../config/firebase';
import { pushService } from '../services/pushService';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted' && messaging) {
        const fcmToken = await pushService.getToken(messaging);
        if (fcmToken) {
          setToken(fcmToken);
          await pushService.registerToken(fcmToken);
        }
      }
    } catch (err) {
      console.error('Push permission failed:', err);
    }
  };

  useEffect(() => {
    initFirebase();
  }, []);

  return { permission, token, requestPermission };
}
