import type { FlightRepository } from '../repositories/FlightRepository.js';
import type { Flight } from '../types.js';

export interface FlightSearchFilters {
  flightNumber?: string;
  origin?: string;
  destination?: string;
}

export class FlightService {
  constructor(private readonly flightRepository: FlightRepository) {}

  async getAvailableFlights(filters?: FlightSearchFilters): Promise<Flight[]> {
    const available = await this.flightRepository.findAllAvailable();

    if (!filters) {
      return available;
    }

    const flightNumberQuery = filters.flightNumber?.trim().toLowerCase() ?? '';
    const originFilter = filters.origin?.trim().toLowerCase() ?? '';
    const destinationFilter = filters.destination?.trim().toLowerCase() ?? '';

    return available.filter((flight) => {
      const matchesFlightNumber =
        !flightNumberQuery ||
        flight.flightNumber.toLowerCase().includes(flightNumberQuery);
      const matchesOrigin =
        !originFilter || flight.origin.toLowerCase() === originFilter;
      const matchesDestination =
        !destinationFilter ||
        flight.destination.toLowerCase() === destinationFilter;

      return matchesFlightNumber && matchesOrigin && matchesDestination;
    });
  }
}
