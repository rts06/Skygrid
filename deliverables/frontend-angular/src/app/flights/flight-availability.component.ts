import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Flight } from '../shared/models/flight.model';
import { FlightService } from './flight.service';

@Component({
  selector: 'app-flight-availability',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './flight-availability.component.html',
  styleUrl: './flight-availability.component.scss'
})
export class FlightAvailabilityComponent implements OnInit {
  readonly displayedColumns = [
    'flightNumber',
    'origin',
    'destination',
    'departureTime',
    'arrivalTime',
    'availableSeats'
  ];

  readonly flights = signal<Flight[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');
  readonly selectedOrigin = signal('');
  readonly selectedDestination = signal('');

  readonly origins = computed(() =>
    Array.from(new Set(this.flights().map((f) => f.origin))).sort()
  );

  readonly destinations = computed(() =>
    Array.from(new Set(this.flights().map((f) => f.destination))).sort()
  );

  readonly filteredFlights = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const origin = this.selectedOrigin();
    const dest = this.selectedDestination();

    return this.flights().filter((f) => {
      const matchesFlight = !query || f.flightNumber.toLowerCase().includes(query);
      const matchesOrigin = !origin || f.origin === origin;
      const matchesDest = !dest || f.destination === dest;
      return matchesFlight && matchesOrigin && matchesDest;
    });
  });

  constructor(private flightService: FlightService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.flightService.getAvailableFlights().subscribe({
      next: (data) => {
        this.flights.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
