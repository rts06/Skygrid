import type { Flight, FlightFilters, LoginResponse, UserProfile } from '../types/flight';

// Strictly in-memory JWT storage (never persisted to localStorage or sessionStorage)
let inMemoryToken: string | null = null;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryToken;
}

async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (inMemoryToken) {
    headers.set('Authorization', `Bearer ${inMemoryToken}`);
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data?.error === 'string'
        ? data.error
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const result = await requestJson<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setAuthToken(result.token);
  return result;
}

export async function logout(): Promise<void> {
  try {
    if (inMemoryToken) {
      await requestJson<{ message: string }>('/api/auth/logout', {
        method: 'POST',
      });
    }
  } finally {
    setAuthToken(null);
  }
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const data = await requestJson<{ user: UserProfile }>('/api/auth/me');
  return data.user;
}

export async function fetchAvailableFlights(filters?: FlightFilters): Promise<Flight[]> {
  const params = new URLSearchParams();
  if (filters?.flightNumber?.trim()) {
    params.set('flightNumber', filters.flightNumber.trim());
  }
  if (filters?.origin?.trim()) {
    params.set('origin', filters.origin.trim());
  }
  if (filters?.destination?.trim()) {
    params.set('destination', filters.destination.trim());
  }

  const query = params.toString();
  const url = query ? `/api/flights/available?${query}` : '/api/flights/available';
  return requestJson<Flight[]>(url);
}
