import { io } from 'socket.io-client';

export const socket = io('http://localhost:3002', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000
});

// Force connect immediately
socket.connect();