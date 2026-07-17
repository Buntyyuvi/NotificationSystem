import { getRedisClient } from './client';

const redis = getRedisClient();

export const checkRateLimit = async (
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> => {
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  
  return current <= maxRequests;
};