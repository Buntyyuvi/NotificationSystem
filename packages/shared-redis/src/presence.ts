import { getRedisClient } from './client';

const redis = getRedisClient();
const PRESENCE_PREFIX = 'presence:';

export const setOnline = async (userId: string, socketId: string): Promise<void> => {
  await redis.setex(`${PRESENCE_PREFIX}${userId}`, 300, socketId); // 5 min TTL
};

export const setOffline = async (userId: string): Promise<void> => {
  await redis.del(`${PRESENCE_PREFIX}${userId}`);
};

export const isOnline = async (userId: string): Promise<boolean> => {
  const exists = await redis.exists(`${PRESENCE_PREFIX}${userId}`);
  return exists === 1;
};

export const getOnlineUsers = async (): Promise<string[]> => {
  const keys = await redis.keys(`${PRESENCE_PREFIX}*`);
  return keys.map((k:string) => k.replace(PRESENCE_PREFIX, ''));
};