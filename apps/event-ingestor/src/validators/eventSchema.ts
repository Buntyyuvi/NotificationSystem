import { z } from 'zod';
import { NotificationEventSchema } from '@notification-system/shared-types';

export const IngestEventSchema = NotificationEventSchema.omit({ id: true, timestamp: true, traceId: true })
  .extend({
    id: z.string().uuid().optional(),
    traceId: z.string().optional()
  });

export type IngestEvent = z.infer<typeof IngestEventSchema>;