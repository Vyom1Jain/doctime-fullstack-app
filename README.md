# Doctime - Full Stack Doctor Appointment System

🏥 **Complete telemedicine platform with video consultations, real-time chat, and multi-language support**

## 🚀 Features

### Patient Features
- 🔐 Secure authentication with JWT
- 🔍 Search and filter doctors by specialty, availability, price
- 📅 Book appointments with doctors
- 💬 Real-time chat with doctors (WebSocket)
- 📹 Video consultations with Agora.io
- 📝 Take notes during video calls
- 📄 Upload and manage medical reports
- 🌐 Translate reports to preferred language (Google Cloud Translation)
- 💳 View billing and payment history
- 🏥 Book lab tests and hospital visits
- 🧮 Health calculators (BMI, Heart Rate, Blood Sugar)
- 💝 Support patients through donations

### Doctor Features
- 📊 Comprehensive dashboard with analytics
- 👥 Manage patient roster
- 📋 Create and send digital prescriptions
- 💰 Track earnings and consultations
- ✅ Verify and approve donation requests
- 📅 Manage appointment schedule
- 💬 Chat with patients
- 📹 Conduct video consultations

### Technical Features
- 🔒 Role-based access control (RBAC)
- 🌍 Multi-language support (English, Hindi)
- 📱 Responsive mobile-first UI
- 🔄 Real-time updates with WebSocket
- ☁️ Cloud-ready deployment
- 🐳 Docker containerization

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.x
- **Security**: Spring Security + JWT
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA / Hibernate
- **Real-time**: WebSocket (STOMP)
- **API Docs**: Springdoc OpenAPI (Swagger)
- **Video**: Agora.io SDK
- **Translation**: Google Cloud Translation API
- **Email**: Spring Mail

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State**: React Context API / Redux Toolkit
- **Routing**: React Router v6
- **HTTP**: Axios
- **WebSocket**: SockJS + STOMP
- **Video**: Agora React SDK
- **i18n**: react-i18next
- **Forms**: React Hook Form + Zod validation

## 📁 Project Structure

```
doctime-fullstack-app/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/com/doctime/
│   │   ├── config/            # Security, WebSocket, CORS configs
│   │   ├── controller/        # REST APIs
│   │   ├── model/             # JPA Entities
│   │   ├── repository/        # Data access layer
│   │   ├── service/           # Business logic
│   │   ├── dto/               # Data transfer objects
│   │   ├── security/          # JWT, UserDetails
│   │   └── exception/         # Custom exceptions
│   ├── src/main/resources/
│   │   ├── application.yml    # App configuration
│   │   ├── messages_en.properties  # English i18n
│   │   └── messages_hi.properties  # Hindi i18n
│   └── pom.xml               # Maven dependencies
│
├── frontend/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (20+ screens)
│   │   ├── context/          # React Context for state
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   ├── utils/            # Helper functions
│   │   ├── i18n/             # Internationalization
│   │   └── App.jsx           # Root component
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml        # Multi-container setup
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0
- Maven 3.8+
- Agora.io account (free tier)
- Google Cloud account (Translation API)

### 1. Clone Repository
```bash
git clone https://github.com/Vyom1Jain/doctime-fullstack-app.git
cd doctime-fullstack-app
```

### 2. Database Setup
```sql
CREATE DATABASE doctime;
USE doctime;
```

### 3. Configure Backend
```bash
cd backend
cp src/main/resources/application.yml.example src/main/resources/application.yml
# Edit application.yml with your credentials
```

**Required configuration:**
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/doctime
    username: your_mysql_user
    password: your_mysql_password

jwt:
  secret: your-secret-key-min-256-bits
  expiration: 86400000

agora:
  app-id: your-agora-app-id
  app-certificate: your-agora-certificate

google:
  cloud:
    project-id: your-gcp-project-id
    credentials: /path/to/service-account.json
```

### 4. Run Backend
```bash
mvn clean install
mvn spring-boot:run
# Backend runs on http://localhost:8080
```

### 5. Configure Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with backend URL and Agora credentials
```

**.env file:**
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
VITE_AGORA_APP_ID=your-agora-app-id
```

### 6. Run Frontend
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

## 🐳 Docker Deployment

```bash
docker-compose up -d
# Access at http://localhost
```

## 📚 API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs

## 🔑 Default Credentials

**Doctor Account:**
- Email: `doctor@doctime.com`
- Password: `Doctor@123`

**Patient Account:**
- Email: `patient@doctime.com`
- Password: `Patient@123`

## 📱 Screens Implemented

### Patient Screens (12)
1. Splash Screen
2. Role Selection
3. Login/Signup
4. Patient Dashboard
5. Find Doctor
6. Doctor Profile
7. Book Appointment
8. My Appointments
9. Chat with Doctor
10. Video Consultation
11. My Reports (with translation)
12. Billing & Payment
13. Health Hub (Calculators)
14. Support Patients (Donations)
15. Profile & Settings

### Doctor Screens (8)
16. Doctor Dashboard
17. My Patients
18. Patient Details
19. New Prescription
20. Manage Appointments
21. Earnings Analytics
22. Donation Verification
23. Profile & Settings

### Common Screens (2)
24. Video Call Interface
25. Post-Consultation Summary

## 🌐 Internationalization

Supported languages:
- 🇬🇧 English (default)
- 🇮🇳 Hindi

Switch language in Profile Settings.

## 🔒 Security Features

- Password hashing with BCrypt
- JWT token-based authentication
- CORS configuration
- SQL injection prevention
- XSS protection
- CSRF tokens
- Role-based route guards

## 📊 Database Schema

**Core Tables:**
- `users` - Base user table
- `patients` - Patient-specific data
- `doctors` - Doctor profiles with specialty
- `appointments` - Booking records
- `messages` - Chat messages
- `prescriptions` - Digital prescriptions
- `reports` - Medical documents
- `transactions` - Billing records
- `donations` - Patient support requests
- `video_notes` - Consultation notes

## 🚢 Deployment

### Render.com (Recommended)
```bash
# Backend: Deploy as Web Service
# Frontend: Deploy as Static Site
# Database: Use Render PostgreSQL or external MySQL
```

### AWS / GCP / Azure
- Backend: Elastic Beanstalk / App Engine / App Service
- Frontend: S3 + CloudFront / Cloud Storage / Blob Storage
- Database: RDS / Cloud SQL / Azure Database

## 🧪 Testing

```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd frontend
npm test
```

## 📝 License

MIT License - see LICENSE file

## 👨‍💻 Author

**Vyom Jain**
- GitHub: [@Vyom1Jain](https://github.com/Vyom1Jain)
- Email: vyom.22scse1011072@galgotiasuniversity.edu.in
- Location: Uttar Pradesh, India

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 🐛 Known Issues & Roadmap

- [ ] Add prescription OCR scanning
- [ ] Implement payment gateway (Razorpay/Stripe)
- [ ] Add email/SMS notifications
- [ ] Mobile app (React Native)
- [ ] AI symptom checker
- [ ] Insurance integration

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: vyom.22scse1011072@galgotiasuniversity.edu.in

---

⭐ **Star this repo if you find it helpful!**
