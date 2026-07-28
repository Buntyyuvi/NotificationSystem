import { connectDB } from '@notification-system/shared-db';
import { KafkaConsumer, KafkaTopics, defaultConfig } from '@notification-system/shared-kafka';
import { createLogger } from '@notification-system/shared-logger';
import { getRedisClient } from '@notification-system/shared-redis';
import { env } from './config/env';
import { addDeliveryJob, startDeliveryWorker } from './services/deliveryQueue';

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
  await consumer.connect();
  logger.info('Kafka connected');
  await consumer.subscribe([KafkaTopics.NOTIFICATION_ROUTED]);

  await consumer.run(async ({ message }) => {
    if (!message.value) return;
    const payload = JSON.parse(message.value.toString());
    logger.info('Delivery job received', { eventId: payload.eventId });

    try {
      await addDeliveryJob({
        eventId: payload.id || payload.eventId,
        userId: payload.userId,
        type: payload.type,
        channels: payload.resolvedChannels,
        content: payload.payload,
        priority: payload.priority
      });
    } catch (error: any) {
      logger.error('Failed to queue delivery', { eventId: payload.eventId, error: error.message });
    }
  });

  logger.info('Delivery Service running');
}

start().catch(err => {
  logger.error('Fatal error', { error: err.message });
  process.exit(1);
});
