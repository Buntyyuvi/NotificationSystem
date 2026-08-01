import axios from 'axios';
import { API_URL } from '../config/api';

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