import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { tokenStore } from './tokenStore';

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: any) => {
    config.headers = config.headers || {};

    // Add X-Request-ID
    (config.headers as any)['X-Request-ID'] = uuidv4();

    // Add Authorization token if available
    const token = tokenStore.getAccessToken();
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: any) => Promise.reject(error)
);

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const url: string = originalRequest?.url || '';
      const isAuthEndpoint =
        url.includes('/user/login') ||
        url.includes('/user/register') ||
        url.includes('/user/forgot-password') ||
        url.includes('/user/refresh');
      const hadAuthHeader = Boolean(originalRequest?.headers?.Authorization);

      if (isAuthEndpoint || !hadAuthHeader) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshToken = tokenStore.getRefreshToken();
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const response = await axios.post(`${API_BASE_URL}/user/refresh`, {
              refreshToken,
            });
            const { accessToken } = response.data.data;
            tokenStore.setAccessToken(accessToken);
            isRefreshing = false;
            onRefreshed(accessToken);
          } catch (refreshError) {
            isRefreshing = false;
            tokenStore.clearAll();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
