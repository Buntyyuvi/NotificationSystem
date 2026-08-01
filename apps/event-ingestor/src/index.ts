import express from 'express';
import dotenv from 'dotenv';
import { NotificationEventSchema } from '@notification-system/shared-types';
import { KafkaProducer, KafkaTopics, defaultConfig } from '@notification-system/shared-kafka';
import { generateId, generateTraceId, now } from '@notification-system/shared-utils';
import { createLogger } from '@notification-system/shared-logger';
import { metricsMiddleware, metricsEndpoint } from '@notification-system/shared-metrics';

dotenv.config();

const logger = createLogger('event-ingestor');
const app = express();
app.use(express.json());
app.use(metricsMiddleware);

const producer = new KafkaProducer(defaultConfig({
  clientId: 'event-ingestor',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
}));

app.post('/events', async (req, res) => {
  try {
    const parsed = NotificationEventSchema.omit({ id: true, timestamp: true, traceId: true }).parse(req.body);
    
    const event = {
      ...parsed,
      id: generateId(),
      traceId: generateTraceId(),
      timestamp: now()
    };

    await producer.sendSingle(KafkaTopics.NOTIFICATION_EVENTS, event);
    logger.info('Event published', { eventId: event.id, type: event.type });

    res.status(202).json({
      success: true,
      eventId: event.id,
      traceId: event.traceId
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      logger.warn('Validation failed', { error: err.message });
      return res.status(400).json({ success: false, error: err.message });
    }
    logger.error('Failed to publish event', { error: err.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'event-ingestor' });
});

app.get('/metrics', metricsEndpoint);

async function start() {
  for (let attempt = 1; ; attempt++) {
    try {
      await producer.connect();
      break;
    } catch (err: any) {
      logger.warn(`Kafka connect failed (attempt ${attempt}), retrying in 5s`, { error: err.message });
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  logger.info('Kafka producer connected');
  
  const port = process.env.EVENT_INGESTOR_PORT || 3001;
  app.listen(port, () => {
    logger.info(`Event Ingestor running on port ${port}`);
  });

  process.on('SIGTERM', async () => {
    await producer.disconnect();
    process.exit(0);
  });
}

start().catch(err => {
  logger.error('Fatal error', { error: err.message });
  process.exit(1);
});