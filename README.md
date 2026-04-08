# Agency Project Hub API

Fastify + TypeScript + Zod backend for Agency Project Hub — production-style API pairing with a dashboard frontend.

Built on the fastify-zod-boilerplate with strict clean architecture (`config`, `routes`, `services`, `store`).

## Quick start

```bash
npm install
npm run skills:sync
npm run skills:verify
npm run dev
```

## Scripts

- `npm run dev` starts local API on `PORT` (default `4000`)
- `npm run lint` runs ESLint
- `npm run format:check` validates Prettier formatting
- `npm run test` runs Vitest tests (50 tests)
- `npm run build` emits `dist/`
- `npm run skills:sync` syncs optional vendor skills from lockfile
- `npm run skills:verify` verifies required local backend skills (and optional vendor skills)
- `npm run docker:up` starts app + Postgres + Redis in Docker
- `npm run docker:down` stops Docker services
- `npm run docker:logs` tails app logs from Docker Compose
- `npm run docker:validate` validates compose file syntax
- `npm run prisma:generate` generates Prisma client
- `npm run prisma:migrate:dev` runs local Prisma migration
- `npm run prisma:migrate:deploy` applies migrations in non-dev env
- `npm run prisma:studio` opens Prisma Studio

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | TCP port to listen on |
| `NODE_ENV` | `development` | `development` / `test` / `production` |
| `DATABASE_URL` | `postgresql://app:app@localhost:5434/app?schema=public` | Local database URL |
| `REDIS_URL` | `redis://localhost:6380` | Local Redis URL |

## API reference

### Error shape

All error responses share a stable shape:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable description",
  "issues": { ... }
}
```

**Stable error codes:** `NOT_FOUND` · `INVALID_BODY` · `INVALID_QUERY` · `INVALID_REFERENCE` · `INTERNAL_ERROR`

### Pagination (list endpoints)

Query params accepted by all list routes:

| Param | Default | Notes |
|---|---|---|
| `page` | `1` | 1-based page number |
| `limit` | `20` | Max `100` |
| `sort` | varies | Field name, endpoint-specific |
| `order` | `desc` | `asc` or `desc` |

Paginated response shape:

```json
{ "items": [...], "total": 42, "page": 1, "limit": 20, "pages": 3 }
```

---

### `GET /health`

```bash
curl http://localhost:4000/health
```

```json
{ "status": "ok", "service": "agency-project-hub" }
```

---

### Clients

#### `GET /clients`

```bash
# List all clients
curl http://localhost:4000/clients

# Search + sort
curl "http://localhost:4000/clients?search=acme&sort=name&order=asc&limit=10"
```

Extra filter params: `search` (name or email substring).

#### `POST /clients`

```bash
curl -X POST http://localhost:4000/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "email": "hello@acme.example", "phone": "+1-555-0100"}'
```

**Body schema:**

| Field | Type | Required |
|---|---|---|
| `name` | string (2–100) | ✓ |
| `email` | string (email) | ✓ |
| `phone` | string (5–30) | — |

---

### Projects

#### `GET /projects`

```bash
# All projects
curl http://localhost:4000/projects

# Filter by status and client
curl "http://localhost:4000/projects?status=in_progress&clientId=client-1&sort=dueDate&order=asc"
```

Extra filter params: `status` (`backlog` | `in_progress` | `review` | `done` | `blocked`), `clientId`.

#### `GET /projects/kanban`

Returns all projects grouped by status (no pagination).

```bash
curl http://localhost:4000/projects/kanban
```

```json
{
  "backlog": [...],
  "in_progress": [...],
  "review": [...],
  "done": [...],
  "blocked": [...]
}
```

#### `POST /projects`

```bash
curl -X POST http://localhost:4000/projects \
  -H "Content-Type: application/json" \
  -d '{"clientId": "client-1", "name": "Website Redesign", "status": "backlog", "dueDate": "2026-12-31T00:00:00Z"}'
```

**Body schema:**

| Field | Type | Required |
|---|---|---|
| `clientId` | string (must exist) | ✓ |
| `name` | string (2–150) | ✓ |
| `description` | string (max 500) | — |
| `status` | ProjectStatus | — (default `backlog`) |
| `dueDate` | ISO 8601 string | — |

#### `PATCH /projects/:id`

Partial update — provide only the fields to change (at least one required).

```bash
curl -X PATCH http://localhost:4000/projects/proj-1 \
  -H "Content-Type: application/json" \
  -d '{"status": "review"}'
```

Status changes are automatically recorded in the activity feed.

---

### Project Tasks

#### `GET /projects/:id/tasks`

```bash
# All tasks for a project
curl http://localhost:4000/projects/proj-1/tasks

# Only incomplete tasks, sorted by dueDate
curl "http://localhost:4000/projects/proj-1/tasks?done=false&sort=dueDate&order=asc"
```

Extra filter params: `done` (`true` | `false`).

#### `POST /projects/:id/tasks`

```bash
curl -X POST http://localhost:4000/projects/proj-1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write release notes", "assignee": "Jane Dev", "dueDate": "2026-06-01T00:00:00Z"}'
```

**Body schema:**

| Field | Type | Required |
|---|---|---|
| `title` | string (2–200) | ✓ |
| `description` | string (max 1000) | — |
| `assignee` | string (max 100) | — |
| `dueDate` | ISO 8601 string | — |

---

### Dashboard

#### `GET /dashboard/summary`

Aggregated counts for the main dashboard view.

```bash
curl http://localhost:4000/dashboard/summary
```

```json
{
  "totalClients": 2,
  "totalProjects": 5,
  "totalTasks": 8,
  "projectsByStatus": {
    "backlog": 1, "in_progress": 1, "review": 1, "done": 1, "blocked": 1
  },
  "activeProjectsCount": 2,
  "activeProjects": [...],
  "overdueTasksCount": 2,
  "overdueTasks": [...]
}
```

---

### Activity Feed

#### `GET /activity-feed`

```bash
# Latest 20 events
curl http://localhost:4000/activity-feed

# Events for a specific project, limit 5
curl "http://localhost:4000/activity-feed?projectId=proj-1&limit=5"
```

| Param | Default | Max |
|---|---|---|
| `limit` | `20` | `50` |
| `projectId` | — | — |

Events are sorted newest first. Event types: `client_created` · `project_created` · `project_status_changed` · `task_created` · `task_completed`.

---

## Project structure

```
src/
  app.ts              # Wires services and routes into a Fastify instance
  server.ts           # Process entrypoint
  config/env.ts       # Validated environment variables (Zod)
  types/index.ts      # Domain types (Client, Project, ProjectTask, etc.)
  errors/index.ts     # Stable error codes + response helpers
  utils/paginate.ts   # Generic paginator + shared pagination Zod schema
  store/index.ts      # In-memory store factory with seed data
  services/           # Thin business logic layer (one file per domain)
  routes/             # Route registration functions (thin handlers)
tests/
  helpers.ts          # parseBody<T> helper for typed test assertions
  *.test.ts           # 50 integration tests across all endpoints
```

## Docker local dev

```bash
cp .env.example .env
npm run docker:up
```

Default containerized stack:

- API: `http://localhost:4000`
- Postgres: `localhost:5434`
- Redis: `localhost:6380`

Stop stack:

```bash
npm run docker:down
```

## Persistence baseline

This repo now includes Prisma baseline files:

- `prisma/schema.prisma`
- `src/db/prisma.ts`

Current API still runs on in-memory store by default; Prisma layer is prepared for incremental migration.
