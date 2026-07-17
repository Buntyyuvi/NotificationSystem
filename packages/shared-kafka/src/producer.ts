import { Kafka, Producer, Partitioners } from 'kafkajs';
import { KafkaConfig } from './config';

export class KafkaProducer {
  private producer: Producer;

  constructor(config: KafkaConfig) {
    const kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers
    });
    this.producer = kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner
    });
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async send<T>(topic: string, messages: T[]): Promise<void> {
    await this.producer.send({
      topic,
      messages: messages.map(msg => ({
        value: JSON.stringify(msg)
      }))
    });
  }

  async sendSingle<T>(topic: string, message: T): Promise<void> {
    await this.send(topic, [message]);
  }
}