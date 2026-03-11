FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom first and resolve all dependencies including annotation processors
COPY pom.xml .
RUN mvn dependency:resolve dependency:resolve-plugins -q

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B \
    -Dmaven.compiler.forceJavacCompilerUse=true

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
