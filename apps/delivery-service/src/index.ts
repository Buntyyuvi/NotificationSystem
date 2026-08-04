import { connectDB } from '@notification-system/shared-db';
import { KafkaConsumer, KafkaTopics, defaultConfig } from '@notification-system/shared-kafka';
import { createLogger } from '@notification-system/shared-logger';
import { getRedisClient } from '@notification-system/shared-redis';
import { env } from './config/env';
import { enqueueDelivery } from './queue/deliveryQueue';
import { deliveryWorker } from './queue/deliveryWorker';
import { dlqWorker } from './queue/dlqWorker';
import { deliverNotification } from './services/deliveryEngine';

const logger = createLogger('delivery-service');

async function start() {
  await connectDB(env.MONGODB_URI);

  const redis = getRedisClient(env.REDIS_URL);
  await redis.ping();
  logger.info('Redis connected');

  startDeliveryWorker();

  const consumer = new KafkaConsumer(defaultConfig({
    clientId: 'delivery-service',
    brokers: env.KAFKA_BROKERS,
    groupId: 'delivery-service-group'
  }));

  for (let attempt = 1; ; attempt++) {
    try {
      await consumer.connect();
      break;
    } catch (err: any) {
      logger.warn(`Kafka connect failed (attempt ${attempt}), retrying in 5s`, { error: err.message });
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  logger.info('Kafka connected');
  await consumer.subscribe([KafkaTopics.NOTIFICATION_ROUTED]);

  await consumer.run(async ({ message }) => {
    if (!message.value) return;
    const payload = JSON.parse(message.value.toString());
    logger.info('Delivery job received', { eventId: payload.eventId });

    const jobData = {
      eventId: payload.id || payload.eventId,
      userId: payload.userId,
      type: payload.type,
      channels: payload.resolvedChannels,
      payload: payload.payload,
      priority: payload.priority
    };

    try {
      await enqueueDelivery(jobData);
    } catch (error: any) {
      logger.error('Failed to enqueue delivery job, delivering inline', {
        eventId: jobData.eventId,
        error: error.message
      });
      try {
        await deliverNotification(jobData);
      } catch (inner: any) {
        logger.error('Inline delivery failed', { eventId: jobData.eventId, error: inner.message });
      }
    }
  });

  logger.info('Delivery Service running with BullMQ retry/DLQ');
}

start().catch(err => {
  logger.error('Fatal error', { error: err.message });
  process.exit(1);
});

export { deliveryWorker, dlqWorker };
