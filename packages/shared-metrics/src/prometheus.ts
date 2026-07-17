import client from 'prom-client';

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const eventsPublished = new client.Counter({
  name: 'events_published_total',
  help: 'Total events published to Kafka',
  labelNames: ['topic']
});

export const eventsConsumed = new client.Counter({
  name: 'events_consumed_total',
  help: 'Total events consumed from Kafka',
  labelNames: ['topic', 'group_id']
});

export const notificationsDelivered = new client.Counter({
  name: 'notifications_delivered_total',
  help: 'Total notifications delivered',
  labelNames: ['channel', 'status']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(eventsPublished);
register.registerMetric(eventsConsumed);
register.registerMetric(notificationsDelivered);