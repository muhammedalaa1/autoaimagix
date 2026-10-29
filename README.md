# Autoaimagix Notes

A small full-stack SaaS-style app built for the Autoaimagix Web Developer technical task. It covers **authentication**, **role-based authorization**, **secure data access**, and **integrating an external API**.

| | |
| --- | --- |
| **Backend** | Express 5 · TypeScript · Zod · Drizzle ORM · Neon Postgres · JWT (httpOnly cookie) · bcrypt · express-rate-limit · helmet |
| **Frontend** | Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · TanStack Query · react-hook-form + Zod |
| **External API** | [WeatherAPI.com](https://www.weatherapi.com) (current weather) |

## Features

- **Sign up / log in / log out** with JWT stored in an **httpOnly cookie** and passwords **hashed with bcrypt**.
- **Two roles: `user` and `admin`.** Registration always creates a `user`. Admins are created only by a seed script.
- **Notes CRUD.** A user can see, create, edit and delete **only their own** notes. An admin can **see every note**, with its author.
- **Weather endpoint.** It proxies WeatherAPI.com for **logged-in users only**, and the API key lives in environment variables only.
- **Rate limiting.** Login allows 5 failed attempts per 15 min per IP. Registration and the whole API are also limited.
- **Validation everywhere** with Zod, clear error messages and correct HTTP status codes.
- **Admin users page** listing every account with its note count. It is admin-only on both server and client.

## Repository structure

```
.
├── backend/     Express REST API  → see backend/README.md for full API reference
│   ├── src/
│   │   ├── config/        env validation
│   │   ├── db/            Drizzle schema, client, admin seed
│   │   ├── middlewares/   authenticate, authorize, rate-limit, verify-origin, error-handler
│   │   ├── modules/       auth · notes · users · weather (routes → controller → service → schema)
│   │   └── utils/         AppError, jwt, password, auth cookie
│   └── drizzle/           SQL migrations
└── frontend/    Next.js app       → see frontend/README.md
    └── src/
        ├── app/           (auth) login/register · (app) notes, weather, admin/users
        ├── components/    feature components + shadcn/ui
        ├── hooks/         TanStack Query hooks
        ├── lib/           API client, session (server), validations, helpers
        └── proxy.ts       route guard
```

## Getting started

**Requirements:**
- Node.js 20+
- A [Neon](https://neon.tech) Postgres database (free tier is fine)
- A [WeatherAPI.com](https://www.weatherapi.com) API key (free)

### 1. Backend (http://localhost:4000)

```bash
cd backend
npm install
cp .env.example .env     # fill in DATABASE_URL, JWT_SECRET, WEATHER_API_KEY, ADMIN_*
npm run db:migrate       # create tables
npm run db:seed          # create the admin account from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev
```

Generate a strong `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. Frontend (http://localhost:3000)

```bash
cd frontend
npm install
cp .env.example .env     # BACKEND_URL=http://localhost:4000
npm run dev
```

Open **http://localhost:3000**. Use `localhost`, not `127.0.0.1`, because the API only accepts origins listed in `CORS_ORIGINS`. Register a normal user, or log in with the seeded admin to see every note and the Users page.

### Environment variables

Every variable is documented in [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example). **No secret is hard-coded.** The backend validates its environment with Zod at startup and refuses to boot if anything is missing. `.env` files are gitignored.

## How it fits together

```
Browser ──► Next.js (localhost:3000) ──/api/* rewrite──► Express API (localhost:4000) ──► Neon Postgres
                │                                              └──► WeatherAPI.com
                └─ server components call /api/auth/me with the user's cookie
```

The browser only ever talks to the Next.js origin, and Next forwards `/api/*` to Express. That makes the auth cookie **first-party**: there's no cross-site cookie or CORS setup, and it works the same in production.

## Security

These are the evaluation questions from the task, and how the code answers them.

### Can a user reach another user's data or admin privileges?

**No.** Several independent layers enforce this.

- **Identity comes from the session only.** `authenticate` verifies the JWT from the httpOnly cookie, then loads the user from the database. The role comes from the DB on every request, never from the token or the request. A deleted or demoted user loses access immediately.
- **Ownership is enforced inside SQL.** Update and delete run `WHERE id = :noteId AND user_id = :currentUserId`. There's no fetch-then-check, so there's no race. A note that belongs to someone else returns **404** (not 403), so IDs can't be probed.
- **The note owner is never taken from the body.** `user_id` on create always comes from the session, and request schemas are `.strict()`, so unknown fields are rejected.
- **No privilege escalation.** Sending `"role": "admin"` to register returns a 400, and the service hard-codes `role: "user"`. Admins can only be created by `npm run db:seed`.
- **Admin routes** use `authorize("admin")` on the API. The frontend also checks the role server-side before rendering the admin page, and hides admin UI from users. That's UX only: the API is the real gate.

### Are any secrets in the code?

**No.**
- The database URL, JWT secret and weather API key live only in `.env`, which is gitignored.
- The weather key is attached server-side and never reaches the browser, and upstream error details aren't forwarded.

### Other hardening

| Concern | Mitigation |
| --- | --- |
| Password storage | bcrypt, cost 12. Max 72 chars, which is bcrypt's limit. |
| User enumeration | Same error message for an unknown email and a wrong password, plus a dummy bcrypt compare so response timing matches. |
| Token theft via XSS | JWT lives in an `httpOnly` cookie (`Secure` in production) and JavaScript can't read it. |
| JWT forgery | HS256 with the algorithm pinned on verify, which rejects `alg: none` and algorithm confusion. The secret must be ≥ 32 chars. |
| CSRF | `SameSite` cookie, plus an `Origin` allowlist check on every state-changing request. |
| Brute force | Login: 5 failed attempts / 15 min per IP. Register: 10 / hour. Whole API: 100 / min. |
| Bad input | Zod validates every body, param and query (UUID ids, length caps). 100 kb JSON limit. Malformed JSON returns 400. |
| Leaking internals | Errors go through a central handler with a consistent `{ error: { code, message, details? } }` shape. DB and stack details are logged only, never returned. |
| Open redirect | The post-login `?next=` only accepts paths on this site, not `//evil.com` or absolute URLs. |
| Headers | `helmet`, and `x-powered-by` is disabled. |

### Status codes

`400` validation · `401` not authenticated / bad credentials · `403` wrong role or origin · `404` not found · `409` email taken · `429` rate limited · `502` / `504` weather service error / timeout · `500` unexpected

## API overview

All routes are under `/api`. See [backend/README.md](backend/README.md) for request and response details.

| Method | Route | Access |
| --- | --- | --- |
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | public (login is rate limited) |
| GET | `/auth/me` | logged in |
| GET / POST | `/notes` | logged in (admin `GET` sees all) |
| GET / PATCH / DELETE | `/notes/:id` | owner (admin can also `GET`) |
| GET | `/weather?city=Cairo&units=metric` | logged in |
| GET | `/users` | admin |

## Scripts

| | Backend | Frontend |
| --- | --- | --- |
| Dev server | `npm run dev` | `npm run dev` |
| Production | `npm run build && npm start` | `npm run build && npm start` |
| Type check / lint | `npm run typecheck` | `npx tsc --noEmit` · `npm run lint` |
| Database | `db:generate` · `db:migrate` · `db:seed` · `db:studio` | — |
