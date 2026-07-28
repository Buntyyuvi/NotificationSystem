import { Router } from 'express';
import { Notification } from '@notification-system/shared-db';
import { DeliveryStatus } from '@notification-system/shared-types';
import { createLogger } from '@notification-system/shared-logger';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const logger = createLogger('api-gateway');

// GET /notifications — list with pagination
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const query: any = { userId };
    if (status) query.status = status;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unread = await Notification.countDocuments({ userId, status: { $ne: DeliveryStatus.DELIVERED } });

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      meta: {
        unread
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch notifications', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /notifications/unread-count
router.get('/unread-count', async (req: AuthRequest, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId!,
      readAt: { $exists: false }
    });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', async (req: AuthRequest, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId! },
      { $set: { readAt: new Date(), status: DeliveryStatus.DELIVERED } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /notifications/read-all
router.patch('/read-all', async (req: AuthRequest, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId!, readAt: { $exists: false } },
      { $set: { readAt: new Date(), status: DeliveryStatus.DELIVERED } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as notificationRoutes };