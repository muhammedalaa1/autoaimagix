# Autoaimagix Notes — Frontend

Next.js 16 (App Router, Cache Components) client for the [backend API](../backend/README.md).

**Stack:** React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · TanStack Query · react-hook-form + Zod · next-themes

## Getting started

```bash
npm install
cp .env.example .env    # BACKEND_URL=http://localhost:4000
npm run dev             # http://localhost:3000  (the backend must be running)
```

## Structure

```
src/
├── proxy.ts                 # route guard: no session cookie → /login?next=…
├── app/
│   ├── (auth)/              # /login, /register (public)
│   └── (app)/               # authenticated shell: /notes, /weather, /admin/users
├── components/
│   ├── auth/ notes/ weather/ admin/ layout/ forms/
│   └── ui/                  # shadcn/ui primitives
├── hooks/use-notes.ts       # TanStack Query hooks + cache invalidation
└── lib/
    ├── api/                 # typed fetch client, endpoints, response types
    ├── auth/session.ts      # server-only: resolves the current user via /api/auth/me
    ├── auth/user-context.tsx
    ├── validations/         # Zod schemas mirroring the backend
    └── safe-redirect.ts     # open-redirect protection for ?next=
```

## How auth works

1. **One origin.** `next.config.ts` rewrites `/api/*` to `BACKEND_URL`. The browser only talks to this app, so the backend's httpOnly cookie is first-party and JavaScript never sees the token.
2. **Optimistic guard.** `src/proxy.ts` redirects to `/login` when there's no session cookie, before anything renders.
3. **Real check on the server.** The `(app)` layout calls `requireUser()`, which forwards the cookie to `/api/auth/me`. An invalid or expired session redirects to `/login`. Because of Cache Components, this runs inside a `<Suspense>` boundary, and the page shell is prerendered.
4. **Admin page.** It is gated server-side (`notFound()` for non-admins) and by the API (`403`). Hidden buttons and links are UX only, never the security boundary.
5. **Session expiry while using the app.** Any `401` from a query or mutation sends the user to `/login?next=<current page>`.

Validation errors from the API (`details[].field`) are shown under the matching form input, and other errors appear as a form-level message or a toast.
