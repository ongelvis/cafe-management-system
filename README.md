# Café & Employee Management System

A full-stack web application for managing cafes and their employees. Built with a Node.js/TypeScript backend (CQRS pattern via `mediatr-ts`), a React/Vite frontend (Ant Design + Ag-Grid), and PostgreSQL.

## Live Demo

* **Frontend:** [Insert your deployed URL here]
* **API:** [Insert your deployed backend URL here]

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, TypeScript, Express 5, `mediatr-ts` (CQRS) |
| Database | PostgreSQL 15 |
| Frontend | React 19, Vite, Ant Design, Ag-Grid, React Router v7 |
| HTTP | Axios |
| Container | Docker, Docker Compose, Nginx |

---

## Environment Overview

There are three environments, each with a different configuration:

| Environment | Frontend | Backend | Database |
|---|---|---|---|
| Option 1 — Docker stack | `http://localhost` (port 80, served by Nginx) | `http://localhost:3000` | Local Docker Postgres |
| Option 2 — Dev mode (hot reload) | `http://localhost:5173` (Vite dev server) | `http://localhost:3000` | Local Docker Postgres |

> **Why port 80 for Docker?** The frontend container runs Nginx which listens on port 80. Port 5173 is Vite's dev server and is only used in Option 2.

`VITE_API_BASE_URL` is **baked into the frontend bundle at build time**. If the URL ever changes, the frontend image must be **rebuilt** (`docker compose up --build`), not just restarted.

---

## Option 1 — Full Docker Stack (closest to production)

All three services run as containers. Use this to verify the Dockerized app works before deploying.

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd cafe-management-system
```

### 2. Create the root environment file

```bash
cp .env.example .env
```

The default values in `.env.example` work out of the box for local Docker:

```env
DB_NAME=cafe_db
DB_USER=user
DB_PASSWORD=password
PORT=3000
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Build and start

```bash
docker compose up --build -d
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost       |
| Backend  | http://localhost:3000  |
| Database | localhost:5432         |

The `./database` volume mount automatically runs `schema.sql` then `seed.sql` on first start.

### 4. Subsequent starts (no code changes)

```bash
docker compose up -d
```

Only use `--build` again when you change code or `.env` values.

### 5. Stop

```bash
docker compose down          # stop containers, keep database volume
docker compose down -v       # stop containers AND wipe all data
```

---

## Option 2 — Dev Mode (hot reload)

Run only the database in Docker; run the backend and frontend directly with Node for fast feedback and hot reloading.

### 1. Start only the database container

```bash
docker compose up db -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env         # defaults point to local Docker Postgres
npm install
npm run dev                  # http://localhost:3000, restarts on file save
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env         # VITE_API_BASE_URL=http://localhost:3000
npm install
npm run dev                  # http://localhost:5173, hot reloads on file save
```

---

## API Reference

### Cafes

| Method | Endpoint                    | Description                                |
|--------|-----------------------------|--------------------------------------------|
| GET    | `/cafes`                    | List all cafes, sorted by employee count desc |
| GET    | `/cafes?location=<loc>`     | Filter cafes by location                   |
| POST   | `/cafes`                    | Create a cafe                              |
| PUT    | `/cafes/:id`                | Update a cafe                              |
| DELETE | `/cafes/:id`                | Delete a cafe (cascades to employees)      |

**POST/PUT body:**
```json
{
  "name": "Moonbucks",
  "description": "Starbucks Competitor",
  "location": "Tanjong Pagar",
  "logo": "<base64 string, optional>"
}
```

### Employees

| Method | Endpoint                      | Description                                  |
|--------|-------------------------------|----------------------------------------------|
| GET    | `/employees`                  | List all employees, sorted by days worked desc |
| GET    | `/employees?cafe=<name>`      | Filter employees by cafe name                |
| POST   | `/employees`                  | Create an employee                           |
| PUT    | `/employees`                  | Update an employee                           |
| DELETE | `/employees/:id`              | Delete an employee                           |

**POST body:**
```json
{
  "name": "Alice Lim",
  "email_address": "alice@example.com",
  "phone_number": "91112222",
  "gender": "Female",
  "cafe_id": "<uuid, optional>"
}
```

**PUT body:** same as POST plus `"id": "UIXXXXXXX"`.

---

## Testing the Backend

With the backend and database running:

```bash
bash test-backend.sh
```

All tests should report `PASS`. The script tests all CRUD endpoints and reverts any mutations it makes, leaving the seed data intact.

---

## Project Structure

```
cafe-management-system/
├── .env.example               # Root env template for docker-compose
├── docker-compose.yml
├── test-backend.sh
├── backend/
│   ├── Dockerfile
│   ├── tsconfig.build.json    # Production TS compile config (commonjs, outDir: dist)
│   ├── src/
│   │   ├── index.ts
│   │   ├── api/routes.ts
│   │   ├── application/
│   │   │   ├── commands/      # Create/Update/Delete handlers (CQRS)
│   │   │   └── queries/       # GetCafes/GetEmployees handlers
│   │   ├── domain/
│   │   └── infra/Database.ts  # pg connection pool
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf             # SPA fallback routing (try_files → index.html)
│   ├── src/
│   │   ├── api/index.ts       # Axios client + typed interfaces
│   │   ├── components/        # ReusableTextbox
│   │   ├── hooks/             # useUnsavedChanges
│   │   └── pages/             # CafesPage, EmployeesPage, CafeForm, EmployeeForm
└── database/
    ├── schema.sql
    └── seed.sql
```

---

## Key Design Decisions

### Backend

* **CQRS via Mediator:** Commands (writes) and Queries (reads) are separated into distinct handler classes. The Express router sends a message object to `mediator.send()` — it has no direct dependency on any handler. This decouples transport (HTTP) from business logic.
* **Connection Pooling:** `pg.Pool` maintains persistent database connections, avoiding the overhead of opening a new TCP connection on every request.
* **Derived fields in SQL:** `days_worked` is computed as `CURRENT_DATE - start_date` directly in the query rather than stored as a column, keeping data accurate without scheduled updates.

### Frontend

* **Data Router (`createBrowserRouter`):** Required to use React Router's `useBlocker` hook for the unsaved changes guard. The traditional `<BrowserRouter>` does not support blockers.
* **`Promise.all` for edit prefill:** When opening the employee edit form, both the cafe list and the employee list are fetched in parallel. This prevents a race condition where `form.setFieldsValue` runs before the cafe dropdown options are loaded.
* **`VITE_API_BASE_URL` build arg:** Vite bakes env variables into the static bundle at build time. Docker Compose passes it as a `build arg` so the correct URL is embedded for each environment without rebuilding the image separately.
* **Nginx SPA fallback:** The frontend is a client-side SPA. Without `try_files $uri /index.html` in Nginx, refreshing any deep URL (e.g. `/cafes/edit/123`) would return a 404 from the web server instead of serving the React app.
* **Optimized Data Grids:** Server-side filtering and Ag-Grid cell renderers are used to maintain high performance and provide deep-linked navigation between Café and Employee views.