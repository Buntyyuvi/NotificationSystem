export interface KafkaConfig {
  clientId: string;
  brokers: string[];
  groupId?: string;
}

export const defaultConfig = (overrides: Partial<KafkaConfig> = {}): KafkaConfig => ({
  clientId: 'notification-service',
  brokers: ['localhost:9092'],
  ...overrides
});