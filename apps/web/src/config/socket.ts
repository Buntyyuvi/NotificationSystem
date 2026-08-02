import { io, type Socket } from 'socket.io-client';
import { getToken } from '../utils/token';

const WS_URL: string =
  (import.meta.env.VITE_WS_URL as string) ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export const socket: Socket = io(WS_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  auth: { token: getToken() ?? undefined }
});

export function updateSocketToken(token: string | null): void {
  socket.auth = { token: token ?? undefined };
  socket.disconnect();
  if (token) socket.connect();
}

// Only connect immediately if we already have a session token
if (getToken()) {
  socket.connect();
}
