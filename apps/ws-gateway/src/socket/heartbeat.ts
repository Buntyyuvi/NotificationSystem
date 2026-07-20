import { AuthenticatedSocket } from '../middleware/socketAuth';
import { createLogger } from '@notification-system/shared-logger';

const logger = createLogger('ws-gateway');

export function setupHeartbeat(socket: AuthenticatedSocket): void {
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  // Auto-ping every 20s to keep connection alive
  const interval = setInterval(() => {
    if (socket.connected) {
      socket.emit('ping', { timestamp: Date.now() });
    } else {
      clearInterval(interval);
    }
  }, 20000);
}