import apiClient from './api';

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  reminderHoursBefore: number;
  updatedAt: string;
}

export interface UpdatePreferencesPayload {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  reminderHoursBefore?: number;
}

export const notificationsService = {
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get<{ success: boolean; data: NotificationPreferences }>(
      '/notifications/preferences',
    );
    return response.data.data;
  },

  async updatePreferences(payload: UpdatePreferencesPayload): Promise<NotificationPreferences> {
    const response = await apiClient.put<{ success: boolean; data: NotificationPreferences }>(
      '/notifications/preferences',
      payload,
    );
    return response.data.data;
  },
};
