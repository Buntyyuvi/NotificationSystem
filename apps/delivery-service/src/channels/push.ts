import { initializeApp, cert, type App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { createLogger } from '@notification-system/shared-logger';
import { env } from '../config/env';

const logger = createLogger('delivery-service');

let app: App | null = null;

function isConfigured(): boolean {
  return Boolean(
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY
  );
}

function ensureApp(): boolean {
  if (app) return true;
  if (!isConfigured()) return false;

  app = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID!,
      clientEmail: env.FIREBASE_CLIENT_EMAIL!,
      privateKey: env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')
    })
  });
  return true;
}

export async function sendPush(
  deviceTokens: string[],
  title: string,
  body: string,
  data: Record<string, string>
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  try {
    if (deviceTokens.length === 0) {
      logger.info('Push skipped: no device tokens', { title });
      return { success: true, skipped: true };
    }

    if (!ensureApp()) {
      logger.info('Push skipped: Firebase not configured', { title });
      return { success: true, skipped: true };
    }

    const response = await getMessaging(app!).sendEachForMulticast({
      notification: { title, body },
      data,
      tokens: deviceTokens
    });

    logger.info('Push sent', {
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    return {
      success: response.failureCount === 0,
      error:
        response.failureCount > 0
          ? `${response.failureCount} token(s) failed`
          : undefined
    };
  } catch (error: any) {
    logger.error('Push notification failed', { error: error.message });
    return { success: false, error: error.message };
  }
}
