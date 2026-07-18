import dotenv from 'dotenv';
dotenv.config();

export const env = {
  KAFKA_BROKERS: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/notifications?authSource=admin',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  GROUP_ID: process.env.KAFKA_GROUP_ID || 'event-router-group'
};