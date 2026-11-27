export interface Flight {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  status: string;
}

export interface UserProfile {
  username: string;
  fullName: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

export interface FlightFilters {
  flightNumber?: string;
  origin?: string;
  destination?: string;
}
