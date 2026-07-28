import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3002';

export function useSocket() {
  const { token, isLoggedIn } = useAuth();
  const { addLiveNotification } = useNotificationContext();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => console.log('WebSocket connected'));
    socket.on('disconnect', (reason) => console.log('WebSocket disconnected:', reason));
    socket.on('notification:new', (data) => addLiveNotification(data));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isLoggedIn, token, addLiveNotification]);

  return socketRef.current;
}
