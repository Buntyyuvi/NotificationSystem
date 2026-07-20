import { AuthenticatedSocket } from '../middleware/socketAuth';
import { createLogger } from '@notification-system/shared-logger';

const logger = createLogger('ws-gateway');

export function handleJoinRoom(socket: AuthenticatedSocket, roomId: string): void {
  socket.join(roomId);
  logger.info('Joined room', { socketId: socket.id, userId: socket.userId, roomId });
}

export function handleLeaveRoom(socket: AuthenticatedSocket, roomId: string): void {
  socket.leave(roomId);
  logger.info('Left room', { socketId: socket.id, userId: socket.userId, roomId });
}

export function broadcastToRoom(
  io: any,
  roomId: string,
  event: string,
  data: unknown
): void {
  io.to(roomId).emit(event, data);
}
