# Barber Shop API Documentation

This document provides comprehensive documentation for all API endpoints in the Barber Shop appointment booking system.

## Table of Contents

1. [Authentication](#authentication)
2. [Customer Endpoints](#customer-endpoints)
3. [Barber Endpoints](#barber-endpoints)
4. [Appointment Endpoints](#appointment-endpoints)
5. [Service Endpoints](#service-endpoints)
6. [Slot Management Endpoints](#slot-management-endpoints)

## Authentication

The API uses JWT (JSON Web Token) for authentication. Most endpoints require a valid token to be included in the request header.

### Headers

```
Authorization: Bearer <token>
```

### Customer Login

**Endpoint:** `POST /api/login`

**Description:** Authenticates a customer and returns a JWT token.

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "customer@example.com",
    "gender": "male",
    "phone": "1234567890",
    "customerType": "regular",
    "preferences": {}
  }
}
```

### Barber Login

**Endpoint:** `POST /api/barber/login`

**Description:** Authenticates a barber and returns a JWT token with barber role.

**Request Body:**
```json
{
  "email": "barber@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Jane Smith",
    "email": "barber@example.com",
    "phone": "1234567890",
    "role": "barber"
  }
}
```

## Customer Endpoints

### Register Customer

**Endpoint:** `POST /api/register`

**Description:** Registers a new customer.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "customer@example.com",
  "password": "password123",
  "phone_number": "1234567890",
  "gender": "male",
  "address": "123 Main St",
  "dateOfBirth": "1990-01-01",
  "customerType": "regular",
  "enrollment_number": "",
  "course": "",
  "year": "",
  "preferences": {}
}
```

**Notes:**
- `enrollment_number`, `course`, and `year` are required only if `customerType` is "student"
- `customerType` can be "regular" or "student"
- `gender` can be "male", "female", or "other"

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "customer@example.com",
    "gender": "male",
    "phone": "1234567890",
    "customerType": "regular"
  }
}
```

### Get Customer Profile

**Endpoint:** `GET /api/customer/profile`

**Description:** Retrieves the profile of the authenticated customer.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "customer@example.com",
    "phone_number": "1234567890",
    "gender": "male",
    "address": "123 Main St",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "customerType": "regular",
    "preferences": {},
    "createdAt": "2023-01-01T00:00:00.000Z",
    "lastLogin": "2023-01-02T00:00:00.000Z"
  }
}
```

### Update Customer Profile

**Endpoint:** `PUT /api/customer/profile`

**Description:** Updates the profile of the authenticated customer.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Smith",
  "phone_number": "9876543210",
  "gender": "male",
  "address": "456 Oak St",
  "dateOfBirth": "1990-01-01",
  "preferences": {
    "preferredBarber": "Jane"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Smith",
    "email": "customer@example.com",
    "phone_number": "9876543210",
    "gender": "male",
    "address": "456 Oak St",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "customerType": "regular",
    "preferences": {
      "preferredBarber": "Jane"
    }
  }
}
```

## Barber Endpoints

### Get All Appointments (Barber Dashboard)

**Endpoint:** `GET /api/appointments/all`

**Description:** Retrieves all appointments for the barber dashboard.

**Authentication:** Barber role required

**Response:**
```json
{
  "success": true,
  "appointments": [...],
  "categorized": {
    "all": [...],
    "today": [...],
    "upcoming": [...],
    "cancelled": [...]
  },
  "stats": {
    "total": 10,
    "cancelled": 2,
    "currentDay": "Monday"
  }
}
```

### Get Barber Appointments

**Endpoint:** `GET /api/barber/appointments`

**Description:** Retrieves appointments with service details.

**Authentication:** Barber role required

**Response:**
```json
{
  "success": true,
  "total": 10,
  "today": 3,
  "upcoming": 7,
  "appointments": {
    "all": [...],
    "today": [...],
    "upcoming": [...]
  }
}
```

### Get Barber Statistics

**Endpoint:** `GET /api/barber/stats`

**Description:** Retrieves appointment statistics for the barber dashboard.

**Authentication:** Barber role required

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalAppointments": 50,
    "weeklyAppointments": 15,
    "todayAppointments": 3,
    "appointmentsByDay": {
      "Monday": 3,
      "Tuesday": 4,
      "Wednesday": 2,
      "Thursday": 3,
      "Friday": 3
    }
  }
}
```

## Appointment Endpoints

### Book Appointment

**Endpoint:** `POST /api/book-appointment`

**Description:** Books a new appointment based on availability.

**Authentication:** Required

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phoneNumber": "1234567890",
  "gender": "male",
  "preferredDay": "Monday",
  "preferredTime": "morning",
  "services": ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
}
```

**Notes:**
- `preferredDay` can be a specific day ("Monday", "Tuesday", etc.) or "Anyday"
- `preferredTime` can be a specific time slot ("morning", "afternoon", "evening") or "anytime"
- `services` is an array of service IDs

**Response:**
```json
{
  "success": true,
  "message": "A slot is available from 9:00 AM to 10:00 AM on Monday. Please accept to confirm.",
  "appointment": {
    "day": "Monday",
    "timeSlot": "morning",
    "startTime": "2023-01-01T09:00:00.000Z",
    "endTime": "2023-01-01T10:00:00.000Z",
    "duration": "60 minutes",
    "customerName": "John Doe",
    "customerPhone": "1234567890",
    "gender": "male",
    "services": ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
  },
  "links": {
    "accept": "/api/appointments/accept?day=Monday&timeSlot=morning&start=2023-01-01T09:00:00.000Z&end=2023-01-01T10:00:00.000Z&name=John%20Doe&phone=1234567890&gender=male&services=60d21b4667d0d8992e610c85,60d21b4667d0d8992e610c86",
    "decline": "/api/appointments/decline?name=John%20Doe&day=Monday&timeSlot=morning"
  }
}
```

### Accept Appointment

**Endpoint:** `GET /api/appointments/accept`

**Description:** Confirms and creates an appointment from a booking request.

**Authentication:** Required

**Query Parameters:**
- `day`: Day of the appointment
- `timeSlot`: Time slot of the appointment
- `start`: Start time (ISO date string)
- `end`: End time (ISO date string)
- `name`: Customer name
- `phone`: Customer phone number
- `gender`: Customer gender
- `services`: Comma-separated list of service IDs

**Response:**
```json
{
  "success": true,
  "message": "🎉 Appointment confirmed for John Doe on Monday morning! Your booking ID is 123456.",
  "appointment": {
    "id": "60d21b4667d0d8992e610c85",
    "_id": "60d21b4667d0d8992e610c85",
    "customerName": "John Doe",
    "customerPhone": "1234567890",
    "gender": "male",
    "day": "Monday",
    "timeSlot": "morning",
    "startTime": "2023-01-01T09:00:00.000Z",
    "endTime": "2023-01-01T10:00:00.000Z",
    "status": "booked",
    "services": ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"],
    "duration": "60 minutes"
  }
}
```

### Decline Appointment

**Endpoint:** `GET /api/appointments/decline`

**Description:** Declines a booking request.

**Authentication:** Required

**Query Parameters:**
- `name`: Customer name
- `day`: Day of the appointment
- `timeSlot`: Time slot of the appointment

**Response:**
```json
{
  "success": true,
  "message": "❌ Appointment declined for John Doe on Monday morning. The time slot has been released and is now available for other bookings.",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Cancel Appointment

**Endpoint:** `DELETE /api/appointments/:id/cancel`

**Description:** Cancels an existing appointment.

**Authentication:** Required (customer can only cancel their own appointments, barbers can cancel any)

**URL Parameters:**
- `id`: Appointment ID

**Response:**
```json
{
  "success": true,
  "message": "✅ Appointment cancelled successfully for John Doe on Monday morning. The time slot is now available for booking.",
  "cancelledAppointment": {
    "id": "60d21b4667d0d8992e610c85",
    "customerName": "John Doe",
    "customerPhone": "1234567890",
    "day": "Monday",
    "timeSlot": "morning",
    "gender": "male",
    "status": "cancelled",
    "cancelledAt": "2023-01-01T00:00:00.000Z",
    "cancelledBy": "customer"
  }
}
```

## Service Endpoints

### Get All Services (Barber Only)

**Endpoint:** `GET /api/services`

**Description:** Retrieves all services.

**Authentication:** Barber role required

**Response:**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Haircut",
    "cost": "25",
    "time": "30 minutes",
    "gender": "male"
  },
  {
    "_id": "60d21b4667d0d8992e610c86",
    "name": "Beard Trim",
    "cost": "15",
    "time": "20 minutes",
    "gender": "male"
  }
]
```

### Get Services by Gender

**Endpoint:** `GET /api/services/:gender`

**Description:** Retrieves services for a specific gender.

**URL Parameters:**
- `gender`: Gender ("male" or "female")

**Response:**
```json
{
  "success": true,
  "gender": "male",
  "count": 2,
  "services": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "Haircut",
      "cost": "25",
      "time": "30 minutes",
      "gender": "male"
    },
    {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "Beard Trim",
      "cost": "15",
      "time": "20 minutes",
      "gender": "male"
    }
  ]
}
```

### Create Service (Barber Only)

**Endpoint:** `POST /api/services`

**Description:** Creates a new service.

**Authentication:** Barber role required

**Request Body:**
```json
{
  "name": "Haircut",
  "cost": "25",
  "time": "30 minutes",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service created successfully",
  "service": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Haircut",
    "cost": "25",
    "time": "30 minutes",
    "gender": "male"
  }
}
```

### Update Service (Barber Only)

**Endpoint:** `PUT /api/services/:id`

**Description:** Updates an existing service.

**Authentication:** Barber role required

**URL Parameters:**
- `id`: Service ID

**Request Body:**
```json
{
  "name": "Haircut",
  "cost": "30",
  "time": "35 minutes",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service updated successfully",
  "service": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Haircut",
    "cost": "30",
    "time": "35 minutes",
    "gender": "male"
  }
}
```

### Delete Service (Barber Only)

**Endpoint:** `DELETE /api/services/:id`

**Description:** Deletes a service.

**Authentication:** Barber role required

**URL Parameters:**
- `id`: Service ID

**Response:**
```json
{
  "success": true,
  "message": "Service deleted successfully",
  "deletedService": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Haircut",
    "gender": "male"
  }
}
```

## Slot Management Endpoints

### Get Slots (Male)

**Endpoint:** `GET /api/slots`

**Description:** Retrieves available slots for male customers.

**Authentication:** Required

**Response:**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "day": "Monday",
    "morning": "2023-01-01T09:00:00.000Z",
    "afternoon": "2023-01-01T12:00:00.000Z",
    "evening": "2023-01-01T14:30:00.000Z"
  },
  {
    "_id": "60d21b4667d0d8992e610c86",
    "day": "Tuesday",
    "morning": "2023-01-02T09:00:00.000Z",
    "afternoon": "2023-01-02T12:00:00.000Z",
    "evening": "2023-01-02T14:30:00.000Z"
  }
]
```

### Get Slots (Female)

**Endpoint:** `GET /api/slots1`

**Description:** Retrieves available slots for female customers.

**Authentication:** Required

**Response:**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "day": "Monday",
    "morning": "2023-01-01T09:00:00.000Z",
    "afternoon": "2023-01-01T12:00:00.000Z",
    "evening": "2023-01-01T14:30:00.000Z"
  },
  {
    "_id": "60d21b4667d0d8992e610c86",
    "day": "Tuesday",
    "morning": "2023-01-02T09:00:00.000Z",
    "afternoon": "2023-01-02T12:00:00.000Z",
    "evening": "2023-01-02T14:30:00.000Z"
  }
]
```

### Check and Reset Slots

**Endpoint:** `GET /api/check-reset-slots`

**Description:** Checks if it's Sunday and resets slots for the new week if needed.

**Authentication:** Required

**Response (if Sunday):**
```json
{
  "success": true,
  "message": "Slots reset successfully for the new week (male & female)",
  "stats": {
    "deleted": {
      "male": 5,
      "female": 5
    },
    "created": {
      "male": 5,
      "female": 5
    }
  }
}
```

**Response (if not Sunday):**
```json
{
  "success": true,
  "message": "Today is not Sunday, no reset needed",
  "currentDay": "Monday",
  "nextResetDay": "Sunday"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information (optional)"
}
```

Common HTTP status codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (e.g., email already in use)
- 500: Internal Server Error