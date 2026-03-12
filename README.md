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

## Running with Docker Compose (recommended)

This starts all three services — frontend, backend, and PostgreSQL — in an isolated Docker network.

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd cafe-management-system
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Edit `.env` with your chosen values:

```env
DB_NAME=cafe_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
PORT=3000
VITE_API_BASE_URL=http://localhost:3000
```

> **Note:** `VITE_API_BASE_URL` is baked into the frontend at build time and must be reachable from the **user's browser**. For a deployed server, set it to your public backend URL (e.g. `https://api.yourdomain.com`).

### 3. Build and start

```bash
docker compose up --build
```

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost      |
| Backend  | http://localhost:3000 |
| Database | localhost:5432        |

The database schema and seed data are applied automatically on first start via the `./database` volume mount.

### 4. Stop

```bash
docker compose down
```

To also wipe the database volume (all data will be lost):

```bash
docker compose down -v
```

---

## Running Locally (without Docker)

### Prerequisites

* Node.js 20+
* PostgreSQL 15

### 1. Database

```bash
psql -U <user> -d <dbname> -f database/schema.sql
psql -U <user> -d <dbname> -f database/seed.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in DB_* values
npm install
npm run dev            # http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:3000
npm install
npm run dev            # http://localhost:5173
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