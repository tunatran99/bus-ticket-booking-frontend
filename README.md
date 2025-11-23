
  # Bus Ticket Booking System - Frontend

  React + Vite frontend for the Bus Ticket Booking System. The original design is available at
  https://www.figma.com/design/Hl4QoInyZBHzpk2CokbtKA/Bus-Ticket-Booking-System.

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

  By default, the app expects the backend to be running at `http://localhost:3000` with the API
  prefix `/api/v1`.

  ## Authentication & authorization

  The frontend talks to the NestJS backend using a **JWT Access + Refresh token** model.

  - Email/password login and sign-up call:
    - `POST /api/v1/user/register`
    - `POST /api/v1/user/login`
  - On successful login, the backend returns:
    - `accessToken` (short-lived)
    - `refreshToken` (longer-lived)
    - `expiresIn` (seconds until access token expiry)
  - The frontend stores these tokens via a small `tokenStore` helper (backed by `localStorage`).
  - A background helper (`autoRefresh`) schedules refresh calls to `/api/v1/user/refresh` before the
    access token expires.
  - All authenticated API calls use the `accessToken` in the `Authorization: Bearer <token>` header.

  **Route protection:**

  - The `AuthContext` provides:
    - `user` (with `id`, `name`, `email`, optional `phone`, `role`)
    - `isAuthenticated` (derived from current user)
    - `login`, `signup`, `logout` helpers
  - `ProtectedRoute` wraps routes that require authentication; unauthenticated users are redirected
    to `/login`.
  - Currently protected routes include:
    - `/profile`
    - `/dashboard`
    - `/routes`
    - `/my-tickets`

  **Role-based UI:**

  - The backend encodes the user's `role` (`admin` or `passenger`) into the JWT payload.
  - The `Dashboard` page calls:
    - `GET /api/v1/dashboard/me` for personal metrics and recent trips.
    - `GET /api/v1/dashboard/admin` for admin metrics (total users, admins, recent users) when the
      current user has the `admin` role.
  - The admin-only widgets are only shown when the current user is an admin.

  ## Layout & design system

  - `Layout` component (`components/Layout.tsx`) acts as the AppShell, providing:
    - Top navigation
    - Main content area
    - Footer
    - Floating Chatbot and Hotline icons
  - UI primitives are composed from shadcn/ui-style components in `components/ui` (e.g. `Button`,
    `Card`, `FormField`, etc.).
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
  