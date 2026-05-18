# Solara Yoga — Setup & Integration Guide

Everything you need to run the stack locally, configure third-party services, and register webhooks.

---

## 1. Environment Variables

Create a `.env` file at the **repo root** (`fastify-backend/.env`). Both the backend and frontend pick it up from there.

### Backend (`apps/backend`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | no (default `8080`) | HTTP listen port |
| `DATABASE_URL` | **yes** | Postgres connection string |
| `DATABASE_DRIVER` | no (default: `pg` in dev, `neon` in prod) | `pg` or `neon` |
| `BETTER_AUTH_SECRET` | **yes** | Random 256-bit secret for session signing |
| `BETTER_AUTH_URL` | no (default: localhost) | Full backend base URL, e.g. `https://api.example.com` |
| `FRONTEND_URL` | no | Frontend origin for CORS, e.g. `https://app.example.com` |
| `GOOGLE_CLIENT_ID` | no | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | no | Google OAuth client secret |
| `HMS_APP_ACCESS_KEY` | yes (for video) | 100ms dashboard → Developer → App access key |
| `HMS_APP_SECRET` | yes (for video) | 100ms dashboard → Developer → App secret |
| `HMS_TEMPLATE_ID_GROUP` | yes (for video) | 100ms template ID for group sessions |
| `HMS_TEMPLATE_ID_PRIVATE` | yes (for video) | 100ms template ID for private 1:1 sessions |
| `RAZORPAY_KEY_ID` | yes (for payments) | Razorpay dashboard → Settings → API keys |
| `RAZORPAY_KEY_SECRET` | yes (for payments) | Razorpay dashboard → Settings → API keys |
| `RAZORPAY_WEBHOOK_SECRET` | yes (for payments) | Razorpay dashboard → Webhooks → your webhook secret |
| `RESEND_API_KEY` | yes (for email) | resend.com API key |
| `EMAIL_FROM` | yes (for email) | Verified sender address, e.g. `noreply@example.com` |

### Frontend (`apps/yoga-app`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | no (default: `http://localhost:8080`) | Backend base URL |
| `VITE_HMS_SUBDOMAIN` | yes (for video) | 100ms prebuilt subdomain, e.g. `yoga.app.100ms.live` |

---

## 2. Database

### Migrations

```bash
# Generate Drizzle migrations from the current schema
pnpm --filter @yoga-app/backend db:generate

# Apply auto-generated migration
pnpm --filter @yoga-app/backend db:migrate

# Then manually apply the supplementary migration (partial indexes, circular FK, seed plans)
psql "$DATABASE_URL" -f apps/backend/src/migrations/0001_yoga_session_pool.sql
```

### pg_cron (weekly quota reset)

Install `pg_cron` in your Postgres instance, then uncomment the `cron.schedule(...)` block at the bottom of `0001_yoga_session_pool.sql` and run it. The job resets `sessions_used_this_week = 0` every Monday at 00:05 UTC for users on limited plans.

---

## 3. 100ms — Video Setup

1. Create an account at [100ms.live](https://dashboard.100ms.live).
2. Create **two templates**:
   - `Group Session` — roles: `host` (instructor) + `guest` (user), max 20 participants.
   - `Private 1:1` — roles: `host` + `guest`, max 2 participants.
3. Copy each template's ID into `HMS_TEMPLATE_ID_GROUP` / `HMS_TEMPLATE_ID_PRIVATE`.
4. Copy **App Access Key** and **App Secret** from Developer settings.
5. Set `VITE_HMS_SUBDOMAIN` to the subdomain shown on your prebuilt link, e.g. `yoga.app.100ms.live`.

The backend creates a room + fetches a guest **room code** on every join. The frontend embeds the 100ms hosted prebuilt at:
```
https://<VITE_HMS_SUBDOMAIN>/meeting/<roomCode>
```

---

## 4. Razorpay — Payments Setup

### API keys

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings → API Keys** → Generate key pair.
3. Copy `key_id` → `RAZORPAY_KEY_ID`, `key_secret` → `RAZORPAY_KEY_SECRET`.

> Amounts are in **USD cents** (`$33.00` = `3300`). Make sure your Razorpay account has international / USD payments enabled if you're outside India.

### Webhook registration

1. Go to **Settings → Webhooks → Add New Webhook**.
2. Set the **Webhook URL** to:
   ```
   https://<your-api-domain>/webhooks/razorpay
   ```
3. Set a **Secret** (any strong random string) → copy it to `RAZORPAY_WEBHOOK_SECRET`.
4. Enable these events:
   - ✅ `payment.captured`
   - ✅ `order.paid`
   - ✅ `payment.failed`
5. Click **Save**.

#### How the payment flow works

```
Frontend                        Backend                         Razorpay
   │                               │                               │
   │── POST /payments/orders ──────▶│                               │
   │                               │── create order ──────────────▶│
   │◀─ { orderId, keyId, amount } ──│◀─ { id, amount, currency } ───│
   │                               │                               │
   │── open Razorpay checkout ─────────────────────────────────────▶│
   │◀─ { payment_id, order_id, signature } ────────────────────────│
   │                               │                               │
   │── POST /payments/verify ──────▶│                               │
   │                               │ verify HMAC (key_secret)      │
   │                               │ UPDATE user.plan_id           │
   │◀─ { success: true } ───────────│                               │
   │                               │                               │
   │                               │◀── POST /webhooks/razorpay ───│ (async)
   │                               │ verify HMAC (webhook_secret)  │
   │                               │ UPDATE user.plan_id (idempotent)│
```

The webhook acts as a **safety net** — if the client-side verify call is lost (tab closed, network drop), the webhook still activates the plan.

---

## 5. Resend — Email Setup

1. Sign up at [resend.com](https://resend.com) and verify your sending domain.
2. Create an API key → `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to a verified address on that domain.

Emails sent automatically:
- **Student** receives a session confirmation with instructor name, session type, and start time in their local timezone.
- **Instructor** receives a participant notification with student name and session start in IST.

---

## 6. API Endpoints Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | public | Register user/instructor |
| `POST` | `/auth/login` | public | Login |
| `POST` | `/auth/logout` | cookie | Logout |
| `GET` | `/auth/session` | cookie | Get current session |
| `GET` | `/auth/google` | public | Start Google OAuth |

### Rooms
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/rooms/group/upcoming` | cookie | Upcoming group sessions (localised times) |
| `POST` | `/rooms/:id/join` | cookie + `user` role | Join a group room |
| `POST` | `/rooms/:id/leave` | cookie | Leave a room |
| `POST` | `/rooms/private/book` | cookie + `user` role | Book a private session |

### Instructors
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/instructors` | cookie | List instructors (`?status=&specialty=`) |
| `GET` | `/instructor/schedule` | cookie + `instructor` role | Own upcoming schedule (IST) |

### Plans
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/plans` | public | List all plans with pricing |
| `GET` | `/plans/me` | cookie | Current user's plan + weekly quota |

### Payments
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/payments/orders` | cookie | Create Razorpay order for a plan |
| `POST` | `/payments/verify` | cookie | Verify payment signature + activate plan |

### Webhooks
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/webhooks/100ms` | none (TODO: HMAC) | 100ms session lifecycle events |
| `POST` | `/webhooks/razorpay` | HMAC signature | Razorpay payment events |

### Misc
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | public | Health check |
| `GET` | `/docs` | public | Swagger UI |

---

## 7. Frontend Routes

| Path | Role | Description |
|---|---|---|
| `/` | public | Landing page |
| `/login` | public | Auth (login + register) |
| `/pricing` | public | Static pricing overview |
| `/experts` | public | Instructor listing |
| `/experts/:id` | public | Instructor detail |
| `/dashboard` | `user` | User dashboard — upcoming rooms, plan status |
| `/rooms` | `user` | Browse & join upcoming group sessions |
| `/billing` | `user` | Plan picker with Razorpay checkout |
| `/session/:roomId` | any authed | Live 100ms video session (iframe) |
| `/instructor/dashboard` | `instructor` | Instructor schedule (IST), live stats |

---

## 8. Local Dev

```bash
# Install dependencies
pnpm install

# Build shared types (required before first run)
pnpm --filter @yoga-app/shared build

# Start backend (tsx watch, hot reload)
pnpm dev:backend

# Start frontend (Vite, port 3000)
pnpm dev:web

# Or start everything in parallel
pnpm dev
```

Swagger docs are available at `http://localhost:8080/docs` once the backend is running.

---

## 9. Files Added / Changed (this sprint)

### Backend
```
src/
  constants/sessions.ts               ← enum value arrays (instructor_status, room_type, …)
  models/
    plans.ts                          ← plans table
    rooms.ts                          ← rooms table + pg enums
    instructor-details.ts             ← instructor_details 1:1 table
    room-users.ts                     ← room_users + booking_status enum
    session-quota-log.ts              ← weekly quota log
    auth.schema.ts                    ← extended user table (plan_id, timezone, quota cols)
  schema/schema.ts                    ← re-exports all models
  migrations/
    0001_yoga_session_pool.sql        ← manual migration (circular FK, partial indexes, seeds)
  services/
    timezone.service.ts               ← formatForUser / formatForInstructor
    hms.service.ts                    ← createHmsRoom (+ room codes) / generateClientToken
    quota.service.ts                  ← quota snapshot helper
    session-pool.service.ts           ← joinRoom / leaveRoom / bookPrivateSession (atomic txns)
    instructor-fallback.service.ts    ← findSubstitute / swapInstructor
    razorpay.service.ts               ← Razorpay singleton + signature verifiers
    booking-email.service.ts          ← confirmation email to student + instructor
  controllers/
    rooms/rooms.controller.ts         ← GET/POST rooms endpoints
    instructors/instructors.controller.ts
    plans/plans.controller.ts
    payments/payments.controller.ts   ← Razorpay order + verify
    webhooks/hms.webhook.controller.ts
    webhooks/razorpay.webhook.controller.ts ← raw body capture + HMAC verify
  validation/
    rooms.validation.schema.ts
    instructors.validation.schema.ts
  types/fastify.d.ts                  ← rawBody?: Buffer added
```

### Frontend
```
src/
  constants/
    endpoints.ts                      ← re-exports from @yoga-app/shared
    sessions.ts                       ← INSTRUCTOR_IANA / INSTRUCTOR_TIMEZONE_LABEL
  lib/
    timezone.ts                       ← formatCompact / relativeFromNow / userTimezone
    razorpay.ts                       ← lazy script loader + promisified checkout
    hms.ts                            ← hmsPrebuiltUrl helper
  api/
    rooms.ts / instructors.ts / plans.ts / payments.ts
  hooks/
    use-rooms.ts / use-instructors.ts / use-plans.ts / use-checkout.ts
  components/
    dashboard/
      StatCard.tsx                    ← shared stat tile (user + instructor)
      NextFlowCard.tsx                ← user's "next flow" hero card
      PlanCard.tsx                    ← gradient plan / upgrade card
      UpcomingSessionList.tsx         ← scrollable session list
    instructor/
      NextClassCard.tsx               ← instructor's next class hero
      ScheduleList.tsx                ← full schedule with rejoin buttons
    rooms/
      RoomCard.tsx                    ← upcoming room card with join button
  routes/
    _user/dashboard.tsx               ← composed from components, real API data
    _user/rooms.tsx                   ← browse + join sessions
    _user/billing.tsx                 ← plan picker + Razorpay flow
    instructor/route.tsx              ← role guard (instructor only)
    instructor/dashboard.tsx          ← composed from components, IST schedule
    session.$roomId.tsx               ← 100ms prebuilt iframe, leave button
```

### Shared (`packages/shared`)
```
src/
  endpoints.ts   ← API_ENDPOINTS const
  rooms.ts       ← UpcomingRoom, JoinRoomResult, … types
  instructors.ts ← InstructorListItem type
  plans.ts       ← PlanRecord type
  payments.ts    ← CreateOrderBody, VerifyPaymentBody (Zod) + result types
```
