import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { FlightAvailabilityComponent } from '../flights/flight-availability.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FlightAvailabilityComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly user = this.authService.currentUser;

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
