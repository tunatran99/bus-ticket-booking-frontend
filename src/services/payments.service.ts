import apiClient from './api';
import type { BookingContactVerification } from './bookings.service';

export type PaymentStatus = 'processing' | 'succeeded' | 'failed' | 'cancelled';

export interface PaymentSession {
  paymentId: string;
  bookingReference: string;
  status: PaymentStatus | 'pending';
  amount: number;
  currency: string;
  checkoutUrl: string;
  expiresAt?: string | null;
}

interface CreateSessionPayload {
  bookingReference: string;
  successUrl: string;
  cancelUrl?: string;
  contact?: BookingContactVerification;
  isGuest?: boolean;
}

export const paymentsService = {
  async createSession(payload: CreateSessionPayload): Promise<PaymentSession> {
    const endpoint = payload.isGuest ? '/payments/session/guest' : '/payments/session';
    const response = await apiClient.post<{ success: boolean; data: PaymentSession }>(
      endpoint,
      payload.isGuest
        ? {
            bookingReference: payload.bookingReference,
            successUrl: payload.successUrl,
            cancelUrl: payload.cancelUrl,
            contact: payload.contact,
          }
        : {
            bookingReference: payload.bookingReference,
            successUrl: payload.successUrl,
            cancelUrl: payload.cancelUrl,
          },
    );
    return response.data.data;
  },

  async getStatus(paymentId: string): Promise<PaymentSession> {
    const response = await apiClient.get<{ success: boolean; data: PaymentSession }>(
      `/payments/${paymentId}`,
    );
    return response.data.data;
  },

  async simulateWebhook(paymentId: string, status: 'succeeded' | 'failed') {
    await apiClient.post('/payments/payos/webhook', {
      signature: 'demo',
      data: {
        paymentId,
        status,
      },
    });
  },
};
