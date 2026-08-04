export interface UserPreference {
  channel: string;
  enabled: boolean;
  digestMode: boolean;
}

export interface User {
  userId: string;
  email: string;
  phone?: string;
  preferences: UserPreference[];
  createdAt: string;
}
