import { Messaging, getToken as fcmGetToken } from 'firebase/messaging';
import { api } from '../config/api';

export const pushService = {
  async getToken(messaging: Messaging): Promise<string | null> {
    try {
      const token = await fcmGetToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      return token;
    } catch (err) {
      console.error('FCM token failed:', err);
      return null;
    }
  },

  async registerToken(token: string): Promise<void> {
    try {
      await api.post('/notifications/register-device', {
        token,
        platform: 'web'
      });
    } catch (err) {
      console.error('Device registration failed:', err);
    }
  }
};
