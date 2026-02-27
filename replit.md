# Norwert Hills Funeral & Cremation Services

## Overview
A full-stack funeral home website for a Louisiana-based business with an editorial/luxury dark aesthetic. Includes public-facing pages and a staff portal with authentication.

## Architecture
- **Frontend**: React 19 + TypeScript + Vite, Tailwind CSS v4, Wouter routing, Framer Motion, shadcn/ui components
- **Backend**: Express 5 + TypeScript, Passport.js local auth with sessions
- **Database**: PostgreSQL (Neon) via Drizzle ORM
- **Session Store**: connect-pg-simple (PostgreSQL-backed sessions)

## Key Files

### Backend
- `server/index.ts` — Express server entry point, middleware, auth setup, seed call
- `server/auth.ts` — Passport local strategy, session config, login/logout/register routes, `requireAuth` middleware
- `server/routes.ts` — API routes for contacts, arrangements, arrangement items
- `server/storage.ts` — `IStorage` interface + `DatabaseStorage` implementation using Drizzle
- `server/db.ts` — PostgreSQL pool + Drizzle instance
- `server/seed.ts` — Seeds default admin user on startup

### Shared
- `shared/schema.ts` — Drizzle tables: `users`, `contactSubmissions`, `arrangements`, `arrangementItems` + Zod schemas

### Frontend
- `client/src/App.tsx` — Router with all public + staff routes
- `client/src/hooks/use-auth.ts` — Auth hook (login, logout, session check)
- `client/src/lib/queryClient.ts` — TanStack Query client + `apiRequest` helper
- `client/src/lib/data.ts` — Static catalog data (services, builder steps, example bill)

### Pages
- **Public**: Home, Services, ServiceDetail, About, Resources, ResourcesFAQ, ArticleDetail, Contact
- **Staff**: Login (`/staff/login`), Dashboard (`/staff/dashboard`), Builder (`/staff/builder`), Billing (`/staff/billing`)

## Database Schema
- `users` — id (UUID), username, password (scrypt hash), display_name, role
- `contact_submissions` — id, name, email, subject, message, status, created_at
- `arrangements` — id, family_name, email, phone, status, next_step, scheduled_time, staff_id, selections (JSONB), notes, created_at
- `arrangement_items` — id, arrangement_id, section, description, amount

## Authentication
- Staff login at `/staff/login` with username/password
- Default admin credentials: `admin` / `BeverlyJean`
- Sessions stored in PostgreSQL via connect-pg-simple
- All `/api/arrangements*` and `/api/contacts` (GET) routes require authentication
- Contact form submission (`POST /api/contact`) is public

## API Routes
- `POST /api/contact` — Public contact form submission
- `GET /api/contacts` — List contacts (auth required)
- `PATCH /api/contacts/:id/status` — Update contact status (auth required)
- `POST /api/auth/login` — Staff login
- `POST /api/auth/logout` — Staff logout
- `GET /api/auth/me` — Current user session
- `POST /api/auth/register` — Create new staff user
- `GET/POST /api/arrangements` — List/create arrangements (auth required)
- `GET/PATCH/DELETE /api/arrangements/:id` — CRUD single arrangement (auth required)
- `GET/POST/DELETE /api/arrangements/:id/items` — Arrangement line items (auth required)

## Design
- Dark theme with muted gold primary (#D4AF37-ish via CSS variables)
- Serif fonts for headings, light sans-serif for body
- Louisiana-specific legal content citing statutes §37:876, §37:880, 51 §103
- Uploaded PDF: Louisiana Funeral Planning Guide
