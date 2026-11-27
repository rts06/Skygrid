import { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';

interface DeliverablesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey =
  | 'architecture'
  | 'jwt'
  | 'angular'
  | 'springboot'
  | 'json'
  | 'docker'
  | 'api';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'architecture', label: 'Architecture Diagram' },
  { key: 'jwt', label: 'JWT Auth Flow' },
  { key: 'angular', label: 'Angular Source' },
  { key: 'springboot', label: 'Spring Boot Source' },
  { key: 'json', label: 'JSON Samples' },
  { key: 'docker', label: 'Docker Compose' },
  { key: 'api', label: 'API Docs' },
];

const ANGULAR_FILES: Record<string, string> = {
  'core/services/auth.service.ts': `import { Injectable, signal } from '@angular/core';
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
      .post<AuthResponse>(\`\${this.gatewayUrl}/login\`, { username, password })
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
}`,
  'core/interceptors/jwt.interceptor.ts': `import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};`,
  'flights/flight-availability.component.ts': `import { Component, OnInit, computed, signal } from '@angular/core';
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
  imports: [CommonModule, FormsModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './flight-availability.component.html',
  styleUrl: './flight-availability.component.scss'
})
export class FlightAvailabilityComponent implements OnInit {
  readonly displayedColumns = ['flightNumber', 'origin', 'destination', 'departureTime', 'arrivalTime', 'availableSeats'];
  readonly flights = signal<Flight[]>([]);
  readonly searchQuery = signal('');
  readonly selectedOrigin = signal('');
  readonly selectedDestination = signal('');

  readonly filteredFlights = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const origin = this.selectedOrigin();
    const dest = this.selectedDestination();
    return this.flights().filter((f) =>
      (!query || f.flightNumber.toLowerCase().includes(query)) &&
      (!origin || f.origin === origin) &&
      (!dest || f.destination === dest)
    );
  });

  constructor(private flightService: FlightService) {}
  ngOnInit(): void { this.refresh(); }
  refresh(): void {
    this.flightService.getAvailableFlights().subscribe((data) => this.flights.set(data));
  }
}`,
  'auth/login.component.ts': `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    const { username, password } = this.loginForm.getRawValue();
    this.authService.login(username, password).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
      error: () => { this.loading.set(false); this.errorMessage.set('Invalid username or password.'); }
    });
  }
}`,
};

const SPRING_FILES: Record<string, string> = {
  'flight-service/.../FlightRepository.java': `package com.skygrid.flight.repository;

import com.skygrid.common.dto.FlightDto;
import java.util.List;

/**
 * Business logic depends solely on this interface so DatabaseFlightRepository
 * can replace FileBasedFlightRepository without modifying services or Angular code.
 */
public interface FlightRepository {
    List<FlightDto> findAllAvailable();
}`,
  'flight-service/.../FileBasedFlightRepository.java': `package com.skygrid.flight.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skygrid.common.dto.FlightDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@Repository
@ConditionalOnProperty(name = "flight.storage.mode", havingValue = "file", matchIfMissing = true)
public class FileBasedFlightRepository implements FlightRepository {
    private final ObjectMapper objectMapper;
    private final Path flightsFilePath;

    public FileBasedFlightRepository(
            ObjectMapper objectMapper,
            @Value("\${flights.data.path:/app/data/flights.json}") String flightsFilePath) {
        this.objectMapper = objectMapper;
        this.flightsFilePath = Path.of(flightsFilePath);
    }

    @Override
    public List<FlightDto> findAllAvailable() {
        try {
            List<FlightDto> allFlights = objectMapper.readValue(flightsFilePath.toFile(), new TypeReference<>() {});
            return allFlights.stream()
                .filter(f -> "Available".equalsIgnoreCase(f.status()))
                .toList();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read flights.json", e);
        }
    }
}`,
  'flight-service/.../FlightService.java': `package com.skygrid.flight.service;

import com.skygrid.common.dto.FlightDto;
import com.skygrid.flight.repository.FlightRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FlightService {
    private final FlightRepository flightRepository;

    public FlightService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    public List<FlightDto> getAvailableFlights(String flightNumber, String origin, String destination) {
        return flightRepository.findAllAvailable().stream()
            .filter(f -> flightNumber == null || flightNumber.isBlank()
                || f.flightNumber().toLowerCase().contains(flightNumber.trim().toLowerCase()))
            .filter(f -> origin == null || origin.isBlank() || f.origin().equalsIgnoreCase(origin.trim()))
            .filter(f -> destination == null || destination.isBlank() || f.destination().equalsIgnoreCase(destination.trim()))
            .toList();
    }
}`,
  'gateway-service/.../JwtAuthenticationFilter.java': `@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {
    private final SecretKey signingKey;

    public JwtAuthenticationFilter(@Value("\${jwt.secret}") String jwtSecret) {
        super(Config.class);
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
            String token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
                ServerHttpRequest mutated = exchange.getRequest().mutate()
                    .header("X-Authenticated-User", claims.getSubject()).build();
                return chain.filter(exchange.mutate().request(mutated).build());
            } catch (Exception ex) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        };
    }
}`,
  'auth-service/.../AuthService.java': `@Service
public class AuthService {
    private final UserRepository userRepository;
    private final SecretKey signingKey;
    private final PasswordEncoder passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();

    public AuthService(UserRepository userRepository, @Value("\${jwt.secret}") String jwtSecret) {
        this.userRepository = userRepository;
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public Optional<AuthResponse> authenticate(AuthRequest request) {
        return userRepository.findByUsername(request.username())
            .filter(user -> passwordEncoder.matches(request.password(), user.password()))
            .map(this::issueToken);
    }
}`,
};

const JSON_SAMPLES = `// deliverables/data/flights.json
[
  {
    "flightNumber": "AI101",
    "origin": "Chennai",
    "destination": "Mumbai",
    "departureTime": "08:00",
    "arrivalTime": "10:15",
    "availableSeats": 56,
    "status": "Available"
  },
  {
    "flightNumber": "AI205",
    "origin": "Delhi",
    "destination": "Bangalore",
    "departureTime": "09:30",
    "arrivalTime": "12:10",
    "availableSeats": 22,
    "status": "Available"
  }
]

// deliverables/data/users.json
[
  {
    "username": "dispatcher",
    "password": "{bcrypt}$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5L3nQfW2F8wP2J5zK8U8W2Q3vX5yK",
    "fullName": "Arjun Mehta",
    "role": "ROLE_DISPATCHER"
  }
]`;

const DOCKER_COMPOSE = `version: "3.9"

services:
  auth-service:
    build:
      context: ./airline-platform
      dockerfile: auth-service/Dockerfile
    environment:
      - SERVER_PORT=8081
      - JWT_SECRET=\${JWT_SECRET}
      - USERS_DATA_PATH=/app/data/users.json
    volumes:
      - ./data/users.json:/app/data/users.json:ro

  flight-service:
    build:
      context: ./airline-platform
      dockerfile: flight-service/Dockerfile
    environment:
      - SERVER_PORT=8082
      - FLIGHTS_DATA_PATH=/app/data/flights.json
    volumes:
      - ./data/flights.json:/app/data/flights.json:ro

  gateway-service:
    build:
      context: ./airline-platform
      dockerfile: gateway-service/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - JWT_SECRET=\${JWT_SECRET}
      - AUTH_SERVICE_URL=http://auth-service:8081
      - FLIGHT_SERVICE_URL=http://flight-service:8082
    depends_on:
      - auth-service
      - flight-service

  angular-frontend:
    build:
      context: ./frontend-angular
      dockerfile: Dockerfile
    ports:
      - "4200:80"
    depends_on:
      - gateway-service`;

export function DeliverablesModal({ isOpen, onClose }: DeliverablesModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('architecture');
  const [angularFile, setAngularFile] = useState(Object.keys(ANGULAR_FILES)[0]);
  const [springFile, setSpringFile] = useState(Object.keys(SPRING_FILES)[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deliverables-title"
    >
      <div className="bg-white w-full max-w-5xl max-h-[88vh] rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 id="deliverables-title" className="font-display text-lg font-bold text-slate-900">
              System Architecture & Microservices Deliverables
            </h2>
            <p className="text-xs text-slate-500">
              Complete Angular + Spring Boot microservices code saved under /deliverables/
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close deliverables modal"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 border-b border-slate-200 overflow-x-auto bg-white">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-sky-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-800 space-y-5">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Microservices architecture decoupling the Angular portal from Spring Boot services via a JWT-enforcing API Gateway and interface-driven Repository pattern.
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 overflow-x-auto">
                <svg viewBox="0 0 860 320" className="w-full min-w-[680px] h-auto" aria-label="Microservices Architecture Diagram">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
                    </marker>
                  </defs>
                  {/* Angular */}
                  <rect x="20" y="110" width="170" height="90" rx="10" fill="#0f2c56" />
                  <text x="105" y="148" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">Angular Frontend</text>
                  <text x="105" y="168" textAnchor="middle" fill="#93c5fd" fontSize="11">Material Table · :4200</text>

                  {/* Gateway */}
                  <rect x="245" y="110" width="180" height="90" rx="10" fill="#0369a1" />
                  <text x="335" y="148" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">API Gateway</text>
                  <text x="335" y="168" textAnchor="middle" fill="#e0f2fe" fontSize="11">JwtAuthFilter · :8080</text>

                  {/* Auth Service */}
                  <rect x="490" y="35" width="175" height="80" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
                  <text x="577" y="70" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="600">Auth Service</text>
                  <text x="577" y="89" textAnchor="middle" fill="#475569" fontSize="11">Spring Boot · :8081</text>

                  {/* Flight Service */}
                  <rect x="490" y="195" width="175" height="80" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
                  <text x="577" y="230" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="600">Flight Service</text>
                  <text x="577" y="249" textAnchor="middle" fill="#475569" fontSize="11">FlightRepository · :8082</text>

                  {/* users.json */}
                  <rect x="710" y="35" width="130" height="80" rx="10" fill="#f1f5f9" stroke="#94a3b8" />
                  <text x="775" y="70" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="600">users.json</text>
                  <text x="775" y="88" textAnchor="middle" fill="#64748b" fontSize="10">FileBasedUserRepo</text>

                  {/* flights.json */}
                  <rect x="710" y="155" width="130" height="70" rx="10" fill="#f1f5f9" stroke="#94a3b8" />
                  <text x="775" y="185" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="600">flights.json</text>
                  <text x="775" y="203" textAnchor="middle" fill="#64748b" fontSize="10">FileBasedFlightRepo</text>

                  {/* Future DB */}
                  <rect x="710" y="240" width="130" height="60" rx="10" fill="#ffffff" stroke="#94a3b8" strokeDasharray="4 4" />
                  <text x="775" y="266" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">Future SQL DB</text>
                  <text x="775" y="283" textAnchor="middle" fill="#64748b" fontSize="10">DatabaseFlightRepo</text>

                  {/* Arrows */}
                  <line x1="190" y1="155" x2="243" y2="155" stroke="#334155" strokeWidth="1.5" markerEnd="url(#arrow)" />
                  <line x1="425" y1="135" x2="488" y2="75" stroke="#334155" strokeWidth="1.5" markerEnd="url(#arrow)" />
                  <line x1="425" y1="175" x2="488" y2="235" stroke="#334155" strokeWidth="1.5" markerEnd="url(#arrow)" />
                  <line x1="665" y1="75" x2="708" y2="75" stroke="#334155" strokeWidth="1.5" markerEnd="url(#arrow)" />
                  <line x1="665" y1="220" x2="708" y2="190" stroke="#334155" strokeWidth="1.5" markerEnd="url(#arrow)" />
                  <line x1="665" y1="250" x2="708" y2="270" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow)" />
                </svg>
              </div>
            </div>
          )}

          {activeTab === 'jwt' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Stateless HS256 JWT authentication flow enforced at the API Gateway before forwarding requests to the Flight Service.
              </p>
              <ol className="space-y-2.5 list-decimal pl-5 text-slate-700">
                <li><strong>POST /api/auth/login</strong>: Angular submits username and password to the API Gateway, which routes to Auth Service.</li>
                <li><strong>Credential Verification</strong>: Auth Service reads <code>users.json</code> via <code>FileBasedUserRepository</code> and verifies the BCrypt/Scrypt password hash.</li>
                <li><strong>Token Issuance</strong>: Auth Service signs a 1-hour HS256 JWT containing <code>sub</code>, <code>fullName</code>, and <code>role</code>.</li>
                <li><strong>In-Memory Storage</strong>: Angular holds the JWT strictly in memory (<code>AuthService</code>) and attaches <code>Authorization: Bearer &lt;token&gt;</code> via <code>jwtInterceptor</code>.</li>
                <li><strong>Gateway Verification</strong>: <code>JwtAuthenticationFilter</code> validates signature and expiration before routing <code>GET /api/flights/available</code> to Flight Service.</li>
                <li><strong>Logout</strong>: Clears the in-memory JWT token and redirects to <code>/login</code>.</li>
              </ol>
            </div>
          )}

          {activeTab === 'angular' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {Object.keys(ANGULAR_FILES).map((file) => (
                  <button
                    key={file}
                    type="button"
                    onClick={() => setAngularFile(file)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono cursor-pointer ${
                      angularFile === file
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>
              <CodeBlock
                code={ANGULAR_FILES[angularFile]}
                copied={copied}
                onCopy={() => copyText(ANGULAR_FILES[angularFile])}
              />
            </div>
          )}

          {activeTab === 'springboot' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {Object.keys(SPRING_FILES).map((file) => (
                  <button
                    key={file}
                    type="button"
                    onClick={() => setSpringFile(file)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono cursor-pointer ${
                      springFile === file
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>
              <CodeBlock
                code={SPRING_FILES[springFile]}
                copied={copied}
                onCopy={() => copyText(SPRING_FILES[springFile])}
              />
            </div>
          )}

          {activeTab === 'json' && (
            <CodeBlock
              code={JSON_SAMPLES}
              copied={copied}
              onCopy={() => copyText(JSON_SAMPLES)}
            />
          )}

          {activeTab === 'docker' && (
            <CodeBlock
              code={DOCKER_COMPOSE}
              copied={copied}
              onCopy={() => copyText(DOCKER_COMPOSE)}
            />
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold text-slate-700">Method</th>
                      <th className="py-2.5 px-4 font-semibold text-slate-700">Endpoint</th>
                      <th className="py-2.5 px-4 font-semibold text-slate-700">Auth</th>
                      <th className="py-2.5 px-4 font-semibold text-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-sky-700">POST</td>
                      <td className="py-2.5 px-4">/api/auth/login</td>
                      <td className="py-2.5 px-4 font-sans text-slate-600">Public</td>
                      <td className="py-2.5 px-4 font-sans text-slate-600">Authenticates against users.json and issues JWT</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-sky-700">POST</td>
                      <td className="py-2.5 px-4">/api/auth/logout</td>
                      <td className="py-2.5 px-4 font-sans text-slate-600">Bearer JWT</td>
                      <td className="py-2.5 px-4 font-sans text-slate-600">Terminates active session</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-emerald-700">GET</td>
                      <td className="py-2.5 px-4">/api/flights/available</td>
                      <td className="py-2.5 px-4 font-sans text-slate-600">Bearer JWT</td>
                      <td className="py-2.5 px-4 font-sans text-slate-600">Returns flights with status='Available'; supports ?flightNumber, ?origin, ?destination</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({
  code,
  copied,
  onCopy,
}: {
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="relative rounded-xl bg-slate-950 text-slate-100 p-4 overflow-x-auto">
      <button
        type="button"
        onClick={onCopy}
        className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs text-slate-200 cursor-pointer"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <pre className="text-xs leading-relaxed pr-20">
        <code>{code}</code>
      </pre>
    </div>
  );
}
