# Freelance Marketplace Monorepo

This repository contains a school project for a freelance marketplace platform.

## Project Structure

- `freelance-marketplace/` -> Spring Boot backend (current implementation)
- `freelancemarketplaceFE/` -> Frontend placeholder (to be implemented)

## Current Backend Scope

The backend currently includes:

- JWT authentication (`register`, `login`)
- Role-based access (`ADMIN`, `CLIENT`, `FREELANCER`)
- Services flow (freelancer creates, admin approves)
- Orders flow (client creates, admin assigns, status updates)
- Messaging per order with strict rule:
  - client and freelancer cannot communicate directly
  - admin is always intermediary
- WebSocket live message publishing per order topic
- Swagger API documentation
- Docker support (PostgreSQL + app)

## 1) Clone the Repository

```bash
git clone https://github.com/waelchaibi/freelance-mkplace.git
cd freelance-mkplace
```

## 2) Backend Prerequisites

Install and configure:

- Java 17
- Maven (optional, wrapper is included)
- PostgreSQL (if running locally without Docker)

## 3) Run Backend (Local)

Go to backend folder:

```bash
cd freelance-marketplace
```

Run tests:

```bash
./mvnw test
```

Run application:

```bash
./mvnw spring-boot:run
```

Backend base URL:

- `http://localhost:8080`

## 4) Run Backend With Docker (Alternative)

From `freelance-marketplace/`:

```bash
docker compose up --build
```

This starts:

- PostgreSQL on port `5432`
- Spring Boot app on port `8080`

## 5) Swagger Docs

Once backend is running:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 6) Default Seeded Admin

At startup, backend seeds an admin account if it does not exist:

- Email: `admin@marketplace.com`
- Password: `Admin123!`

Use this account to test admin-protected flows.

## 7) WebSocket (Current Live Messaging)

WebSocket endpoint:

- `ws://localhost:8080/ws`

Subscribe to order topic:

- `/topic/orders/{orderId}`

When a message is sent through REST (`POST /api/messages`), the backend saves it and pushes it to that topic.

---

For detailed backend configs and endpoint implementation, see `freelance-marketplace/README.md`.
