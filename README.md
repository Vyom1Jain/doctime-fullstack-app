# Doctime — Healthcare Appointment Platform

Full-stack healthcare appointment management app built with **Spring Boot** (backend) and **React + Vite + Tailwind CSS** (frontend).

## Features

- Patient & Doctor roles with JWT authentication
- Book, confirm, cancel appointments (online/in-person)
- Real-time chat (WebSocket / STOMP)
- Agora video consultation with notes
- Medical report upload + language translation
- Billing & transaction history
- Donations / patient support
- Digital prescriptions with medicines
- English & Hindi UI (i18n)

## Project Structure

```
doctime-fullstack-app/
├── backend/          # Spring Boot 3 (Java 17)
│   └── src/main/java/com/doctime/
│       ├── controller/   # REST controllers
│       ├── service/      # Business logic
│       ├── model/        # JPA entities + enums
│       ├── repository/   # Spring Data JPA
│       ├── security/     # JWT filter + UserDetailsService
│       ├── config/       # Security, WebSocket, OpenAPI
│       ├── dto/          # Request/Response DTOs
│       └── exception/    # Global error handling
└── frontend/         # React 18 + Vite + Tailwind
    └── src/
        ├── pages/        # All UI screens
        ├── components/   # Reusable components
        ├── context/      # AuthContext, ChatContext
        ├── services/     # api.js (all axios calls)
        └── i18n/         # EN + HI translations
```

## Running locally

### Prerequisites
- Java 17+, Maven
- Node 18+
- MySQL 8 (create database `doctime`)

### Backend
```bash
cd backend
# Set env vars or edit application.yml
export DB_URL=jdbc:mysql://localhost:3306/doctime
export DB_USER=root
export DB_PASS=yourpassword
export JWT_SECRET=doctime_super_secret_key_minimum_256_bits_long
mvn spring-boot:run
```
API docs: http://localhost:8080/swagger-ui.html

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open: http://localhost:5173

### Environment variables (frontend `.env`)
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
VITE_AGORA_APP_ID=your-agora-app-id
```

## API Endpoints

| Module | Endpoint |
|--------|----------|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login` |
| Appointments | `GET/POST /api/appointments`, `PATCH /{id}/status` |
| Doctors | `GET /api/doctors`, `/specialty/{s}`, `/search` |
| Chat | `GET /api/chat/{appointmentId}/messages` + WS |
| Video | `POST /api/video/token`, `GET/POST /api/video/notes/{id}` |
| Reports | `GET /api/reports/patient/{id}`, `POST /{id}/translate` |
| Billing | `GET /api/billing/patient/{id}`, `/doctor/{id}` |
| Donations | `GET /api/donations/active` |
| Prescriptions | `POST /api/prescriptions/appointment/{id}` |
