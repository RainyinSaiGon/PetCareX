# Authentication API Testing Guide

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Register New User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User",
  "phoneNumber": "0123456789"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User",
    "phoneNumber": "0123456789",
    "createdAt": "2025-12-05T06:48:13.000Z",
    "updatedAt": "2025-12-05T06:48:13.000Z"
  }
}
```

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User"
  }
}
```

### 3. Get Profile (Protected Route)
**GET** `/profile`

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**Response:**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "fullName": "Test User"
}
```

## Testing with PowerShell

### Register:
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
    fullName = "Test User"
    phoneNumber = "0123456789"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Login:
```powershell
$body = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.access_token
```

### Get Profile:
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/profile" -Method GET -Headers $headers
```
