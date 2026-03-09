# Testing Guide

## Backend Testing

### Prerequisites
- MySQL running on `localhost:3306`
- Database `doctime` created
- Maven installed

### Run Backend
```bash
cd backend
export DB_URL=jdbc:mysql://localhost:3306/doctime
export DB_USER=root
export DB_PASS=password
mvn clean install
mvn spring-boot:run
```

### Test API Endpoints

Visit **Swagger UI**: http://localhost:8080/swagger-ui.html

#### 1. Register a Patient
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@test.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "PATIENT"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "password123"
  }'
```
Save the `token` from response.

#### 3. Get Doctors
```bash
curl -X GET http://localhost:8080/api/doctors \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Book Appointment
```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorId": 1,
    "appointmentDateTime": "2026-03-15T10:00:00",
    "type": "ONLINE",
    "notes": "First consultation"
  }'
```

## Frontend Testing

### Run Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open: http://localhost:5173

### Manual Test Flow

1. **Landing Page** (`/`)
   - Click "I'm a Patient" or "I'm a Doctor"

2. **Signup** (`/signup`)
   - Fill form with role pre-selected
   - Submit → should redirect to dashboard

3. **Login** (`/login`)
   - Enter credentials from signup
   - Verify JWT stored in localStorage
   - Check redirect to correct dashboard

4. **Patient Dashboard** (`/patient/dashboard`)
   - See upcoming appointments
   - Click "Find Doctor" → search/book
   - Click "Reports" → view/translate
   - Click "Billing" → transaction history
   - Click "Donations" → active cases

5. **Doctor Dashboard** (`/doctor/dashboard`)
   - See today's appointments
   - Click "My Patients" → patient list
   - Click "Earnings" → income summary
   - Click appointment → "Write Prescription"

6. **Appointments** (`/appointments`)
   - View list (patient or doctor view)
   - Update status (doctor only)
   - Cancel appointment

7. **Chat** (`/chat/:appointmentId`)
   - Open WebSocket connection
   - Send/receive messages
   - View history

8. **Video Call** (`/video/:appointmentId`)
   - Request Agora token
   - Join channel
   - Save consultation notes

## Integration Testing

### WebSocket Chat
```javascript
// Browser console test
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);
stompClient.connect({}, () => {
  stompClient.subscribe('/topic/chat/1', (msg) => console.log(JSON.parse(msg.body)));
  stompClient.send('/app/chat.sendMessage/1', {}, JSON.stringify({
    senderId: 1,
    senderName: 'Test',
    type: 'TEXT',
    content: 'Hello'
  }));
});
```

## Common Issues

### Backend won't start
- ✅ Check MySQL is running: `mysql -u root -p`
- ✅ Check DB exists: `SHOW DATABASES;`
- ✅ Check env vars are set: `echo $DB_URL`

### Frontend 401 errors
- ✅ Token expired → re-login
- ✅ CORS blocked → check backend `SecurityConfig` allows origin
- ✅ Wrong API URL → verify `.env` has correct `VITE_API_BASE_URL`

### WebSocket won't connect
- ✅ Backend `/ws` endpoint is live
- ✅ SockJS fallback enabled
- ✅ No CORS/proxy blocking WS handshake

## Automated Tests (Future)

Add these dependencies for unit/integration tests:

**Backend (JUnit 5 + MockMvc)**
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
```

**Frontend (Vitest + React Testing Library)**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```
