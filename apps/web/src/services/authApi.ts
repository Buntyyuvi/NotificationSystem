import { httpClient } from './httpClient';
import type { User } from '../types/user';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (email: string, password: string) =>
    httpClient.post<AuthResponse>('/auth/register', { email, password }),

  login: (email: string, password: string) =>
    httpClient.post<AuthResponse>('/auth/login', { email, password }),

  me: () => httpClient.get<{ user: User }>('/auth/me')
};
