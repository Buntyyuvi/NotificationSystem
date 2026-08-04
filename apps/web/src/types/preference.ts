export type NotificationChannel =
  | 'email'
  | 'push'
  | 'sms'
  | 'websocket'
  | 'slack';

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'Email',
  push: 'Push',
  sms: 'SMS',
  websocket: 'Real-time',
  slack: 'Slack'
};
