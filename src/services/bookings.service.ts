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
  terminal?: string;
  company?: string;
  busPlate?: string;
}

export interface CreateBookingResponseData {
  bookingReference: string;
  total: number;
  currency: string;
  status: string;
  expiresAt?: string | null;
}

export interface CreateBookingResponse {
  success: boolean;
  data: CreateBookingResponseData;
}

export interface BookingRecord {
  bookingReference: string;
  userId?: string | null;
  route: string;
  travelDate: string;
  arrival?: string;
  seatType?: string;
  seatCount: number;
  pricePerTicket: number;
  total: number;
  currency: string;
  terminal?: string;
  company?: string;
  busPlate?: string;
  contact: ContactInfo;
  passengers: PassengerFormState[];
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
}

export interface BookingContactVerification {
  phone?: string;
  email?: string;
}

export interface GuestBookingLookupPayload {
  bookingReference: string;
  contact: BookingContactVerification;
}

export interface SeatAvailabilitySeat {
  seatLabel: string;
  status: 'locked' | 'confirmed';
  bookingReference: string;
  expiresAt?: string | null;
}

export interface SeatAvailabilitySnapshot {
  route: string;
  travelDate: string;
  busPlate?: string;
  seatType?: string;
  seats: SeatAvailabilitySeat[];
  reservedSeatIds: string[];
}

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const bookingsService = {
  async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponseData> {
    const response = await apiClient.post<CreateBookingResponse>('/bookings', payload);
    return response.data.data;
  },

  async createGuestBooking(payload: CreateBookingPayload): Promise<CreateBookingResponseData> {
    const response = await apiClient.post<CreateBookingResponse>('/bookings/guest', payload);
    return response.data.data;
  },

  async confirmBooking(reference: string): Promise<BookingRecord> {
    const response = await apiClient.patch<ApiResponse<BookingRecord>>(
      `/bookings/${reference}/confirm`,
    );
    return response.data.data;
  },

  async confirmGuestBooking(
    reference: string,
    contact: BookingContactVerification,
  ): Promise<BookingRecord> {
    const response = await apiClient.patch<ApiResponse<BookingRecord>>(
      `/bookings/${reference}/guest-confirm`,
      contact,
    );
    return response.data.data;
  },

  async listBookings(): Promise<BookingRecord[]> {
    const response = await apiClient.get<ApiResponse<BookingRecord[]>>('/bookings');
    return response.data.data;
  },

  async cancelBooking(reference: string): Promise<BookingRecord> {
    const response = await apiClient.patch<ApiResponse<BookingRecord>>(
      `/bookings/${reference}/cancel`,
    );
    return response.data.data;
  },

  async getSeatAvailability(params: {
    route: string;
    travelDate: string;
    busPlate?: string;
    seatType?: string;
  }): Promise<SeatAvailabilitySnapshot> {
    const response = await apiClient.get<ApiResponse<SeatAvailabilitySnapshot>>(
      '/bookings/availability',
      { params },
    );
    return response.data.data;
  },

  async lookupGuestBooking(payload: GuestBookingLookupPayload): Promise<BookingRecord> {
    const response = await apiClient.post<ApiResponse<BookingRecord>>('/bookings/lookup', payload);
    return response.data.data;
  },
};
