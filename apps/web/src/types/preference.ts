export interface UserPreference {
  channel: 'email' | 'push' | 'sms' | 'websocket' | 'slack';
  enabled: boolean;
  digestMode: boolean;
}

export interface UserPreferences {
  userId: string;
  preferences: UserPreference[];
}
