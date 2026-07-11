# Yoga App Monorepo

This repo is now a `pnpm` + Turborepo workspace with:

- `apps/backend`: the existing Fastify API
- `apps/yoga-app`: a TanStack Start frontend
- `packages/shared`: shared schemas, response types, roles, and app constants

## Run

```bash
pnpm install
pnpm dev
```

Useful filtered commands:

```bash
pnpm dev:backend
pnpm dev:web
pnpm --filter @yoga-app/backend db:generate
pnpm typecheck
pnpm build
```

## Shared code

`packages/shared` currently owns:

- auth Zod schemas used by frontend and backend
- API response types
- shared role and app constants

## Env

The repo keeps using the root `.env` file. The backend and frontend both read from it.

Important keys:

```bash
PORT=8080
FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/social_sync_dev
BETTER_AUTH_SECRET=your-secret-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:8080

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Video (100ms)
HMS_APP_ACCESS_KEY=
HMS_APP_SECRET=
HMS_TEMPLATE_ID_GROUP=
HMS_TEMPLATE_ID_PRIVATE=
HMS_WEBHOOK_SECRET=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=
```

See [SETUP.md](./SETUP.md) for full configuration details including webhook registration for Razorpay and 100ms.
