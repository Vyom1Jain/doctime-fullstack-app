# Doctime — Healthcare Appointment Platform

Full-stack healthcare appointment management app built with **Spring Boot 3** (Java 21) and **React 18 + Vite + Tailwind CSS**.

## Features

- Patient & Doctor roles with JWT authentication
- Book, confirm, cancel, reschedule appointments (online/in-person)
- Real-time chat (WebSocket / STOMP)
- Agora video consultation with notes
- Medical report upload + language translation
- Billing & transaction history
- Donations with doctor approval workflow
- Digital prescriptions with medicines
- Doctor reviews & ratings
- English & Hindi UI (i18n)

## Project Structure

```
doctime-fullstack-app/
├── render.yaml       # Render deployment blueprint
├── backend/          # Spring Boot 3.2.3 (Java 21)
│   └── src/main/java/com/doctime/
│       ├── controller/   # REST controllers
│       ├── service/      # Business logic
│       ├── model/        # JPA entities + enums
│       ├── repository/   # Spring Data JPA
│       ├── security/     # JWT filter + UserDetailsService
│       ├── config/       # Security, WebSocket, CORS, OpenAPI
│       ├── dto/          # Request/Response DTOs
│       └── exception/    # Global error handling
└── frontend/         # React 18 + Vite 5 + Tailwind
    └── src/
        ├── pages/        # All UI screens (patient & doctor)
        ├── components/   # AppShell, BottomNav, ProtectedRoute
        ├── context/      # AuthContext, ChatContext
        ├── services/     # api.js (all axios calls)
        ├── constants/    # Specialty data
        └── i18n/         # EN + HI translations
```

## Running Locally

### Prerequisites

- Java 21+, Maven
- Node 18+
- MySQL 8 (create database `doctime`)

### Backend

```bash
cd backend
export DB_URL=jdbc:mysql://localhost:3306/doctime
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
export JWT_SECRET=your-secret-key-minimum-256-bits
mvn spring-boot:run
```

API docs: http://localhost:8080/swagger-ui.html

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

### Environment Variables

**Backend** (set as env vars or in `application.yml`):
| Variable | Description |
|----------|-------------|
| `DB_URL` | JDBC connection string |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | JWT signing key |
| `AGORA_APP_ID` | Agora video app ID |
| `AGORA_APP_CERTIFICATE` | Agora certificate |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins |
| `MAIL_USERNAME` | SMTP email |
| `MAIL_PASSWORD` | SMTP app password |

**Frontend** (build-time via `VITE_` prefix):
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL (e.g. `https://your-backend.onrender.com/api`) |
| `VITE_WS_URL` | WebSocket URL (e.g. `https://your-backend.onrender.com/ws`) |
| `VITE_AGORA_APP_ID` | Agora app ID for video calls |

## Deploy to Render

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New > Blueprint** and connect your GitHub repo
4. Render will detect `render.yaml` and create:
   - **doctime-db** — Free PostgreSQL database
   - **doctime-backend** — Spring Boot web service (Docker)
   - **doctime-frontend** — Static site (React build)
5. Set the `sync: false` env vars (Agora keys, mail credentials) in the Render dashboard
6. Update `CORS_ALLOWED_ORIGINS` and `FRONTEND_URL` with your actual Render URLs

> **Note:** Locally the app uses MySQL. On Render it uses PostgreSQL (auto-configured via `render.yaml`). Both are supported.

## API Endpoints

| Module        | Endpoint                                                      |
| ------------- | ------------------------------------------------------------- |
| Auth          | `POST /api/auth/signup`, `POST /api/auth/login`               |
| Appointments  | `GET/POST /api/appointments`, `PATCH /{id}/status`            |
| Doctors       | `GET /api/doctors`, `/specialty/{s}`, `/search`               |
| Chat          | `GET /api/chat/{appointmentId}/messages` + WebSocket          |
| Video         | `POST /api/video/token`, `GET/POST /api/video/notes/{id}`     |
| Reports       | `GET /api/reports/patient/{id}`, `POST /{id}/translate`       |
| Billing       | `GET /api/billing/patient/{id}`, `/doctor/{id}`               |
| Donations     | `GET /api/donations/active`, `/pending`, `PATCH /{id}/verify` |
| Prescriptions | `POST /api/prescriptions/appointment/{id}`                    |
| Reviews       | `POST /api/reviews`, `GET /api/reviews/doctor/{id}`           |

## Docker (Local)

```bash
docker-compose up --build
```

This starts MySQL, backend (port 8080), and frontend (port 80).
