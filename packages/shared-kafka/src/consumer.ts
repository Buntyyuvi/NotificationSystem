import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaConfig } from './config';

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;

export class KafkaConsumer {
  private consumer: Consumer;

  constructor(config: KafkaConfig) {
    const kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers
    });
    this.consumer = kafka.consumer({
      groupId: config.groupId || 'default-group'
    });
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }

  async subscribe(topics: string[]): Promise<void> {
    await Promise.all(
      topics.map(topic => this.consumer.subscribe({ topic, fromBeginning: false }))
    );
  }

  async run(handler: MessageHandler): Promise<void> {
    await this.consumer.run({
      eachMessage: async (payload) => {
        try {
          await handler(payload);
        } catch (error) {
          console.error('Error processing message:', error);
          throw error;
        }
      }
    });
  }
}