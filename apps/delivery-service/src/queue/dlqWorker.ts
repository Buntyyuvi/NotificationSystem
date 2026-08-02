import { Worker } from 'bullmq';
import { DeliveryStatus } from '@notification-system/shared-types';
import { createLogger } from '@notification-system/shared-logger';
import { DLQ_QUEUE, createQueueConnection, type DeliveryJobData } from './deliveryQueue';
import { markNotificationStatus } from '../services/notificationStore';

const logger = createLogger('delivery-service');

export const dlqWorker = new Worker<DeliveryJobData>(
  DLQ_QUEUE,
  async (job) => {
    logger.error('Dead-letter job', {
      eventId: job.data.eventId,
      userId: job.data.userId,
      type: job.data.type,
      channels: job.data.channels
    });
    await markNotificationStatus(
      job.data.eventId,
      DeliveryStatus.FAILED,
      'Exhausted all delivery retries'
    );
  },
  { connection: createQueueConnection(), concurrency: 2 }
);

dlqWorker.on('completed', (job) => {
  logger.info('Dead-letter job processed', { eventId: job.data.eventId });
});
