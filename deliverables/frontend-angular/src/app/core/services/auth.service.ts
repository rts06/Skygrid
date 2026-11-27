import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, UserProfile } from '../../shared/models/flight.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly gatewayUrl = 'http://localhost:8080/api/auth';
  private tokenInMemory: string | null = null;
  readonly currentUser = signal<UserProfile | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.gatewayUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          this.tokenInMemory = response.token;
          this.currentUser.set(response.user);
        })
      );
  }

  logout(): void {
    this.tokenInMemory = null;
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenInMemory;
  }

  isAuthenticated(): boolean {
    return this.tokenInMemory !== null;
  }
}
