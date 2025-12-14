# Bus Ticket Booking System - Frontend

React + Vite frontend for the Bus Ticket Booking System. The original design is available at
https://www.figma.com/design/Hl4QoInyZBHzpk2CokbtKA/Bus-Ticket-Booking-System.

# Github

https://github.com/tunatran99/bus-ticket-booking-frontend.git

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS-style utility classes (shadcn/ui + Radix components)
- Axios for API calls

## Running the code

From the `figma_bus` directory:

- Install dependencies:

```bash
npm install
```

- Start the development server:

```bash
npm run dev
```

By default, the app expects the backend to be running at `http://localhost:4000` with the API
prefix `/api/v1`.

## Authentication & authorization

### Token model and storage

The frontend talks to the NestJS backend using a **JWT Access + Refresh token** model that mirrors
the backend design:

- **Login / registration endpoints**
  - `POST /api/v1/user/register` – create a new account.
  - `POST /api/v1/user/login` – authenticate with `identifier` (email or phone) + password.
- **Tokens returned by the backend** (on successful login):
  - `accessToken` – short‑lived JWT used on every API call.
  - `refreshToken` – longer‑lived JWT used only to obtain new access tokens.
  - `expiresIn` – number of seconds until the access token expires.
- **Where tokens are stored on the frontend**
  - `accessToken`: kept **in memory** (via a simple `tokenStore` singleton) so it is cleared on
    full page reloads and is not directly persisted in storage.
  - `refreshToken`: stored in `localStorage` under the key `refreshToken` to survive page reloads.
- **How requests are authenticated**
  - All authenticated requests go through a shared Axios instance (`api.ts`).
  - A request interceptor attaches:
    - `X-Request-ID`: a random UUID per request.
    - `Authorization: Bearer <accessToken>` header when an access token is present.

### Automatic token refresh

- When the backend returns `expiresIn`, the frontend schedules a refresh using an
  `autoRefresh` helper that triggers roughly 20 seconds before expiry.
- The refresh flow calls `POST /api/v1/user/refresh` with the current `refreshToken`.
- On success, the frontend:
  - updates the in‑memory `accessToken`,
  - optionally reschedules the next refresh based on the new `expiresIn`,
  - retries any pending API requests that failed with `401` due to token expiry.
- If refresh fails (invalid/expired refresh token), the frontend:
  - clears both tokens from the `tokenStore`, and
  - navigates the user back to `/login`.

### Route protection

- The `AuthContext` provides:
  - `user` (with `id`, `name`, `email`, optional `phone`, and `role` when available).
  - `isAuthenticated` – derived from whether a valid `user` object is present.
  - `login`, `signup`, `logout` helpers that delegate to the shared `auth.service`.
- Protected routes are wrapped in a `ProtectedRoute` component; unauthenticated users are
  redirected to `/login` before the target page is rendered.
- Typical protected routes include:
  - `/profile`
  - `/routes`
  - `/my-tickets`

### Roles and scopes

- The backend encodes the user's `role` (e.g. `admin` or `passenger`) in the JWT payload.
- The frontend **does not** introspect the JWT directly; instead it:
  - queries the backend via `GET /api/v1/user/me` to obtain the current user profile
    (including `role`), and
  - caches this in `AuthContext`.
- Role information drives **role‑based UI** rather than hard client‑side security:
  - Admin dashboards and management widgets are only rendered when `user.role === 'admin'`.
  - Server‑side guards still enforce authorization on endpoints like `/dashboard/admin` and
    `/user/all`, so hiding UI is a UX detail, not the primary security layer.

## Backend & external setup

- **Social login / external identity providers**
  - Configure OAuth clients with Google/Facebook.
  - Add appropriate backend routes to handle provider callbacks and issue first‑party JWTs.
  - Wire the frontend buttons to the new backend endpoints or provider auth URLs.

## Design decisions & trade‑offs

- **Access token in memory, refresh token in localStorage**
  - Reduces persistence of the most sensitive token (access token) while still enabling session restoration via refresh token.
  - `localStorage` is readable by JavaScript, so a successful XSS attack could steal the refresh token. For a production‑grade system you would typically prefer httpOnly cookies or additional hardening (CSP, strict sanitization, etc.).

- **JWTs instead of server‑side sessions**
  - Keeps the frontend and backend loosely coupled; any SPA or mobile client can consume the same token‑based API.
  - Encodes `role` and other claims directly in the token payload, making authorization checks cheap on the backend.
  - Requires careful management of token expiry and refresh; clock skew and network errors need to be handled gracefully (hence the interceptor + auto‑refresh logic).

- **Client‑driven role‑based UI with server‑enforced authorization**
  - The UI adapts to the current user's role (e.g. hides admin panels for non‑admins) which improves UX.
  - All critical authorization checks still happen on the backend using guards, so a malicious user cannot obtain extra privileges just by manipulating the frontend.

## Layout & design system

- `Layout` component (`components/Layout.tsx`) acts as the AppShell, providing:
  - Top navigation
  - Main content area
  - Footer
  - Floating Chatbot and Hotline icons
- UI primitives are composed from shadcn/ui-style components in `components/ui`
- Styling uses Tailwind-style utility classes with a shared design token set:
  - Colors: `primary`, `secondary`, `background`, `muted`, `error`, etc.
  - Typography: heading styles (`h1`, `h2`, etc.) and body text via global CSS.
  - Spacing: consistent `px-`, `py-`, `gap-` utilities for layout rhythm.

## Dashboard

The `/dashboard` page shows a role-aware dashboard:

- Summary cards:
  - Total tickets
  - Upcoming trips
  - Completed trips
  - Cancelled trips
- Recent trips list:
  - Cards with route, status, date/time, seats, and price.
- Admin-only panel (visible only when the user has `role = 'admin'`):
  - Total users and total admins
  - List of recent users and their roles

All dashboard data flows from the NestJS backend via `/api/v1/dashboard/me` and
`/api/v1/dashboard/admin`.

## Tooling

- ESLint with a modern React + TypeScript config (`.eslintrc.cjs`).
- Prettier for code formatting (`.prettierrc`).
- Husky + lint-staged for pre-commit checks:
  - `lint-staged` runs ESLint and Prettier on staged files.
- Useful scripts:

```bash
npm run lint    # Run ESLint on src
npm run format  # Format source files with Prettier
npm run build   # Type-check and build with Vite
```
