# Frontend (static)

A standalone HTML/CSS/JS UI that talks to the existing Spring Boot backend.

## Backend API used

- `GET /students`
- `GET /students/{id}`
- `POST /students`
- `PUT /students/{id}`
- `DELETE /students/{id}`

## Run

1) Start the backend (from `backend/`):

```bash
mvn spring-boot:run
```

2) Serve the frontend (from `frontend/`). Any static server works; here are two options:

```bash
# Option A (Python)
python3 -m http.server 5173
```

```bash
# Option B (Node)
npx --yes serve -l 5173 .
```

3) Open: `http://localhost:5173`

## Configure API base URL

In the top bar, set **API base** (default: `http://localhost:8080`) and click **Save**.

## Note on CORS

If your backend doesn’t allow cross-origin requests, browser calls from `http://localhost:5173` to `http://localhost:8080` may be blocked.

Easiest workaround without changing backend code: serve the frontend through the same origin (reverse proxy) or enable CORS in your browser for local dev. If you want, tell me how you’re running it and I can suggest the smallest non-logic backend configuration change (but I won’t touch your backend unless you ask).
