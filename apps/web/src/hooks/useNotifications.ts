import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../services/notificationApi';
import type { Notification, LiveNotification } from '../types/notification';

const PAGE_SIZE = 20;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchNotifications = useCallback(async (targetPage = 1, append = false) => {
    setLoading(true);
    try {
      const { data } = await notificationApi.getNotifications(targetPage, PAGE_SIZE);
      setNotifications(prev =>
        append ? [...prev, ...data.notifications] : data.notifications
      );
      setPage(data.pagination.page);
      setTotal(data.pagination.total);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1, true);
    }
  }, [hasMore, loading, page, fetchNotifications]);

  const prependNotification = useCallback((live: LiveNotification) => {
    setNotifications(prev => {
      if (prev.some(n => n.eventId === live.eventId)) return prev;
      return [
        {
          _id: live.eventId,
          eventId: live.eventId,
          type: live.type,
          payload: {},
          channels: ['websocket'],
          priority: 'medium',
          status: 'pending',
          createdAt: live.timestamp
        },
        ...prev
      ];
    });
    setUnreadCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    page,
    total,
    hasMore,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
    loadMore,
    prependNotification
  };
}
