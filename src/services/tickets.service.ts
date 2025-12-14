import apiClient from './api';

export interface TicketEmailPassenger {
  name: string;
  id?: string;
}

export interface TicketEmailSeat {
  label: string;
  type?: string;
  coach?: string;
}

export interface TicketEmailRoute {
  origin: string;
  destination: string;
}

export interface TicketEmailBus {
  name: string;
  plate?: string;
}

export interface TicketEmailSegment {
  city: string;
  terminal?: string;
  time: string;
  gate?: string;
  boardingTime?: string;
}

export interface TicketEmailPayload {
  recipient: string;
  ticket: {
    bookingReference: string;
    issuedBy: string;
    passenger: TicketEmailPassenger;
    seat: TicketEmailSeat;
    route: TicketEmailRoute;
    bus: TicketEmailBus;
    departure: TicketEmailSegment;
    arrival: TicketEmailSegment;
    supportContact?: string;
  };
}

export interface TicketEmailResponse {
  success: boolean;
  simulated?: boolean;
}

export const ticketsService = {
  async sendTicketEmail(payload: TicketEmailPayload): Promise<TicketEmailResponse> {
    const response = await apiClient.post<TicketEmailResponse>('/tickets/email', payload);
    return response.data;
  },
};
