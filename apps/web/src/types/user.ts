export interface User {
  userId: string;
  email: string;
  phone?: string;
  devices: {
    token: string;
    platform: 'ios' | 'android' | 'web';
  }[];
  preferences: {
    channel: string;
    enabled: boolean;
    digestMode: boolean;
  }[];
}
