import * as dotenv from "dotenv";
dotenv.config();


export const env = {
  PORT: parseInt(process.env.WS_GATEWAY_PORT || '3002'),
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};