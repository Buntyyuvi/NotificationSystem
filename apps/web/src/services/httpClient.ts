import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from '../utils/token';

export const httpClient = axios.create({ baseURL: API_URL });

httpClient.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
