import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight } from '../shared/models/flight.model';

@Injectable({ providedIn: 'root' })
export class FlightService {
  private readonly gatewayUrl = 'http://localhost:8080/api/flights';

  constructor(private http: HttpClient) {}

  getAvailableFlights(filters?: {
    flightNumber?: string;
    origin?: string;
    destination?: string;
  }): Observable<Flight[]> {
    let params = new HttpParams();
    if (filters?.flightNumber) params = params.set('flightNumber', filters.flightNumber);
    if (filters?.origin) params = params.set('origin', filters.origin);
    if (filters?.destination) params = params.set('destination', filters.destination);

    return this.http.get<Flight[]>(`${this.gatewayUrl}/available`, { params });
  }
}
