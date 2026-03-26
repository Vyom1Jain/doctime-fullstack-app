🏥 Doctime — Healthcare Appointment & Teleconsultation Platform

A production-ready full-stack healthcare platform built using Spring Boot 3 (Java 21) and React 18 + Vite + Tailwind CSS.
Doctime enables patients and doctors to manage appointments, communicate in real-time, and conduct secure video consultations.

🌐 Live Demo
Frontend: https://vyom-doctime-frontend.onrender.com
Backend API: https://vyom-doctime-backend.onrender.com
Swagger API Docs: https://vyom-doctime-backend.onrender.com/swagger-ui.html
✨ Features
JWT-based authentication with role-based access (Patient / Doctor)
Book, confirm, cancel, and reschedule appointments
Real-time chat using WebSocket (STOMP)
Video consultation using Agora SDK
Medical report upload 
Digital prescriptions with medicines
Billing and transaction history
Donation system with doctor approval workflow
Doctor reviews and ratings
🏗️ Project Structure
doctime-fullstack-app/
├── backend/
│   ├── controller/
│   ├── service/
│   ├── model/
│   ├── repository/
│   ├── security/
│   ├── config/
│   ├── dto/
│   └── exception/
│
└── frontend/
    ├── pages/
    ├── components/
    ├── context/
    ├── services/
    ├── constants/
    └── i18n/
🚀 Running Locally
Prerequisites
Java 21+
Node.js 18+
MySQL 8 (database: doctime)
Backend
cd backend
export DB_URL=jdbc:mysql://localhost:3306/doctime
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
export JWT_SECRET=your-secret-key
mvn spring-boot:run

Swagger: http://localhost:8080/swagger-ui.html

Frontend
cd frontend
npm install
npm run dev

App: http://localhost:5173

🔑 Environment Variables
Backend
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
AGORA_APP_ID
AGORA_APP_CERTIFICATE
MAIL_USERNAME
MAIL_PASSWORD
Frontend
VITE_API_BASE_URL
VITE_WS_URL
VITE_AGORA_APP_ID
🛠️ Tech Stack

Backend: Java, Spring Boot, Spring Security, Spring Data JPA
Frontend: React, Vite, Tailwind CSS
Database: MySQL
Auth: JWT
Real-time: WebSocket
Video: Agora
Docs: Swagger
Deployment: Render

📌 Highlights
Layered architecture (Controller → Service → Repository)
Secure authentication using JWT
Real-time communication with WebSocket
Third-party integrations (Agora, Email, Translation)
Clean and maintainable code structure
👨‍💻 Author

Vyom Jain
GitHub: https://github.com/Vyom1Jain
