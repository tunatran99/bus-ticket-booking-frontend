import { API_BASE_URL } from './api';
import { tokenStore } from './tokenStore';

export function startGoogleLoginPopup(): Promise<void> {
  return new Promise((resolve, reject) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const url = `${API_BASE_URL}/auth/google`;

    const popup = window.open(
      url,
      'google_login',
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup) {
      reject(new Error('Unable to open Google login window'));
      return;
    }

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        const token = tokenStore.getAccessToken();
        if (token) {
          resolve();
        } else {
          reject(new Error('Popup closed by user'));
        }
      }
    }, 500);
  });
}
