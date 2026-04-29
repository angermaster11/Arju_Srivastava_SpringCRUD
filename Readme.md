
# Student CRUD (Spring Boot + JDBC)

A simple **Student management** app with a Spring Boot backend (JDBC + PostgreSQL) and a modern **HTML/CSS/JavaScript** frontend.

## Features

- Create, list, update, delete students
- Responsive, modern UI (search + row select + edit form)
- REST API with clean error responses
- PostgreSQL schema auto-initialization on startup

## Tech Stack

- Backend: Java, Spring Boot, JDBC
- Database: PostgreSQL
- Frontend: Vanilla HTML + CSS + JavaScript

## Project Structure

```
backend/   # Spring Boot app
frontend/  # Static UI (served separately)
```

## API

Base path: `/students`

- `GET /students` → list all
- `GET /students/{id}` → get one
- `POST /students` → create
- `PUT /students/{id}` → update
- `DELETE /students/{id}` → delete

Student JSON:

```json
{ "id": 1, "name": "Ada", "email": "ada@example.com", "course": "CS" }
```

## Prerequisites

- Java + Maven
- PostgreSQL running locally

Default DB config is in `backend/src/main/resources/application.properties`:

- Host: `localhost:5432`
- DB: `schooldb`
- User: `postgres`
- Pass: `postgres`

Create the database if needed:

```bash
createdb -h localhost -U postgres schooldb
```

## Run (Backend)

```bash
cd backend
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`.

## Run (Frontend)

Option A: Static server (recommended for dev)

```bash
cd frontend
python3 -m http.server 5173
```

Open `http://localhost:5173`.

In the UI top bar set **API base** to `http://localhost:8080` and click **Save**.

## CORS

For local development, CORS is enabled for `/students/**` via `backend/src/main/java/com/example/studentjdbc/CorsConfig.java`.

## Troubleshooting

- **UI shows “Failed to fetch”**
	- Ensure backend is running: `curl http://localhost:8080/students`
	- If backend is up, verify API base in the UI is correct.

- **Backend won’t start / DB errors**
	- Start PostgreSQL and ensure database `schooldb` exists.

## Notes

- Backend business logic is intentionally kept simple.
- Frontend is intentionally framework-free (no React/Angular).

