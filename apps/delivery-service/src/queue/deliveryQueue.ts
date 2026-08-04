import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { createLogger } from '@notification-system/shared-logger';
import { env } from '../config/env';

const logger = createLogger('delivery-service');

export const DELIVERY_QUEUE = 'notification-delivery';
export const DLQ_QUEUE = 'notification-delivery-dlq';

const connections: Redis[] = [];

export function createQueueConnection(): Redis {
  const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
  connection.on('error', (err: Error) => {
    logger.error('BullMQ Redis connection error', { error: err.message });
  });
  connections.push(connection);
  return connection;
}

export interface DeliveryJobData {
  eventId: string;
  userId: string;
  type: string;
  channels: string[];
  payload: Record<string, unknown>;
  priority: string;
}

export const deliveryQueue = new Queue<DeliveryJobData>(DELIVERY_QUEUE, {
  connection: createQueueConnection(),
  defaultJobOptions: {
    attempts: 4,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 500,
    removeOnFail: 1000
  }
});

export const dlqQueue = new Queue<DeliveryJobData>(DLQ_QUEUE, {
  connection: createQueueConnection(),
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 1000,
    removeOnFail: false
  }
});

export async function enqueueDelivery(job: DeliveryJobData): Promise<void> {
  await deliveryQueue.add('deliver', job, { jobId: job.eventId });
}

export async function closeQueues(): Promise<void> {
  await deliveryQueue.close();
  await dlqQueue.close();
  for (const connection of connections) {
    connection.disconnect();
  }
}
