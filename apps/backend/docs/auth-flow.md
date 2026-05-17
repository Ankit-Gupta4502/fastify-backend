# Auth Flow

## What this backend is actually using

This project is using `better-auth` with **cookie-based session auth**.

The important implication for the frontend:

- Do **not** treat this as a JWT bearer-token flow.
- The browser should store the session cookie set by the backend.
- Every authenticated frontend request must include cookies.

The current code shows:

- CORS allows credentials and only the configured frontend origin.
- Auth routes call `better-auth` APIs and forward `Set-Cookie` headers back to the browser.
- Protected routes read the session from request headers/cookies using `auth.api.getSession(...)`.

## Relevant backend routes

### Custom routes exposed by this backend

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/session`
- `GET /auth/google`
- `GET /user/detail` protected

### Better Auth passthrough route

- `GET|POST /api/auth/*`

This route is the raw Better Auth handler. If you later use the Better Auth frontend client library, it will likely talk to `/api/auth/*`.

For now, the simplest frontend integration is the custom `/auth/*` routes above.

## End-to-end frontend flow

### 1. Register

Frontend sends:

```http
POST /auth/register
Content-Type: application/json
```

Body:

```json
{
  "name": "Ankit Gupta",
  "email": "ankit@example.com",
  "password": "strongpassword"
}
```

Frontend must send the request with credentials enabled:

```ts
await fetch("http://localhost:8080/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    name: "Ankit Gupta",
    email: "ankit@example.com",
    password: "strongpassword",
  }),
});
```

What happens on backend:

- Request body is validated.
- `better-auth` creates the user and session.
- Backend forwards `Set-Cookie` headers to the browser.
- Browser stores the session cookie.

Expected success response shape:

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {},
  "error": null
}
```

The exact `data` fields come from Better Auth and may include user/session-related values.

### 2. Login

Frontend sends:

```http
POST /auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "ankit@example.com",
  "password": "strongpassword",
  "rememberMe": true
}
```

Example:

```ts
await fetch("http://localhost:8080/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    email: "ankit@example.com",
    password: "strongpassword",
    rememberMe: true,
  }),
});
```

What happens on backend:

- Request body is validated.
- `better-auth` signs the user in.
- Backend forwards `Set-Cookie` headers.
- Browser stores or updates the session cookie.

Expected success response shape:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {},
  "error": null
}
```

### 3. Restore logged-in state on app load

When the frontend app starts, call:

```http
GET /auth/session
```

Example:

```ts
const res = await fetch("http://localhost:8080/auth/session", {
  credentials: "include",
});

const json = await res.json();
```

If logged in, response is:

```json
{
  "success": true,
  "message": "Session retrieved",
  "data": {
    "user": {},
    "session": {}
  },
  "error": null
}
```

If not logged in:

```json
{
  "success": false,
  "message": "Not authenticated",
  "data": null,
  "error": null
}
```

Frontend should use this endpoint to:

- detect whether the user is signed in
- get the current user/session state after refresh
- initialize auth state in React, Next.js, Vue, etc.

### 4. Call protected APIs

Protected route currently present:

- `GET /user/detail`

Example:

```ts
const res = await fetch("http://localhost:8080/user/detail", {
  credentials: "include",
});
```

What happens on backend:

- `AuthMiddleware` calls `auth.api.getSession(...)`
- Better Auth reads the session cookie from the request
- If valid, backend attaches `request.user` and `request.session`
- Controller returns the authenticated user

Success response:

```json
{
  "success": true,
  "message": "User details fetched successfully",
  "data": {
    "id": "user_id",
    "name": "Ankit Gupta",
    "email": "ankit@example.com",
    "role": "user",
    "emailVerified": false,
    "image": null,
    "createdAt": "2026-05-17T00:00:00.000Z",
    "updatedAt": "2026-05-17T00:00:00.000Z"
  },
  "error": null
}
```

If the cookie is missing or invalid:

```json
{
  "success": false,
  "message": "Unauthorized",
  "data": null,
  "error": null
}
```

### 5. Logout

Frontend sends:

```http
POST /auth/logout
```

Example:

```ts
await fetch("http://localhost:8080/auth/logout", {
  method: "POST",
  credentials: "include",
});
```

What happens on backend:

- Better Auth clears the session.
- Backend forwards the cookie-clearing `Set-Cookie` header.
- Browser removes the session cookie.

Response:

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "success": true
  },
  "error": null
}
```

## Google login flow

Frontend can start Google auth by redirecting the browser to:

```http
GET /auth/google?callbackURL=http://localhost:5173/auth/callback
```

Example:

```ts
window.location.href =
  "http://localhost:8080/auth/google?callbackURL=http://localhost:5173/auth/callback";
```

What happens:

- Backend asks Better Auth to start Google sign-in.
- Backend redirects the browser to Google.
- After Google auth completes, Better Auth finishes the auth flow through `/api/auth/*`.
- Session cookie gets created by backend.
- User is returned to the provided `callbackURL`.

After the frontend callback page loads, it should call:

- `GET /auth/session`

to confirm login and load the user state.

## Parameters the frontend needs to send

### `POST /auth/register`

Required JSON body:

```json
{
  "name": "string",
  "email": "valid email",
  "password": "minimum 8 chars"
}
```

### `POST /auth/login`

Required JSON body:

```json
{
  "email": "valid email",
  "password": "string"
}
```

Optional:

```json
{
  "rememberMe": true
}
```

### `GET /auth/google`

Optional query param:

```text
callbackURL=<frontend URL to return to after login>
```

### All authenticated requests

Frontend must send:

- `credentials: "include"` in `fetch`

Without that, browser cookies will not be sent, and `/auth/session` or `/user/detail` will behave as unauthenticated.

## What the frontend needs to do

### Minimum implementation

1. Keep backend base URL in frontend config, for example `http://localhost:8080`.
2. Use `credentials: "include"` on register, login, logout, session, and all protected API calls.
3. On app startup, call `GET /auth/session`.
4. If session exists, store `data.user` in frontend auth state.
5. If session does not exist, treat user as logged out.
6. Use `GET /user/detail` only for protected user data, again with credentials included.
7. For Google login, redirect browser to `/auth/google?callbackURL=...`.
8. After OAuth redirect returns to frontend, call `/auth/session` again.

### Recommended frontend auth state shape

Example:

```ts
type AuthState = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    image: string | null;
  } | null;
  session: unknown | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};
```

## Example API helper

```ts
const API_BASE_URL = "http://localhost:8080";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
```

## Backend setup that must be correct

For the frontend to work, these backend env vars matter:

- `FRONTEND_URL`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Meaning:

- `FRONTEND_URL` must exactly match the frontend origin allowed by CORS.
- `BETTER_AUTH_URL` should be the backend public base URL.
- Google credentials are required only for Google login.

Local example:

```env
PORT=8080
FRONTEND_URL=http://localhost:5173
BETTER_AUTH_URL=http://localhost:8080
BETTER_AUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Important notes

### 1. README is outdated about auth

The current code does **not** use the old JWT bearer approach described in parts of `README.md`.

The active implementation is:

- Better Auth
- session cookies
- cookie-based protected requests

### 2. Frontend should not manually store auth token

This backend is designed so the browser handles the auth cookie.

Frontend should not:

- read a JWT from login response
- save a token in localStorage
- attach `Authorization: Bearer ...` manually for normal auth flow

### 3. Cross-origin requests must allow credentials

This is already enabled on the backend, but the frontend still must send:

```ts
credentials: "include"
```

### 4. OAuth callback should land on frontend

Use a frontend route like:

- `/auth/callback`

That page should call `/auth/session`, update auth state, and redirect to the app.

## Recommended frontend sequence

### Email/password login sequence

1. Submit form to `POST /auth/login`
2. Browser stores session cookie from response
3. Call `GET /auth/session`
4. Save `data.user` in frontend state
5. Navigate to protected app pages

### App refresh sequence

1. App loads
2. Call `GET /auth/session`
3. If 200, mark authenticated
4. If 401, mark logged out

### Logout sequence

1. Call `POST /auth/logout`
2. Clear frontend auth state
3. Redirect to login page

## Short answer

If you want the frontend to work with this backend, the main rule is:

Use the `/auth/*` endpoints and always send requests with `credentials: "include"` so the browser can store and send the Better Auth session cookie.
