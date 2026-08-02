import { Router } from 'express';
import { User } from '@notification-system/shared-db';
import { createLogger } from '@notification-system/shared-logger';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const logger = createLogger('api-gateway');

// GET /preferences
router.get('/', async (req: AuthRequest, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ preferences: user.preferences ?? [] });
  } catch (error: any) {
    logger.error('Failed to fetch preferences', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /preferences
router.put('/', async (req: AuthRequest, res) => {
  try {
    const { preferences } = req.body ?? {};
    if (!Array.isArray(preferences)) {
      return res.status(400).json({ error: 'preferences must be an array' });
    }

    const user = await User.findOneAndUpdate(
      { userId: req.userId },
      { $set: { preferences } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ preferences: user.preferences ?? [] });
  } catch (error: any) {
    logger.error('Failed to update preferences', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as preferenceRoutes };
