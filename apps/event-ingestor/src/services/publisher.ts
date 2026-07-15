import { Kafka, Producer } from 'kafkajs';
import { env } from '../config/env';

const kafka = new Kafka({
  clientId: 'event-ingestor',
  brokers: env.KAFKA_BROKERS
});

let producer: Producer;

export async function connectProducer(): Promise<void> {
  producer = kafka.producer();
  await producer.connect();
  console.log('✅ Kafka producer connected');
}

export async function publishEvent(topic: string, message: unknown): Promise<void> {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }]
  });
}

export async function disconnectProducer(): Promise<void> {
  await producer.disconnect();
}