import { NotificationChannel } from '@notification-system/shared-types';

export function filterChannels(
  channels: NotificationChannel[],
  isUserOnline: boolean
): NotificationChannel[] {
  // If user is online, prioritize real-time channels
  if (isUserOnline) {
    // Push websocket first, skip email/SMS for instant notifications
    const realtimeFirst = [NotificationChannel.WEBSOCKET, NotificationChannel.PUSH];
    const rest = channels.filter(c => !realtimeFirst.includes(c));
    return [...realtimeFirst.filter(c => channels.includes(c)), ...rest];
  }

  // User offline: skip websocket, keep push/email/SMS
  return channels.filter(c => c !== NotificationChannel.WEBSOCKET);
}