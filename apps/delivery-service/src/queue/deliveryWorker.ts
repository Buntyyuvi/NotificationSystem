import { Worker } from 'bullmq';
import { DeliveryStatus } from '@notification-system/shared-types';
import { createLogger } from '@notification-system/shared-logger';
import {
  DELIVERY_QUEUE,
  dlqQueue,
  createQueueConnection,
  type DeliveryJobData
} from './deliveryQueue';
import { deliverNotification } from '../services/deliveryEngine';
import { markNotificationStatus } from '../services/notificationStore';

const logger = createLogger('delivery-service');

export const deliveryWorker = new Worker<DeliveryJobData>(
  DELIVERY_QUEUE,
  async (job) => {
    const ok = await deliverNotification(job.data);
    if (!ok) {
      throw new Error('Delivery failed for one or more channels');
    }
  },
  { connection: createQueueConnection(), concurrency: 5 }
);

deliveryWorker.on('completed', (job) => {
  logger.info('Delivery job completed', {
    eventId: job.data.eventId,
    attempts: job.attemptsMade
  });
});

deliveryWorker.on('failed', async (job, err) => {
  if (!job) return;

  const maxAttempts = job.opts.attempts || 1;
  const isFinal = job.attemptsMade >= maxAttempts;

  if (isFinal) {
    logger.error('Delivery job exhausted retries, sending to DLQ', {
      eventId: job.data.eventId,
      attempts: job.attemptsMade,
      error: err.message
    });

    try {
      await dlqQueue.add('dead-letter', job.data, { jobId: job.id });
      await markNotificationStatus(job.data.eventId, DeliveryStatus.FAILED, err.message);
    } catch (dlqError: any) {
      logger.error('Failed to move job to DLQ', {
        eventId: job.data.eventId,
        error: dlqError.message
      });
    }
  } else {
    logger.warn('Delivery job will retry', {
      eventId: job.data.eventId,
      attempt: job.attemptsMade,
      error: err.message
    });
    await markNotificationStatus(job.data.eventId, DeliveryStatus.RETRYING, err.message);
  }
});
