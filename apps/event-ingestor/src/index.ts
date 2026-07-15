import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { env } from './config/env';
import { connectProducer, publishEvent, disconnectProducer } from './services/publisher';
import { IngestEventSchema } from './validators/eventSchema';

const app = express();
app.use(express.json());

app.post('/events', async (req, res) => {
  try {
    const parsed = IngestEventSchema.parse(req.body);
    const event = {
      ...parsed,
      id: parsed.id || uuidv4(),
      traceId: parsed.traceId || uuidv4(),
      timestamp: new Date().toISOString()
    };

    await publishEvent('notifications.events', event);

    res.status(202).json({
      success: true,
      eventId: event.id,
      traceId: event.traceId
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'event-ingestor' });
});

async function start() {
  await connectProducer();
  app.listen(env.PORT, () => {
    console.log(`🚀 Event Ingestor running on port ${env.PORT}`);
  });

  process.on('SIGTERM', async () => {
    await disconnectProducer();
    process.exit(0);
  });
}

start();