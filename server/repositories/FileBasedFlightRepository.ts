import fs from 'fs/promises';
import path from 'path';
import type { Flight } from '../types.js';
import type { FlightRepository } from './FlightRepository.js';

export class FileBasedFlightRepository implements FlightRepository {
  private readonly filePath: string;

  constructor(dataFilePath?: string) {
    this.filePath =
      dataFilePath ?? path.resolve(process.cwd(), 'server', 'data', 'flights.json');
  }

  private async readFlights(): Promise<Flight[]> {
    const raw = await fs.readFile(this.filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as Flight[];
  }

  async findAllAvailable(): Promise<Flight[]> {
    const flights = await this.readFlights();
    return flights.filter(
      (flight) =>
        typeof flight.status === 'string' &&
        flight.status.toLowerCase() === 'available'
    );
  }

  async findByFlightNumber(flightNumber: string): Promise<Flight | null> {
    const available = await this.findAllAvailable();
    const normalized = flightNumber.trim().toLowerCase();
    return (
      available.find(
        (flight) => flight.flightNumber.toLowerCase() === normalized
      ) ?? null
    );
  }
}
