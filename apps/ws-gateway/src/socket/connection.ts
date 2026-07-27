import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisClient } from '@notification-system/shared-redis';
import { createLogger } from '@notification-system/shared-logger';
import { env } from '../config/env';
import { socketAuth, AuthenticatedSocket } from '../middleware/socketAuth';
import { handleJoinRoom, handleLeaveRoom } from './rooms';
import { handlePresenceOnConnect, handlePresenceOnDisconnect } from './presence';
import { setupHeartbeat } from './heartbeat';

const logger = createLogger('ws-gateway');

export function createSocketServer(httpServer: any): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  try {
    const pubClient = getRedisClient(env.REDIS_URL);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Redis adapter attached');
  } catch (err: any) {
    logger.warn('Redis adapter failed, continuing without', { error: err.message });
  }

  io.use(socketAuth);

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    logger.info('Client connected', { socketId: socket.id, userId });

    handlePresenceOnConnect(userId, socket.id);
    handleJoinRoom(socket, userId);
    setupHeartbeat(socket);

    socket.on('disconnect', (reason: string) => {
      logger.info('Client disconnected', { socketId: socket.id, userId, reason });
      handlePresenceOnDisconnect(userId);
      handleLeaveRoom(socket, userId);
    });

    socket.on('logout', () => {
      logger.info('Client logged out', { socketId: socket.id, userId });
      handlePresenceOnDisconnect(userId);
      socket.disconnect();
    });
  });

  return io;
}
