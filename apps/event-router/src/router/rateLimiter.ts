import { checkRateLimit } from '@notification-system/shared-redis';

const RATE_LIMITS: Record<string, { max: number; window: number }> = {
  push: { max: 10, window: 60 },      // 10 push/minute
  email: { max: 5, window: 60 },      // 5 emails/minute
  sms: { max: 3, window: 3600 },      // 3 SMS/hour
  websocket: { max: 100, window: 60 }, // 100 WS/minute
  slack: { max: 20, window: 60 }
};

export async function applyRateLimit(
  userId: string,
  channel: string
): Promise<boolean> {
  const limit = RATE_LIMITS[channel];
  if (!limit) return true; // No limit defined = allow

  const key = `ratelimit:${userId}:${channel}`;
  return await checkRateLimit(key, limit.max, limit.window);
}