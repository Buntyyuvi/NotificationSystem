import winston from 'winston';

const { combine, timestamp, json, errors } = winston.format;

export const createLogger = (serviceName: string) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: serviceName },
    format: combine(
      timestamp(),
      errors({ stack: true }),
      json()
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
};