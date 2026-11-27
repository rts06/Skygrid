# API Documentation — SkyGrid Airline Flight Availability Portal

Base URL (via API Gateway): `http://localhost:8080`

---

## 1. Authentication Service (`/api/auth`)

### `POST /api/auth/login`
Authenticates an airline user against `users.json` and issues a signed JWT.

- **Auth Required**: No
- **Request Body**:
```json
{
  "username": "dispatcher",
  "password": "********"
}
```
- **Response `200 OK`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "username": "dispatcher",
    "fullName": "Arjun Mehta",
    "role": "ROLE_DISPATCHER"
  }
}
```
- **Response `401 Unauthorized`**:
```json
{
  "status": 401,
  "error": "Invalid username or password"
}
```

---

### `POST /api/auth/logout`
Invalidates the client session (stateless JWT acknowledgement; client clears in-memory token).

- **Auth Required**: `Authorization: Bearer <JWT>`
- **Response `200 OK`**:
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. Flight Service (`/api/flights`)

### `GET /api/flights/available`
Returns flights from `FileBasedFlightRepository` (`flights.json`) where `status === "Available"`.

- **Auth Required**: `Authorization: Bearer <JWT>`
- **Optional Query Parameters**:
  - `flightNumber` (partial, case-insensitive match, e.g., `AI101`)
  - `origin` (exact city match, e.g., `Chennai`)
  - `destination` (exact city match, e.g., `Mumbai`)
- **Response `200 OK`**:
```json
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
```
- **Response `401 Unauthorized`**: Returned by `gateway-service` if the Bearer JWT is missing, malformed, or expired.
