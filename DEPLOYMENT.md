# Deployment Guide

## Production Checklist

### Backend (Spring Boot)

1. **Database Setup**
   ```sql
   CREATE DATABASE doctime CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'doctime_user'@'%' IDENTIFIED BY 'strong_password_here';
   GRANT ALL PRIVILEGES ON doctime.* TO 'doctime_user'@'%';
   FLUSH PRIVILEGES;
   ```

2. **Environment Variables**
   ```bash
   export DB_URL=jdbc:mysql://your-db-host:3306/doctime
   export DB_USER=doctime_user
   export DB_PASS=strong_password_here
   export JWT_SECRET=your_256_bit_secret_key_here_minimum_32_chars
   export AGORA_APP_ID=your_agora_app_id
   export AGORA_APP_CERT=your_agora_certificate
   ```

3. **Build & Run**
   ```bash
   cd backend
   mvn clean package -DskipTests
   java -jar target/doctime-backend-1.0.0.jar --spring.profiles.active=prod
   ```

4. **Docker (Optional)**
   ```dockerfile
   FROM eclipse-temurin:17-jre
   WORKDIR /app
   COPY target/doctime-backend-1.0.0.jar app.jar
   EXPOSE 8080
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

### Frontend (React + Vite)

1. **Environment Variables**
   Create `.env.production`:
   ```
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   VITE_WS_URL=https://api.yourdomain.com/ws
   VITE_AGORA_APP_ID=your_agora_app_id
   ```

2. **Build**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Deploy**
   - **Vercel/Netlify**: Connect GitHub repo, set env vars, auto-deploy
   - **Nginx**: Serve `dist/` folder
     ```nginx
     server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/doctime/dist;
       index index.html;
       location / {
         try_files $uri $uri/ /index.html;
       }
     }
     ```

### Database Migrations

For production, switch from `ddl-auto: update` to Flyway or Liquibase:

```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-mysql</artifactId>
</dependency>
```

### Security Hardening

1. **HTTPS Only** - Use Let's Encrypt + Nginx reverse proxy
2. **Rate Limiting** - Add Spring Security rate limiter or Nginx `limit_req`
3. **CORS** - Restrict `allowedOriginPatterns` to your domain
4. **JWT Expiry** - Keep short (1-24h), implement refresh tokens
5. **Input Validation** - Already present via `@Valid` annotations

### Monitoring

- **Spring Boot Actuator**: Add to `pom.xml` for `/actuator/health`, `/metrics`
- **Logging**: Configure Logback to write to files + rotate
- **Alerts**: Set up monitoring for DB connections, API response times

### Backup Strategy

```bash
# Daily MySQL backup
0 2 * * * mysqldump -u doctime_user -p doctime > /backups/doctime_$(date +\%Y\%m\%d).sql
```
