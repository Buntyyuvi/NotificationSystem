import { publish } from '@notification-system/shared-redis';
import { createLogger } from '@notification-system/shared-logger';
import { NotificationChannel } from '@notification-system/shared-types';

const logger = createLogger('delivery-service');

export async function sendWebSocket(
  userId: string,
  eventId: string,
  type: string,
  payload: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    await publish('notifications:websocket', JSON.stringify({
      userId,
      eventId,
      type,
      payload,
      timestamp: new Date().toISOString()
    }));
    
    logger.info('WebSocket sent via Redis', { userId, eventId });
    return { success: true };
  } catch (error: any) {
    logger.error('WebSocket failed', { userId, eventId, error: error.message });
    return { success: false, error: error.message };
  }
}