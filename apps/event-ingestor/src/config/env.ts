import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.EVENT_INGESTOR_PORT || '3001',
  KAFKA_BROKERS: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  NODE_ENV: process.env.NODE_ENV || 'development'
};