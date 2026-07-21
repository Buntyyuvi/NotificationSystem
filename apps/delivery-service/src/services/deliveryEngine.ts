import { NotificationChannel, DeliveryStatus } from '@notification-system/shared-types';
import { User, DeliveryLog } from '@notification-system/shared-db';
import { createLogger } from '@notification-system/shared-logger';
import { sendWebSocket } from '../channels/websocket';
import { sendPush } from '../channels/push';
import { sendEmail } from '../channels/email';
import { sendSMS } from '../channels/sms';

const logger = createLogger('delivery-service');

interface DeliveryPayload {
  eventId: string;
  userId: string;
  type: string;
  channels: NotificationChannel[];
  content: Record<string, unknown>;
  priority: string;
}

export async function deliverNotification(payload: DeliveryPayload): Promise<void> {
  const user = await User.findOne({ userId: payload.userId });
  
  if (!user) {
    logger.warn('User not found', { userId: payload.userId });
    return;
  }

  for (const channel of payload.channels) {
    const startTime = Date.now();
    let result: { success: boolean; error?: string };

    try {
      switch (channel) {
        case NotificationChannel.WEBSOCKET:
          result = await sendWebSocket(
            payload.userId,
            payload.eventId,
            payload.type,
            payload.content
          );
          break;

        case NotificationChannel.PUSH:
          result = await sendPush(
            user.devices.map(d => d.token),
            payload.type.replace(/_/g, ' '),
            JSON.stringify(payload.content),
            { eventId: payload.eventId, type: payload.type }
          );
          break;

        case NotificationChannel.EMAIL:
          result = await sendEmail(
            user.email,
            `${payload.type.replace(/_/g, ' ')}`,
            `<p>${JSON.stringify(payload.content)}</p>`,
            JSON.stringify(payload.content)
          );
          break;

        case NotificationChannel.SMS:
          result = await sendSMS(
            user.phone || '',
            `${payload.type}: ${JSON.stringify(payload.content).slice(0, 100)}`
          );
          break;

        default:
          result = { success: false, error: `Unknown channel: ${channel}` };
      }

      // Log delivery attempt
      await DeliveryLog.create({
        notificationId: payload.eventId,
        channel,
        status: result.success ? DeliveryStatus.DELIVERED : DeliveryStatus.FAILED,
        errorMessage: result.error,
        attemptedAt: new Date(startTime),
        completedAt: new Date()
      });

      logger.info('Delivery attempt', {
        eventId: payload.eventId,
        channel,
        success: result.success,
        duration: Date.now() - startTime
      });

    } catch (error: any) {
      await DeliveryLog.create({
        notificationId: payload.eventId,
        channel,
        status: DeliveryStatus.FAILED,
        errorMessage: error.message,
        attemptedAt: new Date(startTime),
        completedAt: new Date()
      });

      logger.error('Delivery crashed', {
        eventId: payload.eventId,
        channel,
        error: error.message
      });
    }
  }
}