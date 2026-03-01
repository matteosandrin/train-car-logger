# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Train Car Logger is an npm workspaces monorepo (frontend, backend, shared) for tracking NYC subway train cars. See `README.md` for standard dev commands (`npm install`, `npm run dev`, `npm run build`, `npm run format`).

### Services

| Service | Port | Run command |
|---------|------|-------------|
| PostgreSQL 16 | 5432 | `sudo pg_ctlcluster 16 main start` |
| Backend (Express + tsx watch) | 3000 | `npm run dev --workspace=backend` |
| Frontend (Vite) | 5173 | `npm run dev --workspace=frontend` |

### Startup order

1. Start PostgreSQL: `sudo pg_ctlcluster 16 main start`
2. Run migrations (if needed): `npm run db:migrate --workspace=backend`
3. Start backend: `npm run dev --workspace=backend` (background)
4. Start frontend: `npm run dev --workspace=frontend` (background)

### Environment files (not committed)

- `backend/.env` — requires `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `PORT`. See `backend/.env.example`.
- `frontend/.env` — optional `VITE_API_URL` (omit for offline-only mode). See `frontend/.env.example`.

### Gotchas

- The frontend works in offline-only mode without a backend. If `VITE_API_URL` is unset, auth/sync/friends features are unavailable but car logging still works via localStorage.
- The `format` script in frontend uses `--write` by default (`npx prettier . --write`). To check without modifying, run `npx prettier . --check` directly in the `frontend/` directory.
- Backend API routes are mounted under `/api` (e.g., `/api/auth/register`, `/api/auth/login`).
- Database user/password used locally: `trainuser`/`trainpass`, database: `train_car_logger`.
- Backend's `config.ts` will throw at startup if any required env vars (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`) are missing.
