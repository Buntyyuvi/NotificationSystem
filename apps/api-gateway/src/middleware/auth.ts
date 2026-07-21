import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  // TEMPORARY: Auto-assign user-1 for testing
  req.userId = 'user-1';
  next();
};