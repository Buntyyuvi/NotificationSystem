import { Server as SocketServer } from 'socket.io';
import { createLogger } from '@notification-system/shared-logger';
import { broadcastToRoom } from '../socket/rooms';

const logger = createLogger('ws-gateway');

export interface NotificationPayload {
  eventId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export function setupNotificationHandler(io: SocketServer): void {
  // This function is called by delivery-service via Redis Pub/Sub
  // or directly if ws-gateway is in the same process
}

export function sendNotificationToUser(
  io: SocketServer,
  userId: string,
  notification: NotificationPayload
): void {
  logger.info('Sending notification', { userId, eventId: notification.eventId });
  broadcastToRoom(io, userId, 'notification:new', notification);
}

export function sendNotificationToUsers(
  io: SocketServer,
  userIds: string[],
  notification: NotificationPayload
): void {
  userIds.forEach(userId => {
    sendNotificationToUser(io, userId, notification);
  });
}