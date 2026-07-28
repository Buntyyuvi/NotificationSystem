import { api } from '../config/api';

export const preferenceApi = {
  getPreferences: () => api.get('/preferences'),
  updatePreference: (channel: string, updates: Record<string, unknown>) =>
    api.patch(`/preferences/${channel}`, updates)
};
