let accessTokenMemory: string | null = null;

export const tokenStore = {
  getAccessToken(): string | null {
    return accessTokenMemory;
  },
  setAccessToken(token: string | null) {
    accessTokenMemory = token;
  },
  clearAccessToken() {
    accessTokenMemory = null;
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },
  setRefreshToken(token: string | null) {
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  },
  clearAll() {
    accessTokenMemory = null;
    localStorage.removeItem('refreshToken');
  },
};
