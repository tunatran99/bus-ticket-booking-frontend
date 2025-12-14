import apiClient from './api';

export interface SearchTripsParams {
  origin?: string;
  destination?: string;
  date?: string;
  timeFrom?: string;
  timeTo?: string;
  minPrice?: number;
  maxPrice?: number;
  busType?: string;
  amenities?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'time_asc' | 'time_desc' | 'duration_asc' | 'duration_desc';
  page?: number;
  limit?: number;
}

export interface Trip {
  id: number;
  routeId: number;
  busId: number;
  departureTime: string;
  arrivalTime?: string;
  status: string;
  basePrice: number;
  availableSeats: number;
  route?: {
    id: number;
    name: string;
    description?: string;
    distance: number;
    estimatedDuration: number;
    stops?: Array<{
      id: number;
      locationName: string;
      address?: string;
      order: number;
      minutesFromStart: number;
    }>;
  };
  bus?: {
    id: number;
    licensePlate: string;
    brand?: string;
    model?: string;
    totalSeats: number;
    amenities?: string[];
    seatLayouts?: Array<{
      id: number;
      seatNumber: string;
      seatType: string;
      basePrice: number;
    }>;
  };
}

export interface SearchTripsResponse {
  success: boolean;
  data: {
    trips: Trip[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const tripsService = {
  async searchTrips(params: SearchTripsParams): Promise<SearchTripsResponse> {
    const response = await apiClient.get<SearchTripsResponse>('/trips/search', { params });
    return response.data;
  },

  async getTripById(id: number): Promise<{ success: boolean; data: Trip }> {
    const response = await apiClient.get<{ success: boolean; data: Trip }>(`/trips/${id}`);
    return response.data;
  },
};
