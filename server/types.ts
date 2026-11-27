export interface Flight {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  status: 'Available' | 'Full' | 'Cancelled' | string;
}

export interface UserRecord {
  username: string;
  passwordHash: string;
  fullName: string;
  role: string;
}

export interface AuthenticatedUser {
  username: string;
  fullName: string;
  role: string;
}

export interface JwtPayload {
  sub: string;
  fullName: string;
  role: string;
  iat: number;
  exp: number;
}
