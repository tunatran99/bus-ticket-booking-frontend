export interface PassengerFormState {
  id: string;
  name: string;
  idNumber: string;
  phone: string;
  email: string;
  seatLabel: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
}

export interface PassengerRouteState {
  seatCount?: number;
  contact?: ContactInfo;
  travelDate?: string;
  route?: string;
  terminal?: string;
  passengers?: PassengerFormState[];
  company?: string;
  arrival?: string;
  seatType?: string;
  busPlate?: string;
  pricePerTicket?: number;
}
