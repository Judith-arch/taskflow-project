# TaskFlow — Backend

Express REST API · Node.js · Layered Architecture

---

## Overview

This document covers the server setup, architecture, API endpoints, frontend integration changes, and the complete setup process for the TaskFlow backend built with Express.js.

The backend was added to the TaskFlow project as a new `server/` directory without modifying the existing frontend structure.

---

## Folder Structure

```
taskflow-project/
├── index.html
├── style.css
├── app.js                        ← refactored to use API
├── api/
│   └── client.js                 ← new: all fetch() calls live here
├── docs/
├── .postman/
└── server/                       ← new: entire backend
    ├── .env                      ← PORT=3000 (git-ignored)
    ├── .gitignore                 ← node_modules + .env
    ├── package.json
    └── src/
        ├── index.js              ← entry point, middlewares, error handler
        ├── config/
        │   └── env.js            ← dotenv loader + validation
        ├── services/
        │   └── task.service.js   ← pure logic, in-memory array
        ├── controllers/
        │   └── task.controller.js ← req/res handling, validation
        └── routes/
            └── task.routes.js    ← verb → controller mapping
```

---

## Setup — Step by Step

### 1. Initialize the server

From the project root:

```bash
mkdir -p server/src/config server/src/services server/src/controllers server/src/routes
cd server
npm init -y
npm install express cors dotenv
npm install --save-dev nodemon
```

### 2. Configure package.json

Added the dev script manually:

```json
"scripts": {
  "dev": "nodemon src/index.js"
}
```

### 3. Create .env

```bash
echo PORT=3000 > .env
```

Contents:

```
PORT=3000
```

### 4. Create .gitignore inside server/

```
node_modules
.env
```

> There are two `.gitignore` files — one at the project root (frontend) and one inside `server/` (backend). Both are intentional.

### 5. dotenv path fix

The default `require('dotenv').config()` did not resolve the `.env` path correctly due to a VS Code extension intercepting it. Fixed by passing an explicit path:

```js
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
```

A fallback was added so the server starts even if the variable is missing during debugging:

```js
if (!process.env.PORT) { process.env.PORT = '3000'; }
```

---

## Architecture — Three Layers

The backend is split into three strict, unidirectional layers. No layer reaches into the one above it.

### Layer 1 — Routes (`src/routes/task.routes.js`)

Maps HTTP verbs and URL patterns to controller functions. Contains zero logic — it is purely a routing table.

```js
router.get('/',        getAllTasks)   // GET    /api/v1/tasks
router.post('/',       createTask)   // POST   /api/v1/tasks
router.delete('/:id',  deleteTask)   // DELETE /api/v1/tasks/:id
```

### Layer 2 — Controllers (`src/controllers/task.controller.js`)

Reads from `req`, validates input, calls the service, and sends the HTTP response. Controllers do not contain business logic — they are thin orchestrators.

Validation happens here before data reaches the service. If it fails, a `400` is returned immediately.

### Layer 3 — Services (`src/services/task.service.js`)

Pure JavaScript logic with no knowledge of Express, `req`, or `res`. Uses an in-memory array as a simulated database. Can be unit-tested in isolation.

- `getAll()` — returns the full tasks array
- `create(data)` — builds and stores a new task, returns it
- `remove(id)` — finds and splices the task, throws `NOT_FOUND` if missing

---

## Middlewares (`src/index.js`)

Middlewares are functions that run on every request before it reaches the route handler. Each one calls `next()` to pass control forward.

### `cors()`

Adds `Access-Control-Allow-Origin: *` to every response. Allows the frontend (served from a different port via Live Server) to call the API without being blocked by the browser's same-origin policy.

### `express.json()`

Parses the raw JSON body of incoming POST requests and makes it available as `req.body`. Without this, `req.body` would be `undefined`.

### Request logger (custom)

Logs every request to the console with method, URL, status code and response time:

```
[GET] /api/v1/tasks — 200 (12.34ms)
```

Subscribes to `res.on('finish')` so timing includes the full response cycle.

### Global error handler (4-parameter middleware)

Placed at the end of `index.js`. Express identifies it as an error handler because it takes four parameters: `(err, req, res, next)`.

| Error message | HTTP response |
|---|---|
| `NOT_FOUND` | 404 — Task not found |
| Anything else | 500 — Internal server error (details logged server-side only) |

---

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

| Method | Endpoint | Status | Description |
|---|---|---|---|
| GET | `/tasks` | 200 | Returns all tasks as a JSON array |
| POST | `/tasks` | 201 | Creates a new task, returns the created object |
| POST | `/tasks` | 400 | Validation failed — title missing or too short |
| DELETE | `/tasks/:id` | 204 | Task deleted, no response body |
| DELETE | `/tasks/:id` | 404 | Task with that ID does not exist |
| DELETE | `/tasks/:id` | 400 | ID is not a valid number |

### POST /tasks — Request body

```json
{
  "title": "Buy groceries",
  "deadline": "2026-05-01",
  "status": "to-do",
  "priority": 2,
  "assigned": "Judith"
}
```

### POST /tasks — Successful response (201)

```json
{
  "id": 1,
  "title": "Buy groceries",
  "deadline": "2026-05-01",
  "status": "to-do",
  "priority": 2,
  "assigned": "Judith",
  "createdAt": "2026-04-20T07:48:10.393Z"
}
```

---

## Postman Integration Tests

All five tests were run and passed.

| Test | Request | Expected | Result |
|---|---|---|---|
| 1 | GET /tasks (empty) | 200 · `[]` | ✓ |
| 2 | POST valid task | 201 · task object | ✓ |
| 3 | POST missing title | 400 · error message | ✓ |
| 4 | DELETE /tasks/999 | 404 · not found | ✓ |
| 5 | GET /tasks after create | 200 · array with task | ✓ |

---

## Frontend Changes

The frontend was refactored to consume the Express API instead of reading/writing `localStorage` for task data.

### New file: `api/client.js`

A dedicated network layer. This is the single place where all HTTP calls are made. `app.js` never calls `fetch()` directly.

- `fetchTasks()` — GET /api/v1/tasks, returns parsed JSON array
- `createTask(data)` — POST /api/v1/tasks, returns created task
- `deleteTask(id)` — DELETE /api/v1/tasks/:id, returns nothing (204)

Exported as `window.apiClient` so app.js can call `window.apiClient.fetchTasks()` etc.

### Script tag order in index.html

`api/client.js` must load before `app.js`:

```html
<script src="api/client.js"></script>
<script src="app.js"></script>
```

### Changes to app.js

#### Removed
- `saveTasks()` function — completely deleted
- All `saveTasks()` calls removed from: `togglePin`, `changeStatus`, `toggleComplete`, `toggleSubtask`, `deleteSubtask`, `addInlineSubtask`, `editSubtask`, `editTitle`
- `localStorage` task load block at the bottom of the file

#### Changed
- Form submit handler — made `async`, now calls `window.apiClient.createTask()`
- `cancelTask()` — now calls `window.apiClient.deleteTask()` before removing from local array
- `loadTasks()` — new async function that replaces the old localStorage load, shows loading/error states
- `importFromJSON()` — removed `saveTasks()` call, now just updates local array and re-renders

#### Kept using localStorage
Theme preference (dark/light) and dialog skip preferences still use `localStorage`. This is correct — they are UI state, not task data. The 12-Factor App principle applies to application data and credentials, not UI preferences.

### Three UI states

The frontend now handles three states on initial load:

- **Loading** — "Loading tasks…" shown while the fetch is in flight
- **Success** — tasks rendered normally after a successful response
- **Error** — "⚠ Could not connect to the server. Is it running?" if the fetch throws

---

## In-memory Persistence

Tasks are stored in a JavaScript array inside `task.service.js`. This means:

- ✅ Reloading the browser preserves tasks (server keeps running)
- ⚠️ Restarting the server loses all tasks (no database)

This is expected for this phase. A real database (MongoDB, PostgreSQL) would be the next step.

---

## Environment Variables

Following the [12-Factor App](https://12factor.net) methodology, all configuration that changes between environments is injected through environment variables — never hardcoded.

1. Create `server/.env` with `PORT=3000`
2. `server/.gitignore` must list `.env` so credentials are never committed
3. `src/config/env.js` loads and validates the variable before the server starts
4. If `PORT` is missing the server throws an explicit error rather than failing silently

---

## Running the Project

### Start the server

```bash
cd server
npm run dev
```

Server starts at `http://localhost:3000`. nodemon watches for file changes and restarts automatically.

### Start the frontend

Open `index.html` with VS Code Live Server (right-click → Open with Live Server).

> Both must be running simultaneously for the app to work.

### Verify the API

Open `http://localhost:3000/api/v1/tasks` in the browser — should return `[]`.