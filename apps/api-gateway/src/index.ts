import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from '@notification-system/shared-db';
import { createLogger } from '@notification-system/shared-logger';
import { env } from './config/env';
import { authRoutes } from './routes/auth';
import { deviceRoutes } from './routes/devices';
import { notificationRoutes } from './routes/notifications';
import { preferenceRoutes } from './routes/preferences';
import { authMiddleware } from './middleware/auth';

const logger = createLogger('api-gateway');

const app = express();

// Requests arrive via the nginx proxy which sets X-Forwarded-For;
// trust that single hop so rate limits key on the real client IP.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Brute-force protection: strict limit on auth endpoints only
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later' }
});

// Generous per-client limit for the authenticated API (history, prefs, devices)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});

app.use('/auth', authLimiter);
app.use('/notifications', apiLimiter);
app.use('/preferences', apiLimiter);
app.use('/devices', apiLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Auth routes (public: register/login)
app.use('/auth', authRoutes);

// Protected routes
app.use('/notifications', authMiddleware, notificationRoutes);
app.use('/preferences', authMiddleware, preferenceRoutes);
app.use('/devices', authMiddleware, deviceRoutes);

async function start() {
  await connectDB(env.MONGODB_URI);
  logger.info('MongoDB connected');

  app.listen(env.PORT, () => {
    logger.info(`🚀 API Gateway running on port ${env.PORT}`);
  });
}

start().catch(err => {
  logger.error('Fatal error', { error: err.message });
  process.exit(1);
});