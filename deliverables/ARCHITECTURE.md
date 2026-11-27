# SkyGrid Airline Flight Availability Portal — System Architecture

## 1. Microservices Architecture Diagram

```mermaid
flowchart LR
    User([Airline Staff Browser]) -->|"HTTPS / Port 4200"| Angular["Angular Frontend\n(Material UI + AuthGuard + JwtInterceptor)"]
    Angular -->|"REST + Bearer JWT\nPort 8080"| Gateway["API Gateway Service\n(Spring Cloud Gateway + JwtAuthFilter)"]

    Gateway -->|"/api/auth/**"| Auth["Authentication Service\n(Port 8081)"]
    Gateway -->|"/api/flights/**"| Flight["Flight Service\n(Port 8082)"]

    Auth -->|"UserRepository"| UserRepo["FileBasedUserRepository\n(users.json)"]
    Flight -->|"FlightRepository (Interface)"| FileRepo["FileBasedFlightRepository\n(flights.json)"]
    Flight -.->|"Future Swap (Zero Service Changes)"| DbRepo["DatabaseFlightRepository\n(JPA / PostgreSQL)"]
```

## 2. JWT Authentication Flow

```mermaid
sequenceDiagram
    actor User as Operations User
    participant UI as Angular LoginComponent
    participant GW as API Gateway (:8080)
    participant Auth as Auth Service (:8081)
    participant Flight as Flight Service (:8082)

    User->>UI: Enter username & password
    UI->>GW: POST /api/auth/login
    GW->>Auth: Forward credentials
    Auth->>Auth: Validate against users.json (BCrypt)
    Auth-->>GW: 200 OK { token, user }
    GW-->>UI: Return signed HS256 JWT
    UI->>UI: Store JWT in AuthService memory
    UI->>GW: GET /api/flights/available (Authorization: Bearer <JWT>)
    GW->>GW: JwtAuthenticationFilter verifies signature & expiry
    GW->>Flight: Forward request + X-Authenticated-User header
    Flight->>Flight: FlightRepository.findAllAvailable() -> status == 'Available'
    Flight-->>GW: 200 OK [Available Flights]
    GW-->>UI: Render MatTable
```

## 3. Repository Pattern & Future Database Migration

1. `FlightService` injects the `FlightRepository` interface (`List<FlightDto> findAllAvailable()`).
2. Currently, `FileBasedFlightRepository` is annotated with `@Repository` (or `@ConditionalOnProperty(name = "flight.storage.mode", havingValue = "file", matchIfMissing = true)`) and reads `flights.json` via Jackson `ObjectMapper`.
3. To migrate to PostgreSQL / MySQL later:
   - Implement `DatabaseFlightRepository implements FlightRepository` backed by Spring Data JPA.
   - Activate `DatabaseFlightRepository` via configuration (`flight.storage.mode=database`).
   - Zero changes required in `FlightService`, `FlightController`, `gateway-service`, or Angular frontend.
