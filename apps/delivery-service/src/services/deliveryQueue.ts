import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { createLogger } from '@notification-system/shared-logger';
import { KafkaProducer, KafkaTopics, defaultConfig } from '@notification-system/shared-kafka';
import { NotificationChannel } from '@notification-system/shared-types';
import { sendWebSocket } from '../channels/websocket';
import { sendPush } from '../channels/push';
import { sendEmail } from '../channels/email';
import { sendSMS } from '../channels/sms';
import { saveNotification, updateNotificationStatus } from './notificationStore';
import { DeliveryStatus } from '@notification-system/shared-types';

const logger = createLogger('delivery-service');

const connection = { host: 'localhost', port: 6379 };

export const deliveryQueue = new Queue('notification-delivery', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 86400 },
    removeOnFail: { age: 604800 }
  }
});

export const dlqQueue = new Queue('notification-dlq', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { age: 2592000 }
  }
});

export async function addDeliveryJob(payload: {
  eventId: string;
  userId: string;
  type: string;
  channels: NotificationChannel[];
  content: Record<string, unknown>;
  priority: string;
}): Promise<void> {
  await deliveryQueue.add('deliver', payload, {
    jobId: payload.eventId,
    priority: payload.priority === 'urgent' ? 1 : payload.priority === 'high' ? 2 : 3
  });
  logger.info('Delivery job queued', { eventId: payload.eventId });
}

async function processDelivery(job: Job): Promise<void> {
  const { eventId, userId, type, channels, content, priority } = job.data;

  await saveNotification({ eventId, userId, type, payload: content, channels, priority });

  for (const channel of channels) {
    const startTime = Date.now();
    let result: { success: boolean; error?: string };

    try {
      switch (channel) {
        case NotificationChannel.WEBSOCKET:
          result = await sendWebSocket(userId, eventId, type, content);
          break;
        case NotificationChannel.PUSH:
          result = await sendPush([], type.replace(/_/g, ' '), JSON.stringify(content), { eventId, type });
          break;
        case NotificationChannel.EMAIL:
          result = await sendEmail('', `${type.replace(/_/g, ' ')}`, `<p>${JSON.stringify(content)}</p>`, JSON.stringify(content));
          break;
        case NotificationChannel.SMS:
          result = await sendSMS('', `${type}: ${JSON.stringify(content).slice(0, 100)}`);
          break;
        default:
          result = { success: false, error: `Unknown channel: ${channel}` };
      }

      await updateNotificationStatus(eventId, channel, result.success ? DeliveryStatus.DELIVERED : DeliveryStatus.FAILED, result.error);

      logger.info('Delivery attempt', {
        eventId, channel, success: result.success, duration: Date.now() - startTime
      });
    } catch (error: any) {
      await updateNotificationStatus(eventId, channel, DeliveryStatus.FAILED, error.message);
      logger.error('Delivery crashed', { eventId, channel, error: error.message });
      throw error;
    }
  }
}

export function startDeliveryWorker(): void {
  const worker = new Worker('notification-delivery', processDelivery, {
    connection,
    concurrency: 10
  });

  worker.on('completed', (job) => {
    logger.info('Delivery job completed', { eventId: job.data.eventId });
  });

  worker.on('failed', async (job, err) => {
    logger.error('Delivery job failed', { eventId: job?.data?.eventId, error: err.message });

    if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
      logger.error('Moving to DLQ', { eventId: job.data.eventId });
      await dlqQueue.add('dlq', job.data);
    }
  });

  logger.info('Delivery worker started');
}
