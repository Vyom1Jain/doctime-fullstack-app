# 🏥 Doctime — Healthcare Appointment Platform

A production-ready, full-stack healthcare appointment and teleconsultation platform built with **Spring Boot 3** (Java 21) and **React 18** + Vite + Tailwind CSS.

🌐 **Live Demo:**
- Frontend: [vyom-doctime-frontend.onrender.com](https://vyom-doctime-frontend.onrender.com)
- Backend API: [vyom-doctime-backend.onrender.com](https://vyom-doctime-backend.onrender.com)
- API Docs (Swagger): [vyom-doctime-backend.onrender.com/swagger-ui.html](https://vyom-doctime-backend.onrender.com/swagger-ui.html)

---

## ✨ Features

- 🔐 Patient & Doctor roles with JWT authentication
- 📅 Book, confirm, cancel & reschedule appointments (online / in-person)
- 💬 Real-time chat (WebSocket / STOMP)
- 🎥 Agora video consultation with session notes
- 📄 Medical report upload + language translation (EN ↔ HI)
- 💳 Billing & transaction history
- 🤝 Donations with doctor approval workflow
- 💊 Digital prescriptions with medicines
- ⭐ Doctor reviews & ratings
- 🌐 English & Hindi UI (i18n)

---

## 🗂️ Project Structure
doctime-fullstack-app/
├── backend/ # Spring Boot 3.2.3 (Java 21)
│ └── src/main/java/com/doctime/
│ ├── controller/ # REST controllers
│ ├── service/ # Business logic
│ ├── model/ # JPA entities + enums
│ ├── repository/ # Spring Data JPA
│ ├── security/ # JWT filter + UserDetailsService
│ ├── config/ # Security, WebSocket, CORS, OpenAPI
│ ├── dto/ # Request/Response DTOs
│ └── exception/ # Global error handling
└── frontend/ # React 18 + Vite 5 + Tailwind
└── src/
├── pages/ # All UI screens (patient & doctor)
├── components/ # AppShell, BottomNav, ProtectedRoute
├── context/ # AuthContext, ChatContext
├── services/ # api.js (all axios calls)
├── constants/ # Specialty data
└── i18n/ # EN + HI translations

text

---

## 🚀 Running Locally

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
> API Docs: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### Frontend
```bash
cd frontend
npm install
npm run dev
```
> Open: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Environment Variables

### Backend
| Variable | Description |
|---|---|
| `DB_URL` | JDBC connection string |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | JWT signing key (min 256-bit) |
| `AGORA_APP_ID` | Agora video app ID |
| `AGORA_APP_CERTIFICATE` | Agora certificate |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins |
| `MAIL_USERNAME` | SMTP email |
| `MAIL_PASSWORD` | SMTP app password |

### Frontend (`VITE_` prefix)
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL |
| `VITE_WS_URL` | WebSocket URL |
| `VITE_AGORA_APP_ID` | Agora app ID for video calls |

---

## 📡 API Endpoints

| Module | Endpoint |
|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login` |
| Appointments | `GET/POST /api/appointments`, `PATCH /{id}/status` |
| Doctors | `GET /api/doctors`, `/specialty/{s}`, `/search` |
| Chat | `GET /api/chat/{appointmentId}/messages` + WebSocket |
| Video | `POST /api/video/token`, `GET/POST /api/video/notes/{id}` |
| Reports | `GET /api/reports/patient/{id}`, `POST /{id}/translate` |
| Billing | `GET /api/billing/patient/{id}`, `/doctor/{id}` |
| Donations | `GET /api/donations/active`, `/pending`, `PATCH /{id}/verify` |
| Prescriptions | `POST /api/prescriptions/appointment/{id}` |
| Reviews | `POST /api/reviews`, `GET /api/reviews/doctor/{id}` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.2.3, Spring Security, Spring Data JPA |
| Frontend | React 18, Vite 5, Tailwind CSS, Axios |
| Database | MySQL 8 |
| Auth | JWT (JSON Web Tokens) |
| Real-time | WebSocket / STOMP |
| Video | Agora.io SDK |
| Deployment | Render.com |
| API Docs | Swagger / OpenAPI |
