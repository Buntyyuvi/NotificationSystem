import { createServer } from 'http';
import { createSocketServer } from './socket/connection';
import Redis from 'ioredis';
import { createLogger } from '@notification-system/shared-logger';
import { env } from './config/env';

const logger = createLogger('ws-gateway');

const httpServer = createServer();
const io = createSocketServer(httpServer);

// 🔥 Use dedicated Redis subscriber (not shared-redis pubsub)
const redisSub = new Redis(env.REDIS_URL);

redisSub.subscribe('notifications:websocket', (err) => {
  if (err) {
    logger.error('Redis subscribe failed', { error: err.message });
  } else {
    logger.info('✅ Subscribed to Redis channel: notifications:websocket');
  }
});

redisSub.on('message', (channel, message) => {
  logger.info('📨 Raw message from Redis', { channel, messageLength: message.length });
  
  try {
    const data = JSON.parse(message);
    logger.info('📋 Parsed data', { 
      hasUserId: !!data.userId, 
      hasEventId: !!data.eventId, 
      hasType: !!data.type,
      userId: data.userId,
      type: data.type
    });

    if (!data.userId) {
      logger.error('❌ Missing userId in message');
      return;
    }

    const notification = {
      eventId: data.eventId || 'unknown',
      type: data.type || 'unknown',
      title: (data.type || 'unknown').replace(/_/g, ' ').toUpperCase(),
      body: data.payload ? JSON.stringify(data.payload) : 'No content',
      timestamp: data.timestamp || new Date().toISOString()
    };

    logger.info('📤 Emitting to room', { room: data.userId, notification });
    
    // Check if room exists
    const rooms = io.sockets.adapter.rooms;
    const roomExists = rooms.has(data.userId);
    logger.info('🏠 Room check', { room: data.userId, exists: roomExists, roomSize: roomExists ? rooms.get(data.userId)?.size : 0 });

    io.to(data.userId).emit('notification:new', notification);
    
    logger.info('✅ EMITTED SUCCESSFULLY', { room: data.userId, eventId: data.eventId });

  } catch (err: any) {
    logger.error('❌ Failed to process', { error: err.message, stack: err.stack });
  }
});

httpServer.listen(env.PORT, () => {
  logger.info(`🚀 WebSocket Gateway running on port ${env.PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server');
  redisSub.disconnect();
  io.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
});

export { io };