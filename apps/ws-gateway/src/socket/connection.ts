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
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: false
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling']
    });

    // Redis adapter for multi-node scaling
    try {
      const pubClient = getRedisClient(env.REDIS_URL);
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Redis adapter attached');
    } catch (err: any) {
      logger.warn('Redis adapter failed, continuing without', { error: err.message });
    }

    // Auth middleware
    io.use(socketAuth);

    io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      logger.info('Client connected', { socketId: socket.id, userId });

      // Set presence to online
      handlePresenceOnConnect(userId, socket.id);

      // Join user's personal room
      handleJoinRoom(socket, userId);

      // Setup heartbeat
      setupHeartbeat(socket);

      // Handle disconnect
      socket.on('disconnect', (reason: string) => {
        logger.info('Client disconnected', { socketId: socket.id, userId, reason });
        handlePresenceOnDisconnect(userId);
        handleLeaveRoom(socket, userId);
      });

      // Handle explicit logout
      socket.on('logout', () => {
        logger.info('Client logged out', { socketId: socket.id, userId });
        handlePresenceOnDisconnect(userId);
        socket.disconnect();
      });
    });

    return io;
  }