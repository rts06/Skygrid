import type { Flight } from '../types.js';

/**
 * Repository Pattern Interface
 * Business logic depends strictly on this interface.
 * Current implementation: FileBasedFlightRepository
 * Future implementation: DatabaseFlightRepository
 */
export interface FlightRepository {
  findAllAvailable(): Promise<Flight[]>;
  findByFlightNumber(flightNumber: string): Promise<Flight | null>;
}
