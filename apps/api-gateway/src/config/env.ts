import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.API_GATEWAY_PORT || '3000'),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/notifications?authSource=admin',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production'
};