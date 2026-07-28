export interface Notification {
  _id: string;
  eventId: string;
  type: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'retrying';
  readAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  channels: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta: {
    unread: number;
  };
}
