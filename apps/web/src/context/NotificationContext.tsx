import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useSocket } from '../hooks/useSocket';
import type { Notification, LiveNotification } from '../types/notification';

interface NotificationContextValue {
  notifications: Notification[];
  liveNotifications: LiveNotification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  total: number;
  connected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => void;
  loadMore: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notificationsState = useNotifications();
  const { prependNotification } = notificationsState;

  const handleLive = useCallback(
    (data: Parameters<typeof prependNotification>[0]) => {
      prependNotification(data);
    },
    [prependNotification]
  );

  const socketState = useSocket(handleLive);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications: notificationsState.notifications,
      liveNotifications: socketState.liveNotifications,
      unreadCount: notificationsState.unreadCount,
      loading: notificationsState.loading,
      hasMore: notificationsState.hasMore,
      total: notificationsState.total,
      connected: socketState.connected,
      markAsRead: notificationsState.markAsRead,
      markAllAsRead: notificationsState.markAllAsRead,
      refresh: notificationsState.refresh,
      loadMore: notificationsState.loadMore
    }),
    [
      notificationsState.notifications,
      notificationsState.unreadCount,
      notificationsState.loading,
      notificationsState.hasMore,
      notificationsState.total,
      notificationsState.markAsRead,
      notificationsState.markAllAsRead,
      notificationsState.refresh,
      notificationsState.loadMore,
      socketState.connected,
      socketState.liveNotifications
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotificationContext(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return ctx;
}
