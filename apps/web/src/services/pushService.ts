import { httpClient } from './httpClient';

export const pushService = {
  registerDevice: (token: string, platform: 'ios' | 'android' | 'web' = 'web') =>
    httpClient.post('/devices', { token, platform })
};
