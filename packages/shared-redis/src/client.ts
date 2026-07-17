import Redis from 'ioredis';

let redisClient: Redis | null = null;

export const getRedisClient = (url?: string): Redis => {
  if (!redisClient) {
    redisClient = new Redis(url || 'redis://localhost:6379');
  }
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}; 