# Café & Employee Management System

This repository contains a full-stack web application developed for the GIC Full Stack Software Engineer Internship technical assessment. It is a "Café Employee" manager that allows users to view, create, update, and delete cafés and their associated employees.

## 🚀 Live Demo

* **Frontend / Hosted App:** [Insert your deployed URL here]
* **API Endpoint:** [Insert your deployed Backend URL here]

## 🛠️ Tech Stack & Architecture

### Backend

* **Runtime:** Node.js v22.x+ (TypeScript)
* **Database:** PostgreSQL
* **Architecture:** Clean Architecture & CQRS (Command Query Responsibility Segregation)
* **Patterns:** Mediator Pattern (`mediatr-ts` for Dependency Injection and Handler routing)
* **API:** RESTful Express.js

### Frontend

* **Framework:** React.js 19 (Vite)
* **Table Component:** Ag-Grid Community
* **UI & CSS Framework:** Ant Design (Antd)
* **State/Routing:** React Router DOM (Data Router)
* **HTTP Client:** Axios

## 📂 Project Structure

This project is organized as a monorepo with explicit boundary separations:

* `/backend`: Contains the REST API, organized using Clean Architecture (`api`, `application`, `domain`, `infra`).
* `/frontend`: Contains the React SPA with reusable Antd components, custom hooks, and Ag-Grid tables.
* `/database`: Contains `schema.sql` for DDL and `seed.sql` for initial DML population.

## ⚙️ Local Setup & Installation

### Prerequisites

* Node.js (v22.x or above)
* Docker Desktop (for the PostgreSQL database)

### 1. Start the Database

The PostgreSQL database is containerized. To start it and automatically run the schema and seed scripts, navigate to the root directory and run:

```bash
docker compose up -d

```

*(Note: The database runs on port 5432. Credentials can be found in `docker-compose.yml`)*

### 2. Start the Backend Server

Open a new terminal and navigate to the `backend` directory:

```bash
cd backend
npm install
npm run dev

```

*The API will be available at `http://localhost:3000/api`.*

### 3. Start the Frontend Application

Open another terminal and navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev

```

*The UI will be available at `http://localhost:5173`.*

## 🧪 Testing the API

A bash script is included to automatically verify the backend RESTful endpoints, data constraints (like custom `UIXXXXXXX` formats), and cascading delete rules.

Ensure the backend and database are running, then execute from the root directory:

```bash
bash test-backend.sh

```

## 💡 Key Design Decisions

### Backend

* **Transaction Management:** Database transactions (`BEGIN` / `COMMIT`) are used in write-heavy commands (like creating an employee or deleting a café) to guarantee atomic operations and data integrity across junction tables.
* **Dynamic Derived Fields:** Metrics like an employee's `days_worked` are calculated dynamically in the SQL queries based on a fixed `start_date`, rather than storing volatile daily integers in the database.
* **Decoupled Architecture:** Using the Mediator pattern (`mediatr-ts`) completely decouples the Express routing layer from the core business logic, adhering strictly to enterprise-level Clean Architecture practices.

### Frontend

* **Centralized API Layer:** All HTTP calls are decoupled from UI components and managed in a dedicated `api/index.ts` file with strict TypeScript interfaces.
* **Advanced Routing:** Utilizes React Router's `createBrowserRouter` (data router context) to enable robust in-app navigation guards (`useBlocker`) for unsaved form changes.
* **Optimized Data Grids:** Server-side filtering and Ag-Grid cell renderers are used to maintain high performance and provide deep-linked navigation between Café and Employee views.