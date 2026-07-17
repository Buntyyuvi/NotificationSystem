import { Kafka } from 'kafkajs';
import { KafkaConfig } from './config';

export class KafkaAdmin {
  private kafka: Kafka;

  constructor(config: KafkaConfig) {
    this.kafka = new Kafka({
      clientId: `${config.clientId}-admin`,
      brokers: config.brokers
    });
  }

  async createTopics(topics: { topic: string; numPartitions?: number; replicationFactor?: number }[]): Promise<void> {
    const admin = this.kafka.admin();
    await admin.connect();
    
    const existingTopics = await admin.listTopics();
    const topicsToCreate = topics.filter(t => !existingTopics.includes(t.topic));
    
    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate.map(t => ({
          topic: t.topic,
          numPartitions: t.numPartitions || 3,
          replicationFactor: t.replicationFactor || 1
        }))
      });
    }
    
    await admin.disconnect();
  }
}