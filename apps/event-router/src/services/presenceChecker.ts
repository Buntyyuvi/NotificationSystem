import { isOnline } from '@notification-system/shared-redis';

export async function checkPresence(userId: string): Promise<boolean> {
  return await isOnline(userId);
}