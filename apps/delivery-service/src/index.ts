import { connectDB } from '@notification-system/shared-db';
import { KafkaConsumer, KafkaTopics, defaultConfig } from '@notification-system/shared-kafka';
import { createLogger } from '@notification-system/shared-logger';
import { getRedisClient } from '@notification-system/shared-redis';
import { env } from './config/env';
import { deliverNotification } from './services/deliveryEngine';

const logger = createLogger('delivery-service');

async function start() {
  await connectDB(env.MONGODB_URI);
  
  const redis = getRedisClient(env.REDIS_URL);
  await redis.ping();
  logger.info('Redis connected');

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
    logger.info('Delivery job received', { eventId: payload.eventId, channels: payload.resolvedChannels });

    try {
      await deliverNotification({
        eventId: payload.id || payload.eventId,
        userId: payload.userId,
        type: payload.type,
        channels: payload.resolvedChannels,
        content: payload.payload,
        priority: payload.priority
      });

      logger.info('Delivery completed', { eventId: payload.eventId });

    } catch (error: any) {
      logger.error('Delivery failed', { eventId: payload.eventId, error: error.message });
    }
  });

  logger.info('Delivery Service running');
}

start().catch(err => {
  logger.error('Fatal error', { error: err.message });
  process.exit(1);
});