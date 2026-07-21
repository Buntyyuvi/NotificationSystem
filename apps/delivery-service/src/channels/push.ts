import { createLogger } from '@notification-system/shared-logger';

const logger = createLogger('delivery-service');

// Placeholder — integrate firebase-admin for real FCM
export async function sendPush(
  deviceTokens: string[],
  title: string,
  body: string,
  data: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info('Push notification (placeholder)', { tokens: deviceTokens.length, title });
    // TODO: Integrate firebase-admin
    // await messaging.sendMulticast({ tokens: deviceTokens, notification: { title, body }, data });
    return { success: true };
  } catch (error: any) {
    logger.error('Push failed', { error: error.message });
    return { success: false, error: error.message };
  }
}