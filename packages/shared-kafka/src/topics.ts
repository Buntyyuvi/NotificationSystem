export const KafkaTopics = {
  NOTIFICATION_EVENTS: 'notifications.events',
  NOTIFICATION_ROUTED: 'notifications.routed',
  NOTIFICATION_RENDERED: 'notifications.rendered',
  NOTIFICATION_DELIVERY: 'notifications.delivery',
  DEAD_LETTER: 'notifications.dlq'
} as const;

export type KafkaTopic = typeof KafkaTopics[keyof typeof KafkaTopics];