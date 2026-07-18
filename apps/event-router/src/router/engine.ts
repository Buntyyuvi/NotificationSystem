import { NotificationEvent, NotificationChannel } from '@notification-system/shared-types';
import { resolveChannels } from '../services/preferenceResolver';
import { checkPresence } from '../services/presenceChecker';
import { filterChannels } from './filters';
import { applyRateLimit } from './rateLimiter';

export interface RoutedEvent extends NotificationEvent {
  resolvedChannels: NotificationChannel[];
  isUserOnline: boolean;
  rateLimitedChannels: NotificationChannel[];
}

export async function routeEvent(event: NotificationEvent): Promise<RoutedEvent> {
  // Step 1: Resolve user preferences
  const { channels: allowedChannels, digestMode } = await resolveChannels(
    event.userId,
    event.channels
  );

  // Step 2: Check if user is online
  const userOnline = await checkPresence(event.userId);

  // Step 3: Filter channels based on presence
  let finalChannels = filterChannels(allowedChannels, userOnline);

  // Step 4: Apply rate limiting per channel
  const rateLimitedChannels: NotificationChannel[] = [];
  const allowedAfterRateLimit: NotificationChannel[] = [];

  for (const channel of finalChannels) {
    const allowed = await applyRateLimit(event.userId, channel);
    if (allowed) {
      allowedAfterRateLimit.push(channel);
    } else {
      rateLimitedChannels.push(channel);
    }
  }

  return {
    ...event,
    resolvedChannels: allowedAfterRateLimit,
    isUserOnline: userOnline,
    rateLimitedChannels
  };
}