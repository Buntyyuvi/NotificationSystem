export interface Notification {
  _id: string;
  eventId: string;
  type: string;
  payload: Record<string, unknown>;
  channels: string[];
  priority: string;
  status: string;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationListResponse {
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

export interface LiveNotification {
  eventId: string;
  type: string;
  title: string;
  body: string;
  timestamp: string;
}
