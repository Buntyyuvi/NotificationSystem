import { Request, Response, NextFunction } from 'express';
import { createLogger } from './logger';

export const requestLogger = (serviceName: string) => {
  const logger = createLogger(serviceName);
  
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
      logger.info('HTTP Request', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: Date.now() - start,
        userAgent: req.get('user-agent'),
        ip: req.ip
      });
    });
    
    next();
  };
};