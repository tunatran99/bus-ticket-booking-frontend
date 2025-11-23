import apiClient, { API_BASE_URL } from './api';
import { tokenStore } from './tokenStore';
import axios from 'axios';
import { scheduleAutoRefresh, clearAutoRefresh } from './autoRefresh';

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface LoginData {
  identifier: string;
  password: string;
}

export interface User {
  userId: string;
  email: string;
  phone: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    user?: User;
  };
  message?: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/user/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post('/user/login', data);
    const { accessToken, refreshToken } = response.data.data;

    if (accessToken) tokenStore.setAccessToken(accessToken);
    if (refreshToken) tokenStore.setRefreshToken(refreshToken);
    if (response.data.data?.expiresIn) {
      scheduleAutoRefresh(response.data.data.expiresIn, () => this.refreshWithStoredToken());
    }

    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/user/logout');
    } finally {
      tokenStore.clearAll();
      clearAutoRefresh();
    }
  },

  async currentUser(): Promise<User> {
    const response = await apiClient.get('/user/me');
    return response.data.data;
  },

  async refreshWithStoredToken(): Promise<string | null> {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) return null;
    const response = await axios.post(`${API_BASE_URL}/user/refresh`, { refreshToken });
    const { accessToken, expiresIn } = response.data.data || {};
    if (accessToken) {
      tokenStore.setAccessToken(accessToken);
      if (expiresIn) {
        scheduleAutoRefresh(expiresIn, () => this.refreshWithStoredToken());
      }
      return accessToken;
    }
    return null;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/user/forgot-password', { email });
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!tokenStore.getAccessToken();
  },
};
