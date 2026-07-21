import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const notificationApi = {
  getNotifications: (page = 1, limit = 20) => 
    axios.get(`${API_URL}/notifications`, { params: { page, limit } }),
  
  getUnreadCount: () => 
    axios.get(`${API_URL}/notifications/unread-count`),
  
  markAsRead: (id: string) => 
    axios.patch(`${API_URL}/notifications/${id}/read`),
  
  markAllAsRead: () => 
    axios.patch(`${API_URL}/notifications/read-all`)
};