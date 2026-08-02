import { Router } from 'express';
import { User } from '@notification-system/shared-db';
import { createLogger } from '@notification-system/shared-logger';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const logger = createLogger('api-gateway');

const VALID_PLATFORMS = ['ios', 'android', 'web'];

// POST /devices — register a push device token for the authenticated user
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { token, platform } = req.body ?? {};
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'token is required' });
    }

    const p = platform && VALID_PLATFORMS.includes(platform) ? platform : 'web';

    const user = await User.findOneAndUpdate(
      { userId: req.userId },
      [
        {
          $set: {
            devices: {
              $concatArrays: [
                [{ token, platform: p }],
                {
                  $filter: {
                    input: { $ifNull: ['$devices', []] },
                    as: 'd',
                    cond: { $ne: ['$$d.token', token] }
                  }
                }
              ]
            }
          }
        }
      ],
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('Device registered', { userId: req.userId, platform: p });
    res.json({ success: true, devices: user.devices });
  } catch (error: any) {
    logger.error('Failed to register device', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as deviceRoutes };
