import { setOnline, setOffline } from '@notification-system/shared-redis';
import { createLogger } from '@notification-system/shared-logger';

const logger = createLogger('ws-gateway');

export async function handlePresenceOnConnect(userId: string, socketId: string): Promise<void> {
  await setOnline(userId, socketId);
  logger.info('User online', { userId, socketId });
}

export async function handlePresenceOnDisconnect(userId: string): Promise<void> {
  await setOffline(userId);
  logger.info('User offline', { userId });
}