# Norwert Hills Funeral & Cremation Services

## Overview
A full-stack funeral home website for a Louisiana-based business with an editorial/luxury dark aesthetic. Includes public-facing pages and a staff portal with role-based authentication.

## Architecture
- **Frontend**: React 19 + TypeScript + Vite, Tailwind CSS v4, Wouter routing, Framer Motion, shadcn/ui components
- **Backend**: Express 5 + TypeScript, Passport.js local auth with sessions
- **Database**: PostgreSQL (Neon) via Drizzle ORM
- **Session Store**: connect-pg-simple (PostgreSQL-backed sessions)
- **Password Hashing**: bcrypt (12 rounds)
- **Rate Limiting**: express-rate-limit on login endpoint

## Key Files

### Backend
- `server/index.ts` — Express server entry point, middleware, auth setup, seed call
- `server/auth.ts` — Passport local strategy (email-based), session config, login/logout routes, `requireAuth` + `requireDirector` middleware, rate limiting
- `server/routes.ts` — API routes for contacts, arrangements, user management, audit logs
- `server/storage.ts` — `IStorage` interface + `DatabaseStorage` implementation using Drizzle
- `server/db.ts` — PostgreSQL pool + Drizzle instance
- `server/seed.ts` — Bootstrap director account from ADMIN_EMAIL/ADMIN_PASSWORD env vars; syncs credentials on restart if env vars change

### Shared
- `shared/schema.ts` — Drizzle tables: `users`, `auditLogs`, `activityLogs`, `contactSubmissions`, `arrangements`, `arrangementItems`, `serviceCatalog` + Zod schemas + password/email validators + `ArrangementSelections` interface

### Frontend
- `client/src/App.tsx` — Router with all public + staff routes
- `client/src/hooks/use-auth.ts` — Auth hook (login, logout, session check, isDirector)
- `client/src/lib/queryClient.ts` — TanStack Query client + `apiRequest` helper
- `client/src/lib/data.ts` — Static catalog data (services, builder steps, example bill)

### Pages
- **Public**: Home, Services, ServiceDetail, About, Resources, ResourcesFAQ, ArticleDetail, Contact
- **Announcements**: Per-deceased memorial pages at `/announcements/<slug>` (e.g., `/announcements/charles-braud`)
  - Assets stored in `public/assets/announcements/<slug>/`
  - Uses Cinzel, EB Garamond, Cormorant Garamond fonts
  - CSS keyframes: `announcement-slow-zoom`, `announcement-twinkle`, `announcement-float` in index.css
  - Share buttons (Facebook, Twitter/X, Instagram copy-to-clipboard, Copy Link)
  - Get Directions (Google Maps / Apple Maps), Add to Calendar (.ics download)
- **Staff**: Login (`/staff/login`), Dashboard (`/staff/dashboard`), Builder (`/staff/builder`), Billing (`/staff/billing`)
- **Director-only**: User Management (`/staff/admin/users`), Service Catalog (`/staff/catalog`)

## Database Schema
- `users` — id (UUID), name, email (unique, @thenhfcs.com domain), password (bcrypt hash), role (director|staff), is_active, created_at, last_login_at
- `audit_logs` — id, actor_id, action, target_id, created_at
- `contact_submissions` — id, name, email, subject, message, status, created_at
- `arrangements` — id, family_name, email, phone, status, next_step, scheduled_time, staff_id, selections (JSONB), notes, created_at
- `arrangement_items` — id, arrangement_id, section, description, amount
- `activity_logs` — id, arrangement_id, actor_id, action (created|updated|deleted), details, created_at — tracks all staff actions on arrangements within DB transactions
- `service_catalog` — id (UUID), item_type (package|service|merchandise|add-on|cash-advance), name, description, category, default_price, display_order, included_in (JSONB array of package IDs), is_active

## Authentication & Authorization
- Email-based login at `/staff/login` (email + password)
- Bootstrap admin via env vars: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
- Default admin: admin@thenhfcs.com / BeverlyJean1!
- Roles: `director` (full access, user management) and `staff` (limited)
- Sessions stored in PostgreSQL via connect-pg-simple, httpOnly/secure/sameSite=lax cookies
- Rate limiting: 10 attempts per 15 minutes on login
- Generic login errors to prevent user enumeration
- Deactivated users cannot log in

## Director-only Features
- View/create/deactivate users
- Change user roles (staff ↔ director)
- Confirmation modals for role changes and deactivation
- Audit logging of all admin actions (role_changed, user_created, user_deactivated, user_activated)

## API Routes
- `POST /api/contact` — Public contact form submission
- `GET /api/contacts` — List contacts (auth required)
- `PATCH /api/contacts/:id/status` — Update contact status (auth required)
- `POST /api/auth/login` — Staff login (rate limited)
- `POST /api/auth/logout` — Staff logout
- `GET /api/auth/me` — Current user session
- `GET /api/admin/users` — List all staff (director only)
- `POST /api/admin/users` — Create staff account (director only)
- `PATCH /api/admin/users/:id/role` — Change role (director only)
- `PATCH /api/admin/users/:id/deactivate` — Deactivate user (director only)
- `PATCH /api/admin/users/:id/activate` — Activate user (director only)
- `GET /api/admin/audit-logs` — Audit log (director only)
- `PATCH /api/staff/profile` — Update own name/email (auth required)
- `GET/POST /api/arrangements` — List/create arrangements (auth required)
- `GET/PATCH/DELETE /api/arrangements/:id` — CRUD single arrangement (auth required)
- `GET/POST/DELETE /api/arrangements/:id/items` — Arrangement line items (auth required)
- `GET /api/activity-logs?arrangementId=` — Activity log for arrangements (auth required)
- `GET /api/service-catalog` — List catalog items, optional `?type=` filter (auth required)
- `GET /api/service-catalog/packages` — Packages with nested included items (auth required)
- `GET /api/service-catalog/:id` — Single catalog item (auth required)
- `POST /api/service-catalog` — Create catalog item (director only)
- `PATCH /api/service-catalog/:id` — Update catalog item (director only)

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Session signing secret
- `ADMIN_EMAIL` — Bootstrap admin email (first-run)
- `ADMIN_PASSWORD` — Bootstrap admin password (first-run)
- `ADMIN_NAME` — Bootstrap admin display name (first-run)

## Design
- Dark theme with muted gold primary (#D4AF37-ish via CSS variables)
- Serif fonts for headings, light sans-serif for body
- Louisiana-specific legal content citing statutes §37:876, §37:880, 51 §103
- Uploaded PDF: Louisiana Funeral Planning Guide
