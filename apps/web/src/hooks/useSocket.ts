import { useEffect, useState } from 'react';
import { socket } from '../config/socket';
import type { LiveNotification } from '../types/notification';
import { playNotificationSound } from '../utils/sound';

export function useSocket(onNotification?: (data: LiveNotification) => void) {
  const [connected, setConnected] = useState<boolean>(socket.connected);
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);

  useEffect(() => {
    const handleConnect = (): void => setConnected(true);
    const handleDisconnect = (): void => setConnected(false);
    const handleNotification = (data: LiveNotification): void => {
      playNotificationSound();
      setLiveNotifications(prev => [data, ...prev].slice(0, 50));
      onNotification?.(data);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('notification:new', handleNotification);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNotification]);

  return { connected, liveNotifications };
}
