# Autoaimagix — Backend API

Express 5 + TypeScript REST API with cookie-based JWT auth, `user` / `admin` roles, notes CRUD, and an authenticated weather proxy.

**Stack:** Express 5 · TypeScript · Zod 4 · Drizzle ORM · Neon Postgres · WeatherAPI.com · bcrypt · jsonwebtoken · express-rate-limit · helmet

## Getting started

```bash
cd backend
npm install
cp .env.example .env        # then fill in DATABASE_URL, JWT_SECRET, WEATHER_API_KEY
npm run db:migrate          # create tables on Neon
npm run db:seed             # create the admin account from ADMIN_* vars
npm run dev                 # http://localhost:4000
```

Production: `npm run build && npm start`.

### Environment variables

See [`.env.example`](./.env.example). All variables are validated with Zod at startup. If any are missing or invalid, the server refuses to boot, and no secret has a hard-coded fallback.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `JWT_SECRET` | ≥ 32 chars random string |
| `JWT_EXPIRES_IN_SECONDS` | Token + cookie lifetime (default `86400`) |
| `COOKIE_SAME_SITE` | `lax` (same site) or `none` (cross-domain, HTTPS only) |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `WEATHER_API_KEY` | Key for [WeatherAPI.com](https://www.weatherapi.com) |
| `TRUST_PROXY` | Number of reverse proxies (for correct client IP in rate limits) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Used only by `npm run db:seed` |

### Scripts

| Script | Purpose |
| --- | --- |
| `dev` | Run with hot reload (tsx) |
| `build` / `start` | Compile to `dist/` and run |
| `typecheck` | `tsc --noEmit` |
| `db:generate` | Generate SQL migration from `src/db/schema.ts` |
| `db:migrate` | Apply migrations in `drizzle/` |
| `db:seed` | Create/promote the admin user |
| `db:studio` | Open Drizzle Studio |

## Project structure

```
src/
├── config/env.ts            # Zod-validated environment
├── db/                      # Drizzle client, schema, admin seed
├── middlewares/             # authenticate, authorize, rate-limit, verify-origin, error-handler
├── modules/
│   ├── auth/                # register, login, logout, me
│   ├── notes/               # notes CRUD with ownership rules
│   ├── users/               # admin-only user listing
│   └── weather/             # external API proxy
│       └── *.routes.ts → *.controller.ts → *.service.ts  (+ *.schema.ts for Zod)
├── utils/                   # AppError, jwt, password hashing, auth cookie
├── routes.ts                # mounts all module routers under /api
├── app.ts                   # Express app factory
└── server.ts                # entry point
```

Each module has the same layers. **Routes** wire up middleware, **controllers** validate input with Zod and shape the HTTP response, and **services** hold business logic and DB access.

## API

Base URL: `/api`. Successful responses are `{ "data": ... }`. Errors are `{ "error": { "code", "message", "details?" } }`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | — | Health check |
| POST | `/auth/register` | — | `{ name, email, password }` → 201, sets cookie |
| POST | `/auth/login` | — | `{ email, password }` → 200, sets cookie. **Rate limited** |
| POST | `/auth/logout` | — | Clears cookie → 204 |
| GET | `/auth/me` | user | Current user |
| GET | `/notes?page=1&limit=20` | user | Own notes (admin: **all** notes, with author) |
| POST | `/notes` | user | `{ title, content? }` → 201 |
| GET | `/notes/:id` | user | Own note (admin: any note) |
| PATCH | `/notes/:id` | user | `{ title?, content? }`. Owner only |
| DELETE | `/notes/:id` | user | Owner only → 204 |
| GET | `/users` | admin | All users with note counts |
| GET | `/weather?city=Cairo&units=metric` | user | Current weather from WeatherAPI.com |

### Status codes

`400` validation / malformed JSON · `401` not logged in / bad credentials / expired session · `403` wrong role or disallowed origin · `404` not found (including other users' notes) · `409` email already registered · `429` rate limited · `502/504` weather service failure / timeout · `500` unexpected error (no internals leaked)

## Security design

- **Passwords** are hashed with bcrypt (cost 12). Login checks against a dummy hash when the email is unknown, so response time doesn't reveal which emails exist, and both cases return the same error message.
- **JWT in an httpOnly cookie**, so page JavaScript can't read the token (XSS can't steal it). The cookie is `Secure` in production and `SameSite` is configurable. The token is signed with HS256, and verification pins the algorithm to reject `alg: none` and algorithm-confusion tokens.
- **The role comes from the database, not the token.** `authenticate` loads the user on every request, so a deleted or demoted user loses access immediately.
- **No self-assigned admin.** The register schema is `.strict()`, so a `role` field is rejected with 400, and the service hard-codes `role: "user"`. Admins are created only through `db:seed`.
- **Ownership is enforced in SQL.** Update and delete use `WHERE id = :id AND user_id = :currentUser`, so there is no fetch-then-check race. A note owned by someone else returns 404 (not 403), so note IDs can't be probed. `user_id` always comes from the session, never from the request body.
- **CSRF:** besides `SameSite`, `verify-origin` rejects state-changing requests whose `Origin` header isn't in `CORS_ORIGINS`.
- **Rate limiting** (express-rate-limit):
  - Login: 5 failed attempts per 15 min per IP. Successful logins don't count.
  - Register: 10 per hour.
  - Whole API: 100 requests per minute.
- **Input validation:** every body, param and query string goes through Zod, IDs must be UUIDs, field lengths are capped, and the JSON body limit is 100 kb.
- **Secrets** live only in env vars. The weather API key is added server-side and never reaches the client, and upstream error details aren't forwarded.
- `helmet` security headers, `x-powered-by` disabled, and DB errors are logged but never returned to the client.
