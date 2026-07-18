import { connectDB } from '@notification-system/shared-db';
import { KafkaConsumer, KafkaProducer, KafkaTopics, defaultConfig } from '@notification-system/shared-kafka';
import { createLogger } from '@notification-system/shared-logger';
import { getRedisClient } from '@notification-system/shared-redis';
import { env } from './config/env';
import { routeEvent } from './router/engine';

const logger = createLogger('event-router');

async function start() {
  // Connect to MongoDB
  await connectDB(env.MONGODB_URI);
  
  // Verify Redis
  const redis = getRedisClient(env.REDIS_URL);
  await redis.ping();
  logger.info('Redis connected');

  // Setup Kafka consumer
  const consumer = new KafkaConsumer(defaultConfig({
    clientId: 'event-router',
    brokers: env.KAFKA_BROKERS,
    groupId: env.GROUP_ID
  }));

  // Setup Kafka producer for routed events
  const producer = new KafkaProducer(defaultConfig({
    clientId: 'event-router-producer',
    brokers: env.KAFKA_BROKERS
  }));

  await consumer.connect();
  await producer.connect();
  logger.info('Kafka connected');

  // Subscribe and process events
  await consumer.subscribe([KafkaTopics.NOTIFICATION_EVENTS]);

  await consumer.run(async ({message }) => {
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

      // Publish routed event to next topic
      await producer.sendSingle(KafkaTopics.NOTIFICATION_ROUTED, routed);

    } catch (error: any) {
      logger.error('Routing failed', { eventId: event.id, error: error.message });
      // Optionally: send to DLQ
    }
  });

  logger.info('Event Router running');
}

start().catch(err => {
  logger.error('Fatal error', { error: err.message });
  process.exit(1);
});