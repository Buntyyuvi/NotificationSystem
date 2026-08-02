import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { User } from '@notification-system/shared-db';
import { createLogger } from '@notification-system/shared-logger';
import { env } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const logger = createLogger('api-gateway');

const SALT_ROUNDS = 10;
const TOKEN_TTL = '7d';

function signToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function toSafeUser(user: any) {
  return {
    userId: user.userId,
    email: user.email,
    phone: user.phone ?? undefined,
    preferences: user.preferences ?? [],
    createdAt: user.createdAt
  };
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
    const user = await User.create({
      userId: `user-${randomUUID()}`,
      email: normalizedEmail,
      passwordHash,
      preferences: []
    });

    logger.info('User registered', { userId: user.userId });
    res.status(201).json({ user: toSafeUser(user), token: signToken(user.userId) });
  } catch (error: any) {
    logger.error('Failed to register', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ user: toSafeUser(user), token: signToken(user.userId) });
  } catch (error: any) {
    logger.error('Failed to login', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: toSafeUser(user) });
  } catch (error: any) {
    logger.error('Failed to fetch user', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as authRoutes };
