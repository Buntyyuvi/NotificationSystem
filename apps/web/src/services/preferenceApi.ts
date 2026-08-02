import { httpClient } from './httpClient';
import type { UserPreference } from '../types/user';

export const preferenceApi = {
  get: () => httpClient.get<{ preferences: UserPreference[] }>('/preferences'),

  update: (preferences: UserPreference[]) =>
    httpClient.put<{ preferences: UserPreference[] }>('/preferences', { preferences })
};
