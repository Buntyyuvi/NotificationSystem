import { Notification} from '@notification-system/shared-db';
import { DeliveryStatus } from '@notification-system/shared-types';
import { createLogger } from '@notification-system/shared-logger';

const logger = createLogger('delivery-service');

export async function saveNotification(data: {
  eventId: string;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  channels: string[];
  priority: string;
}): Promise<string> {
  const notification = await Notification.create({
    eventId: data.eventId,
    userId: data.userId,
    type: data.type,
    payload: data.payload,
    channels: data.channels,
    priority: data.priority,
    status: DeliveryStatus.PENDING,
  });

  logger.info('Notification saved', { notificationId: notification._id, eventId: data.eventId });
  return notification._id.toString();
}

export async function updateNotificationStatus(
  eventId: string,
  channel: string,
  status: DeliveryStatus,
  errorMessage?: string
): Promise<void> {
  await Notification.updateOne(
    { eventId },
    { 
      $set: { status, errorMessage, ...(status === DeliveryStatus.DELIVERED ? { deliveredAt: new Date() } : {}) },
      $push: { deliveryAttempts: { channel, status, attemptedAt: new Date() } }
    }
  );
  
  logger.info('Notification status updated', { eventId, status, channel });
}