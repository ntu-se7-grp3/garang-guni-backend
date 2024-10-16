FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY . .
RUN chmod 774 ./mvnw
RUN ./mvnw clean install -DskipTests
CMD ["./mvnw", "spring-boot:run"]
