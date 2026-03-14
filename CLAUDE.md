# CLAUDE.md

## Project Overview

Train Car Logger is a full-stack offline-capable PWA for tracking NYC subway train car sightings. Users log 4-digit car numbers with the subway line, optionally recording origin/destination stations and notes. The app supports offline use via localStorage, syncing with a backend when connectivity is available, and social features that surface cars shared with other users ("friends").

**Tech stack:** TypeScript throughout, React 18 + Vite frontend, Express + Drizzle ORM backend, PostgreSQL database, Tailwind CSS styling, Vite PWA plugin for offline support.

## Monorepo Structure

npm workspaces monorepo with three packages:

| Workspace | Purpose |
|-----------|---------|
| `frontend/` | React SPA — entry flow, history, friends, auth UI |
| `backend/` | Express REST API — auth, car logs, notifications |
| `shared/` | TypeScript types consumed by both (`TrainLogEntry`, `StationPair`) |

Root `package.json` defines workspaces only (`private: true`).

## Development Setup

See `AGENTS.md` for service ports, startup order, and environment files.

**Key commands:**

```bash
npm install                              # Install all workspaces
npm run dev --workspace=backend          # Start backend (tsx watch, port 3000)
npm run dev --workspace=frontend         # Start frontend (Vite, port 5173)
npm run build                            # Build all workspaces
npm run format --workspace=frontend      # Prettier --write
npm run db:generate --workspace=backend  # Generate Drizzle migration from schema changes
npm run db:migrate --workspace=backend   # Run pending migrations
npm run fetch-stops --workspace=frontend # Update subway station data
```

The frontend works in offline-only mode without a backend — if `VITE_API_URL` is unset, auth/sync/friends features are disabled but car logging works via localStorage.

## Architecture

```
Browser (React SPA)
  ├── localStorage (offline logs + sync queue)
  ├── Service Worker (PWA, workbox)
  └── REST API calls ──► Express Server (backend)
                              └── Drizzle ORM ──► PostgreSQL
```

**Provider nesting in `main.tsx`:** BrowserRouter → AuthProvider → LogsProvider → App

**Routing (`App.tsx`):**
- `/` — EntryFlow (number pad → line picker → confirmation)
- `/history` — HistoryPage (list, stats, leaderboard)
- `/friends` — FriendsPage (shared cars with friends)
- `/login` — LoginPage
- `/account` — AccountPage (sync status, sign out)

TaskBar (bottom nav) appears on `/`, `/history`, `/friends`.

## Backend

### Express Server (`backend/src/index.ts`)

Mounts three route modules under `/api`:
- `/api/auth/*` — register, login
- `/api/logs/*` — CRUD for car logs, station-pairs, shared-cars
- `/api/notifications/*` — mark shared cars as notified

### Configuration (`backend/src/config.ts`)

Required env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`. Optional: `PORT` (default 3000). Throws at startup if required vars are missing.

### Database Schema (`backend/src/db/schema.ts`)

Three tables managed by Drizzle ORM:

**usersTable:** `id` (serial PK), `username` (unique), `passwordHash`, `createdAt`

**carsTable:** `id` (serial PK), `userId` (FK → users, on delete set null), `timestamp` (bigint, epoch ms), `car` (text, 4-digit), `line` (text), `notes` (optional), `origin` (optional station stop_id), `destination` (optional station stop_id), `createdAt`. Unique constraint on `(userId, timestamp, car, line)`.

**notificationsTable:** `id` (serial PK), `userId` (FK, receiver), `friendUserId` (FK, friend who logged car), `loggedCarId` (FK → cars), `createdAt`. Unique constraint on `(userId, friendUserId, loggedCarId)`.

Drizzle client initialized in `backend/src/db/client.ts`. Migrations output to `backend/drizzle/`.

### Auth Middleware (`backend/src/middleware/auth.ts`)

`requireAuth` extracts JWT from `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, attaches `req.user = { userId, username }`. Returns 401 on failure.

### API Routes

**Auth (`backend/src/routes/auth.ts`):**
- `POST /api/auth/register` — validates username (not empty) + password (>= 8 chars), lowercases/trims username, hashes with bcrypt (12 rounds), returns `{ token, userId, username }`
- `POST /api/auth/login` — timing-attack safe (always runs bcrypt.compare even for nonexistent users), returns JWT

**Logs (`backend/src/routes/logs.ts`):**
- `POST /api/logs` — bulk insert entries, `onConflictDoNothing()` for dedup
- `GET /api/logs` — fetch all user's entries, newest first
- `DELETE /api/logs` — bulk delete by `(userId, timestamp, car, line)`
- `PATCH /api/logs/:id` — update notes (verifies ownership)
- `GET /api/logs/station-pairs?line=&limit=&min=` — common origin→destination pairs by frequency
- `GET /api/logs/shared-cars` — cars logged by other users (self-join on carsTable), includes `notified` boolean

**Notifications (`backend/src/routes/notification.ts`):**
- `POST /api/notifications` — mark shared cars as notified, `onConflictDoNothing()`

## Frontend

### State Management (React Context)

**AuthProvider (`frontend/src/auth/auth-context.tsx`):** Provides `user`, `token`, `isAuthenticated`, `login()`, `register()`, `logout()`. Token and user loaded from/saved to localStorage. Hook: `useAuthContext()`.

**LogsProvider (`frontend/src/storage/logs-context.tsx`):** Provides `logs`, `addLog()`, `removeLog()`, `updateNote()`, `getCarCount()`. Loads logs from localStorage on init. On auth state change, calls `syncWithRemote()`. Listens to cross-tab StorageEvent for multi-tab sync. Hook: `useLogsContext()`.

### Pages

**EntryFlow (`frontend/src/pages/EntryFlow.tsx`):** Three-step state machine:
1. NumberPadScreen — enter 4-digit car number (auto-advances)
2. LinePickerScreen — select subway line
3. ConfirmationScreen — optional note, origin/destination stations (with common pair quick-select chips), confirm

On confirm: calls `addLog()`, navigates to `/history` with `{ fromNewEntry: true, repeat }` state.

**HistoryPage (`frontend/src/pages/HistoryPage.tsx`):** Lists all logged cars with stats (total unique, repeats), leaderboard (cars by repeat count), line filter, sort toggle, entry detail modal, JSON export. Triggers confetti on first entry or explosion animation on repeats (via location state).

**FriendsPage (`frontend/src/pages/FriendsPage.tsx`):** Fetches shared cars via API, queues explosion animations for unnotified cars, then posts notifications to mark as seen. Groups results by friend.

**LoginPage / AccountPage:** Auth form and user settings (sync status, pending queue size, last sync time, sign out, refresh app).

### Components

**Entry flow:** `NumberPadScreen`, `LinePickerScreen`, `ConfirmationScreen`, `StationField`, `StationPicker`

**History:** `HistoryTable`, `LineFilter`, `LeaderboardTable`

**UI:** `Button` (multiple variants), `TaskBar`, `UserHeader`, `StatsDisplay`, `FlowContainer`, `EntryDetailModal`, `RouteDiagram`

**Effects:** `CarExplosion` (particle explosion), `ConfettiExplosion` (confetti animation)

**Auth:** `RequireAuth` (route guard)

### API Client (`frontend/src/api/client.ts`)

`apiFetch(path, init)` wraps fetch with automatic `Authorization: Bearer <token>` header. Exported functions: `deleteLogs()`, `fetchSharedFriends()`, `updateLogNotes()`, `fetchStationPairs()`, `postNotifications()`.

`API_URL` sourced from `import.meta.env.VITE_API_URL` (`frontend/src/api/config.ts`).

### Utilities

- `stats.ts` — `calculateTrainStats(logs)` returns `{ loggedCarsCount, repeatCars, leaderboard }`
- `subway.ts` — `getStation()`, `getStopsForRoute()`, `getRouteColor()`, `getStopsBetween()`, `PICKER_LINES` (display order)
- `export.ts` — `exportLogsAsJson()` downloads a timestamped JSON file
- `formatting.ts` — `formatTimestamp()` for human-readable dates
- `notifications.ts` — `processPendingNotifications()` extracts unnotified shared cars for animation + API posting

## Data Flow: Offline-First Sync

### localStorage Keys
- `train-car-logger` — `{ data: TrainLogEntry[] }` (main log store)
- `train-car-logger-sync-queue` — `{ op: "add" | "delete", entry }[]` (pending operations)
- `train-car-logger-last-sync` — timestamp of last successful sync
- `train-car-logger-token` — JWT token
- `train-car-logger-user` — `{ userId, username }`

### Sync Service (`frontend/src/storage/sync-service.ts`)

**Enqueue:** Each `addLog()` or `removeLog()` immediately saves to localStorage and enqueues to sync queue, then calls `flush()`.

**Flush:** Batches all pending adds/deletes, POSTs adds to `/api/logs`, DELETEs to `/api/logs`. Deduplicates by key `${op}|${timestamp}|${car}|${line}`. On success: removes processed ops from queue. On network error: leaves queue intact for retry. On 401: logs warning.

**Bidirectional sync on startup (`syncWithRemote()`):**
1. Fetches all server entries (`GET /api/logs`)
2. Uploads local entries missing from server
3. Merges server entries missing locally (excluding pending deletes)
4. Reconciles — uses server version (has `id` + `notes`)
5. Saves merged result to localStorage

**Auto-retry:** Registers `online` event listener to flush when connectivity returns. `initSyncService()` called once in LogsProvider useEffect.

## Subway Data

Static JSON files in `frontend/src/data/`:
- `stations.json` (~5800 lines) — all NYC subway stations with `stop_id`, `stop_name`, lat/lng, direction labels, `routes[]`, `children[]`
- `routes.json` (~1200 lines) — all NYC subway lines with `id`, `shortName`, `color`, `textColor`, `stops[]` (ordered sequence)

Updated via `npm run fetch-stops --workspace=frontend`.

## Authentication Flow

1. Register/login sends credentials to `/api/auth/register` or `/api/auth/login`
2. Backend validates, hashes password (bcrypt, 12 rounds), signs JWT with `{ userId, username }`
3. Frontend stores token + user in localStorage
4. All API requests include `Authorization: Bearer <token>` via `apiFetch()`
5. JWT expiration configured via `JWT_EXPIRES_IN` env var (e.g., "365d")
6. Logout clears localStorage (token, user, sync queue) — no server-side session

**Security:** Login always runs `bcrypt.compare` even for nonexistent users (timing-attack safe, prevents user enumeration).

## Social Features

**Shared cars detection:** `GET /api/logs/shared-cars` self-joins `carsTable` to find entries where the same car number was logged by different users. Left-joins `notificationsTable` to include `notified` boolean.

**Notification flow:** FriendsPage detects unnotified shared cars → queues explosion animations → POSTs to `/api/notifications` to mark as seen. Unique constraint prevents duplicate notifications.

## PWA & Deployment

### PWA (`frontend/vite.config.ts`)

Vite PWA plugin with `registerType: "autoUpdate"`, workbox caching of `**/*.{js,css,html,ico,png,svg,woff,woff2}`, standalone display mode.

### Frontend Deployment — GitHub Pages

`.github/workflows/deploy.yml`: On push to master or manual dispatch, builds frontend with `VITE_API_URL` secret, deploys `dist/` to `gh-pages` branch via JamesIves action. Uses Node 25.

### Backend Deployment — Railway

`railway.toml`: Nixpacks builder, builds backend workspace, runs `db:migrate` then starts Express server on deploy. Restarts on failure (max 10 retries).

## Shared Types (`shared/types.ts`)

```typescript
interface TrainLogEntry {
  id?: number;          // DB id (set by server)
  timestamp: number;    // Epoch milliseconds
  car: string;          // 4-digit car number
  line: string;         // Subway line (e.g., "1", "A", "G")
  notes?: string;
  origin?: string;      // Station stop_id
  destination?: string; // Station stop_id
}

interface StationPair {
  origin: string;       // Station stop_id
  destination: string;  // Station stop_id
  count: number;        // Frequency
}
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/src/index.ts` | Express app setup, route mounting |
| `backend/src/config.ts` | Env var validation |
| `backend/src/db/schema.ts` | Drizzle schema (users, cars, notifications tables) |
| `backend/src/db/client.ts` | Drizzle + pg pool instance |
| `backend/src/middleware/auth.ts` | JWT verification middleware |
| `backend/src/routes/auth.ts` | Register, login endpoints |
| `backend/src/routes/logs.ts` | Car log CRUD, station-pairs, shared-cars |
| `backend/src/routes/notification.ts` | Notification creation endpoint |
| `backend/drizzle.config.ts` | Drizzle migration config |
| `frontend/src/main.tsx` | React entry point, provider nesting |
| `frontend/src/App.tsx` | Route definitions |
| `frontend/src/auth/auth-context.tsx` | Auth state provider |
| `frontend/src/storage/logs-context.tsx` | Logs state provider |
| `frontend/src/storage/sync-service.ts` | Offline sync queue + bidirectional merge |
| `frontend/src/storage/local-storage.ts` | localStorage helpers and keys |
| `frontend/src/api/client.ts` | API fetch wrapper + endpoint functions |
| `frontend/src/pages/EntryFlow.tsx` | Car entry state machine (3 steps) |
| `frontend/src/pages/HistoryPage.tsx` | History list, stats, leaderboard |
| `frontend/src/pages/FriendsPage.tsx` | Shared cars + notification animations |
| `frontend/src/utils/subway.ts` | Station/route lookup helpers |
| `frontend/src/utils/stats.ts` | Stats calculation |
| `frontend/src/data/stations.json` | NYC subway station data |
| `frontend/src/data/routes.json` | NYC subway route/line data |
| `frontend/vite.config.ts` | Vite + PWA configuration |
| `shared/types.ts` | TrainLogEntry, StationPair interfaces |
| `railway.toml` | Backend deployment config |
| `.github/workflows/deploy.yml` | Frontend CI/CD to GitHub Pages |
