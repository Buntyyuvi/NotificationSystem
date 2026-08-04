import * as dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.DELIVERY_SERVICE_PORT || '3003'),
  KAFKA_BROKERS: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/notifications?authSource=admin',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Firebase (FCM)
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  
  // SendGrid
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL:
    process.env.SENDGRID_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    'no-reply@notifications.local',
  
  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER
};