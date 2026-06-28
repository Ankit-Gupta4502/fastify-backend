# Payments Flow

This document explains how `PaymentsController` handles checkout for **session-based custom plans** and **recurring standard plans**, including India (INR) vs international (USD) pricing.

Source: `apps/backend/src/controllers/payments/payments.controller.ts`

**All checkout flows use Razorpay Subscriptions** — there are no one-time Razorpay Orders.

---

## Terminology

| Layer | What it is |
|-------|------------|
| **Razorpay Plan** | Reusable billing template on Razorpay (`plans.create`) — amount + billing period |
| **Razorpay Subscription** | Per-user checkout object linked to a Razorpay Plan |
| **`user_subscriptions` row** | App's source of truth for plan ownership (`pending_payment` → `active`) |

---

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/payments/custom-order` | Session-pack subscription (private, prenatal, therapeutic) |
| `POST` | `/payments/orders` | Standard recurring plan (e.g. group live) |
| `POST` | `/payments/verify` | Client-side payment verification + activation |
| `POST` | `/webhooks/razorpay` | Async safety net |

All payment endpoints require cookie auth.

---

## Country detection (INR vs USD)

Both flows call `detectCountry(request, clientCountry)` in this priority order:

1. `cf-ipcountry` header (Cloudflare)
2. `x-country-code` header (nginx)
3. `country` field from the request body
4. `FORCE_COUNTRY` env var (dev/staging override)

India is selected when the resolved country is `"IN"`.

---

## Flow 1: Custom plan subscription (session-based, recurring)

**Endpoint:** `POST /payments/custom-order`

**Request body:**

```json
{
  "sessionCount": 8,
  "planName": "private",
  "country": "IN"
}
```

- `sessionCount`: 4–50
- `planName`: `"private"` | `"prenatal_postnatal"` | `"therapeutic_yoga"`

### Step-by-step

```
Frontend                    Backend                         Razorpay
   │                           │                               │
   │── POST /custom-order ────▶│                               │
   │                           │ 1. detectCountry → IN or not  │
   │                           │ 2. Load plan by name from DB  │
   │                           │ 3. Compute amount + currency  │
   │                           │ 4. Lazy-create Razorpay Plan  │
   │                           │    per (plan, sessions, curr) │
   │                           │──────────────────────────────▶│ plans.create
   │                           │ 5. subscriptions.create       │
   │                           │──────────────────────────────▶│
   │                           │ 6. INSERT user_subscriptions  │
   │                           │    sessionsTotal=sessionCount │
   │                           │    razorpaySubscriptionId     │
   │◀─ { subscriptionId, ... }─│                               │
   │                           │                               │
   │── Razorpay checkout (subscription_id) ───────────────────▶│
   │◀─ { payment_id, subscription_id, signature } ───────────│
   │                           │                               │
   │── POST /payments/verify ─▶│ verify subscription signature │
   │                           │ UPDATE status → active        │
   │◀─ { success: true } ──────│                               │
```

### Pricing: India vs others

| Region | Condition | Formula | Currency |
|--------|-----------|---------|----------|
| India | `pricePerSessionInrPaise` set on plan | `sessions × rate − ₹100` | INR |
| Non-India | always | `sessions × $20 − $1` | USD |
| India fallback | no INR rate on plan | same USD formula | USD |

### Razorpay Plan caching (custom plans)

Custom plans have variable pricing by session count. Razorpay Plan IDs are cached in `session_plan_razorpay_plans` — one row per `(plan_id, session_count, currency)`.

Plan name on Razorpay: `"private — 8 sessions/mo"` (example).

### What gets persisted

```ts
await drizzle.insert(userSubscriptions).values({
  userId: me.id,
  planId: plan.id,
  sessionsTotal: sessionCount,       // session quota per billing period
  sessionsUsed: 0,
  pricePaidCents: amount,
  status: "pending_payment",
  razorpaySubscriptionId: rpSub.id,
});
```

### Billing period behaviour

- Charged monthly (or weekly if plan's `billing_interval` is `week`).
- `expiresAt` marks the end of the current billing period (from Razorpay `current_end` via webhook).
- On **renewal** (`subscription.charged`, `paid_count > 1`): `sessionsUsed` resets to `0`, `expiresAt` extended.
- User must have remaining sessions **and** a non-expired billing period to book.

---

## Flow 2: Standard recurring subscription

**Endpoint:** `POST /payments/orders`

**Request body:**

```json
{
  "planId": "<uuid>",
  "country": "IN"
}
```

Same subscription flow as custom plans, but:

- Fixed price from `plans.price_inr_paise` (IN) or `plans.price_cents` (others)
- Razorpay Plan cached on `plans.razorpay_plan_id_inr` / `plans.razorpay_plan_id_usd`
- `sessionsTotal: null` — no session pool; quota enforced via weekly limits on `user`

---

## Verify endpoint

`POST /payments/verify` — subscription-only:

```json
{
  "razorpaySubscriptionId": "...",
  "razorpayPaymentId": "...",
  "razorpaySignature": "..."
}
```

Signature: `HMAC-SHA256(paymentId|subscriptionId, key_secret)`.

Sets `status: active`, stores payment ID, sets initial `expiresAt` (~1 week or ~1 month). Webhook `subscription.charged` later updates `expiresAt` with Razorpay's authoritative `current_end`.

---

## Webhook safety net

| Event | Action |
|-------|--------|
| `subscription.charged` (1st) | Activate pending subscription |
| `subscription.charged` (2nd+) | Renew — extend `expiresAt`, reset `sessionsUsed` for session plans |
| `subscription.halted` | Mark expired |
| `subscription.cancelled` | Mark cancelled |
| `payment.captured` / `order.paid` | Legacy one-time orders only (pre-migration) |

---

## Frontend integration

Both hooks use `subscription_id` at Razorpay checkout:

| Hook | API |
|------|-----|
| `useCustomCheckout` | `POST /payments/custom-order` |
| `useCheckout` | `POST /payments/orders` |

For Indian subscriptions, UPI QR/collect flows are hidden so users set up UPI Autopay (mandate required for renewals).

---

## Database tables

### `plans`

Standard + session plan templates. Cached Razorpay Plan IDs for standard plans only.

### `session_plan_razorpay_plans`

Cached Razorpay Plan IDs for custom session subscriptions: `(plan_id, session_count, currency)`.

### `user_subscriptions`

- `sessionsTotal !== null` → session-pack subscription (custom plans)
- `sessionsTotal === null` → standard recurring plan
- Always uses `razorpay_subscription_id` for new purchases

---

## Quick reference

| | Custom plan (IN) | Custom plan (non-IN) | Standard (IN) | Standard (non-IN) |
|---|------------------|----------------------|---------------|-------------------|
| Razorpay Plan cache | `session_plan_razorpay_plans` | same | `plans.razorpay_plan_id_*` | same |
| Amount | sessions × INR rate − discount | sessions × USD rate − discount | `price_inr_paise` | `price_cents` |
| Razorpay Subscription | Per checkout | Per checkout | Per checkout | Per checkout |
| Session pool | Yes, resets on renewal | Yes | No | No |
| Auto-renewal | Yes | Yes | Yes | Yes |
