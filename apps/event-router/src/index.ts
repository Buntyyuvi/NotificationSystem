import { connectDB } from '@notification-system/shared-db';
import { KafkaConsumer, KafkaProducer, KafkaTopics, defaultConfig } from '@notification-system/shared-kafka';
import { createLogger } from '@notification-system/shared-logger';
import { getRedisClient } from '@notification-system/shared-redis';
import { publish } from '@notification-system/shared-redis';
import { NotificationChannel } from '@notification-system/shared-types';
import { env } from './config/env';
import { routeEvent } from './router/engine';

const logger = createLogger('event-router');

async function start() {
  await connectDB(env.MONGODB_URI);
  
  const redis = getRedisClient(env.REDIS_URL);
  await redis.ping();
  logger.info('Redis connected');

  const consumer = new KafkaConsumer(defaultConfig({
    clientId: 'event-router',
    brokers: env.KAFKA_BROKERS,
    groupId: env.GROUP_ID
  }));

  const producer = new KafkaProducer(defaultConfig({
    clientId: 'event-router-producer',
    brokers: env.KAFKA_BROKERS
  }));

  for (let attempt = 1; ; attempt++) {
    try {
      await consumer.connect();
      await producer.connect();
      break;
    } catch (err: any) {
      logger.warn(`Kafka connect failed (attempt ${attempt}), retrying in 5s`, { error: err.message });
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  logger.info('Kafka connected');

  await consumer.subscribe([KafkaTopics.NOTIFICATION_EVENTS]);

  await consumer.run(async ({ message }) => {
    if (!message.value) return;

    const event = JSON.parse(message.value.toString());
    logger.info('Event received', { eventId: event.id, type: event.type });

    try {
      const routed = await routeEvent(event);
      
      logger.info('Event routed', {
        eventId: event.id,
        channels: routed.resolvedChannels,
        online: routed.isUserOnline,
        rateLimited: routed.rateLimitedChannels
      });

      // 🔥 NEW: Publish websocket notifications directly to Redis
      if (routed.resolvedChannels.includes(NotificationChannel.WEBSOCKET) && routed.isUserOnline) {
        await publish('notifications:websocket', JSON.stringify({
          userId: event.userId,
          eventId: event.id,
          type: event.type,
          payload: event.payload,
          timestamp: event.timestamp
        }));
        logger.info('Published to Redis for websocket', { eventId: event.id, userId: event.userId });
        logger.info('Publishing to Redis', {
          eventId: event.id,
          userId: event.userId,
          type: event.type
        });
      }
      
      // Publish to Kafka for downstream services
      await producer.sendSingle(KafkaTopics.NOTIFICATION_ROUTED, routed);

    } catch (error: any) {
      logger.error('Routing failed', { eventId: event.id, error: error.message });
    }
  });

  logger.info('Event Router running');
}

start().catch(err => {
  logger.error('Fatal error', { error: err.message });
  process.exit(1);
});