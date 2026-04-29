# student-jdbc

Spring Boot (JDBC + `JdbcTemplate`) CRUD REST API for a single `students` table in PostgreSQL.

## Prereqs
- Java 17+
- Maven 3.9+
- PostgreSQL

## Database setup (example)
```bash
createdb schooldb
```

Update credentials in `src/main/resources/application.properties` if needed.

## Run
```bash
mvn spring-boot:run
```

The app auto-creates the `students` table on startup using `src/main/resources/schema.sql`.

## API
Create:
```bash
curl -i -X POST http://localhost:8080/students \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","course":"CS"}'
```

Read all:
```bash
curl -s http://localhost:8080/students
```

Read by id:
```bash
curl -s http://localhost:8080/students/1
```

Update:
```bash
curl -i -X PUT http://localhost:8080/students/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","course":"Algorithms"}'
```

Delete:
```bash
curl -i -X DELETE http://localhost:8080/students/1
```
