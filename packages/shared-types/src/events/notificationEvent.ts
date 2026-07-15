import { z } from 'zod';
import { NotificationChannel } from '../enums/channels';
import { Priority } from '../enums/priority';

export const NotificationEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  payload: z.record(z.unknown()),
  userId: z.string(),
  channels: z.array(z.nativeEnum(NotificationChannel)),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  traceId: z.string().optional(),
  timestamp: z.string().datetime().default(() => new Date().toISOString())
});

export type NotificationEvent = z.infer<typeof NotificationEventSchema>;