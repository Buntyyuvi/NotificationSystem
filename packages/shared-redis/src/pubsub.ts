import { getRedisClient } from './client';

const pubClient = getRedisClient();
const subClient = getRedisClient().duplicate();

export const publish = async (channel: string, message: unknown): Promise<void> => {
  await pubClient.publish(channel, JSON.stringify(message));
};

export const subscribe = (channel: string, handler: (message: string) => void): void => {
  subClient.subscribe(channel, (err : any) => {
    if (err) console.error('Subscribe error:', err);
  });
  
  subClient.on('message', (receivedChannel : any, message : any) => {
    if (receivedChannel === channel) {
      handler(message);
    }
  });
};