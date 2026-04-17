# TutorLink - Replit.md

## Overview

TutorLink is a full-stack tutoring marketplace web application that connects students with tutors. It supports three distinct user roles: **students** (find and book tutors), **tutors** (manage profiles and booking requests), and **admins** (manage users and view platform data).

Core features:
- Public landing page and tutor browsing
- Role-based authentication (student, tutor, admin)
- Tutor profile management (subjects, hourly rate, bio, experience)
- Booking system with status workflow (pending → accepted/rejected → completed)
- Admin dashboard for user management

The app is a monorepo with a React frontend (`client/`), Express backend (`server/`), and shared types/schema (`shared/`).

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend Architecture

- **Framework**: React (Vite, TypeScript, no SSR)
- **Routing**: `wouter` — lightweight client-side routing, uses `<Redirect>` for client-side redirects (no `window.location.href`)
- **State/Data Fetching**: TanStack Query (React Query v5) for server state; all API calls go through custom hooks in `client/src/hooks/`
- **Forms**: `react-hook-form` + `zod` validation via `@hookform/resolvers`
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS), "new-york" style variant
- **Animations**: Framer Motion for page transitions and list animations
- **Fonts**: Outfit (display), Plus Jakarta Sans (body) via Google Fonts
- **Theme**: Custom CSS variables for a blue/white educational theme, defined in `client/src/index.css`

**Key Pages:**
- `Home.tsx` — public marketing landing page
- `Auth.tsx` — combined login/register page with tabs; has `data-testid` attributes on all interactive elements
- `StudentDashboard.tsx` — tutor search + booking management
- `TutorDashboard.tsx` — manage booking requests and edit profile
- `AdminDashboard.tsx` — user management and platform stats

**Route Protection**: A `PrivateRoute` component in `App.tsx` checks auth status and role, redirecting users to role-appropriate dashboards using wouter's `<Redirect>`.

### Backend Architecture

- **Framework**: Express 5 (TypeScript, ESM)
- **Entry Point**: `server/index.ts` creates the HTTP server and registers routes
- **API Routes**: Defined in `server/routes.ts`; route paths and Zod schemas are co-located in `shared/routes.ts` for full-stack type safety
- **Storage Layer**: `server/storage.ts` exposes a `DatabaseStorage` class implementing `IStorage` interface — all DB access goes through this abstraction
- **Dev Server**: Vite is embedded in Express in development mode (`server/vite.ts`); in production, static files are served from `dist/public/`
- **Build**: `script/build.ts` runs Vite (client) + esbuild (server) together
- **Security**: All API responses use `omitPassword()` helper to strip password hashes before sending to client

### Authentication & Authorization

- **Library**: Passport.js with `passport-local` strategy
- **Sessions**: `express-session` with PostgreSQL-backed session store (`connect-pg-simple`)
- **Password Hashing**: Node.js `crypto.scrypt` with random salt; timing-safe comparison
- **Session Secret**: Configured via `SESSION_SECRET` environment variable (fallback for dev)
- **Role enforcement**: Server-side checks on `req.user.role` for protected endpoints; client-side redirects based on role after login
- **Registration validation**: Server validates username, password (min 6 chars), name, and role before creating user; returns JSON error messages

### Data Storage

- **Database**: PostgreSQL (via `pg` pool)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod validation
- **Schema** (`shared/schema.ts`):
  - `users` — id, username, password, role (student/tutor/admin), name, createdAt
  - `tutors` — id, userId (FK), bio, subjects (text array), experience (years), hourlyRate
  - `bookings` — id, studentId (FK), tutorId (FK), date, status (pending/accepted/rejected/completed), notes, createdAt
- **Migrations**: Drizzle Kit (`drizzle-kit push` / `./migrations/`)
- **Seed Script**: `script/seed.ts` populates test users and tutor profiles
- **Important**: Production DB is separate from development DB. Seeded demo data (student1, admin, tutor1, tutor2) only exists in dev DB.

### Shared Code (`shared/`)

- `schema.ts` — Drizzle table definitions + Zod insert schemas + ORM relations; `insertBookingSchema` uses `z.coerce.date()` to accept ISO date strings
- `routes.ts` — Centralized API route definitions (method, path, Zod input/output schemas) used by both frontend hooks and backend handlers; exports `userResponseSchema` (without password field), re-exports types `InsertUser`, `InsertTutor`, `InsertBooking`

---

## External Dependencies

### Core Infrastructure
- **PostgreSQL** — Primary database; connection via `DATABASE_URL` environment variable (required)
- **Node.js** — Runtime for the Express server

### Key NPM Packages

| Package | Purpose |
|---|---|
| `drizzle-orm` + `pg` | Database ORM and PostgreSQL driver |
| `drizzle-zod` | Auto-generate Zod schemas from Drizzle tables |
| `express` v5 | HTTP server framework |
| `passport` + `passport-local` | Authentication strategy |
| `express-session` + `connect-pg-simple` | Session management backed by Postgres |
| `zod` | Runtime schema validation (shared frontend/backend) |
| `@tanstack/react-query` | Server state management on frontend |
| `react-hook-form` + `@hookform/resolvers` | Form state and validation |
| `wouter` | Client-side routing |
| `framer-motion` | UI animations |
| `date-fns` | Date formatting for bookings |
| `lucide-react` | Icon library |
| Radix UI (many packages) | Accessible headless UI primitives |
| shadcn/ui | Component library built on Radix + Tailwind |

### External Services / CDNs
- **Google Fonts** — Outfit, Plus Jakarta Sans, DM Sans, Fira Code, Geist Mono loaded via `<link>` in `client/index.html`

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string (mandatory; app throws on startup if missing)
- `SESSION_SECRET` — Session signing secret (optional; defaults to `"r3pl1t"` in dev)

### Replit-Specific Integrations
- `@replit/vite-plugin-runtime-error-modal` — Shows runtime errors as overlay in dev
- `@replit/vite-plugin-cartographer` — Dev-only file mapping tool
- `@replit/vite-plugin-dev-banner` — Dev-only banner; both only active when `REPL_ID` is set
