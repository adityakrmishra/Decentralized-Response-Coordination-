# Disaster Response API Documentation

## Base URL
`https://api.disaster-response.org/v1`

## Authentication
```http
GET /api/endpoint
Authorization: Bearer <JWT_TOKEN>
```

## Core Endpoints

### Disaster Management
```http
POST /v1/disasters
Content-Type: application/json

{
  "type": "earthquake",
  "severity": 4,
  "coordinates": [37.7749, -122.4194],
  "radius": 5000
}
```

### Resource Allocation
```http
PATCH /v1/resources/{id}/status
Content-Type: application/json

{
  "status": "in_transit",
  "location": [37.7749, -122.4194]
}
```

### Error Responses
| Code | Status               | Description                  |
|------|----------------------|------------------------------|
| 400  | Bad Request          | Invalid request parameters   |
| 401  | Unauthorized         | Missing/invalid token        |
| 403  | Forbidden            | Insufficient permissions     |
| 429  | Too Many Requests    | Rate limit exceeded          |
