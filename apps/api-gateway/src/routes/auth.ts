import { Router, Request, Response } from 'express';
import { generateToken } from '../middleware/auth';
import { createLogger } from '@notification-system/shared-logger';

const router = Router();
const logger = createLogger('api-gateway');

// POST /auth/login — simplified login (no password, just userId for demo)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const token = generateToken(userId);
    logger.info('User logged in', { userId });
    res.json({ success: true, token, userId });
  } catch (error: any) {
    logger.error('Login failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/verify — verify a token
router.post('/verify', (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-in-production');
    res.json({ valid: true, userId: (decoded as any).userId });
  } catch {
    res.json({ valid: false });
  }
});

export { router as authRoutes };
