import apiClient from './api';
import type { ContactInfo, PassengerFormState } from '../types/passenger';

export interface CreateBookingPayload {
  route: string;
  travelDate: string;
  arrival?: string;
  seatType?: string;
  seatCount: number;
  pricePerTicket: number;
  contact: ContactInfo;
  passengers: PassengerFormState[];
}

export interface CreateBookingResponse {
  bookingReference: string;
  total: number;
  currency: string;
}

export const bookingsService = {
  async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
    const response = await apiClient.post<CreateBookingResponse>('/bookings', payload);
    return response.data;
  },
};
