# Freelance Marketplace Backend

Simple Spring Boot backend for a freelance marketplace with an **ADMIN-as-intermediary** communication model.

## Tech Stack

- Java 17
- Spring Boot
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- OpenAPI/Swagger

## Business Rule Highlight

Client and freelancer **cannot communicate directly**.  
Every message is linked to an order and one party must be `ADMIN`.

## Run Locally

1. Ensure Java 17 is installed and `JAVA_HOME` is set.
2. Start PostgreSQL (or use Docker Compose).
3. Run:

```bash
./mvnw spring-boot:run
```

## Run With Docker Compose

```bash
docker compose up --build
```

## Default Seeded Admin

- Email: `admin@marketplace.com`
- Password: `Admin123!`

## Swagger

- UI: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- OpenAPI JSON: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
