import Redis from 'ioredis';

let redisClient: Redis | null = null;

export const getRedisClient = (url?: string): Redis => {
  if (!redisClient) {
    const connectionUrl = url || process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(connectionUrl, {
      maxRetriesPerRequest: null,
      retryStrategy: (times: number) => Math.min(times * 500, 5000)
    });
    redisClient.on('error', () => {
      // ioredis emits 'error' on connection failures; without a listener
      // an unhandled 'error' event crashes the process. ioredis keeps
      // retrying automatically per retryStrategy, so we only suppress.
    });
  }
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}; 