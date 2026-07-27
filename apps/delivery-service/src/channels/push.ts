import * as admin from 'firebase-admin';
import { createLogger } from '@notification-system/shared-logger';

const logger = createLogger('delivery-service');

let firebaseInitialized = false;

function initializeFirebase(): void {
  if (firebaseInitialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    logger.warn('Firebase credentials not configured, push notifications disabled');
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, privateKey, clientEmail })
  });

  firebaseInitialized = true;
  logger.info('Firebase Admin initialized');
}

export async function sendPush(
  deviceTokens: string[],
  title: string,
  body: string,
  data: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    initializeFirebase();

    if (!firebaseInitialized) {
      logger.warn('Firebase not initialized, skipping push', { tokenCount: deviceTokens.length });
      return { success: true };
    }

    if (deviceTokens.length === 0) {
      return { success: true };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens: deviceTokens,
      notification: { title, body },
      data,
      android: { priority: 'high' },
      apns: { payload: { aps: { 'content-available': 1 } } }
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    logger.info('Push sent', {
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(deviceTokens[idx]);
        }
      });
      logger.warn('Some push notifications failed', { failedTokens });
    }

    return { success: response.successCount > 0 };
  } catch (error: any) {
    logger.error('Push notification failed', { error: error.message });
    return { success: false, error: error.message };
  }
}
