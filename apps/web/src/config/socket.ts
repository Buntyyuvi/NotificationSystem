import { io } from 'socket.io-client';

const WS_URL: string =
  (import.meta.env.VITE_WS_URL as string) ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export const socket = io(WS_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000
});

// Force connect immediately
socket.connect();