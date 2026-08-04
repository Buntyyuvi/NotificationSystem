import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, type Messaging } from 'firebase/messaging';

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string
};

export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.messagingSenderId);
}

export function getFirebaseConfig() {
  return config;
}

export async function getPushToken(): Promise<string | null> {
  try {
    if (!isFirebaseConfigured()) return null;
    if (!(await isSupported())) return null;

    app = app ?? initializeApp(config);
    messaging = messaging ?? getMessaging(app);
    return await getToken(messaging, { vapidKey: config.vapidKey });
  } catch (err) {
    console.error('Failed to get push token', err);
    return null;
  }
}
