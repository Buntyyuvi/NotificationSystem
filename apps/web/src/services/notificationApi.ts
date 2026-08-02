import { httpClient } from './httpClient';

export const notificationApi = {
  getNotifications: (page = 1, limit = 20) =>
    httpClient.get('/notifications', { params: { page, limit } }),

  getUnreadCount: () =>
    httpClient.get('/notifications/unread-count'),

  markAsRead: (id: string) =>
    httpClient.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    httpClient.patch('/notifications/read-all')
};
