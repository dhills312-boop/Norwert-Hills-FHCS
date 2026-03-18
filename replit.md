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
- `server/cremation-routes.ts` — Cremation system API routes (service area check, orders, events, waitlist, compliance)
- `server/cremation-events.ts` — Event emission utility with handler registration for cremation workflow
- `server/compliance-trigger.ts` — Registers auto-trigger for compliance packet generation when CREMATION_COMPLETED + RELEASE/SHIPMENT events exist
- `server/services/pdf-generator.ts` — PDF generation for compliance documents (case summary, chain of custody, payment record, release/shipping record, merged packet) using PDFKit + pdf-lib
- `server/services/compliance-engine.ts` — Orchestrates compliance packet assembly, Louisiana compliance checks, Drive uploads, and case completion
- `server/service-area.ts` — Geofencing utility (60mi radius from Hammond, LA chapel)
- `server/zip-coordinates.json` — Static zip-to-coordinates dataset for Louisiana area
- `server/storage.ts` — `IStorage` interface + `DatabaseStorage` implementation using Drizzle
- `server/db.ts` — PostgreSQL pool + Drizzle instance
- `server/seed.ts` — Bootstrap director account from ADMIN_EMAIL/ADMIN_PASSWORD env vars; syncs credentials on restart if env vars change

### Shared
- `shared/schema.ts` — Drizzle tables: `users`, `auditLogs`, `activityLogs`, `contactSubmissions`, `arrangements`, `arrangementItems`, `serviceCatalog`, `announcements`, `condolenceMessages`, `cremationOrders`, `cremationEvents`, `cremationDocuments`, `waitlistSignups` + Zod schemas + password/email validators + `ArrangementSelections`, `ServiceDetails`, `MediaGallery` interfaces + cremation phase/event/actor type enums. `arrangements` table includes: `deceased_name`, `authorizing_agent_name`, `authorizing_agent_phone`, `authorizing_agent_email`, `authorizing_agent_address`, `relationship_to_deceased`, `assigned_staff_name` columns.

### Frontend
- `client/src/App.tsx` — Router with all public + staff routes
- `client/src/hooks/use-auth.ts` — Auth hook (login, logout, session check, isDirector)
- `client/src/lib/queryClient.ts` — TanStack Query client + `apiRequest` helper
- `client/src/lib/data.ts` — Static catalog data (services, builder steps, example bill)

### Pages
- **Public**: Home, Services, ServiceDetail, About, Resources, ResourcesFAQ, ArticleDetail, Contact
- **Announcements**: Dynamic database-driven memorial pages
  - Legacy: `/announcements/charles-braud` (hardcoded Charles Braud page)
  - Dynamic: `/announcements/:slug` — public announcement page (brief obituary, service info, portrait, memorial song, share/directions/calendar)
  - Dynamic: `/obituaries/:slug` — public obituary page (full obituary, guestbook with condolence messages, Send Flowers/Sympathy Gifts placeholders, link back to announcement)
  - Portrait image upload: POST `/api/announcements/upload/:slug` (multer, max 10MB, JPG/PNG/WebP/GIF)
  - YouTube embeds rendered as audio-only custom player (uses YouTube IFrame API, no video visible)
  - Assets stored in `client/public/assets/announcements/<slug>/`
  - Uses Cinzel, EB Garamond, Cormorant Garamond fonts
  - CSS keyframes: `announcement-slow-zoom`, `announcement-twinkle`, `announcement-float` in index.css
  - Share buttons (Facebook, Twitter/X, Instagram copy-to-clipboard, Copy Link)
  - Get Directions (Google Maps / Apple Maps), Add to Calendar (.ics download)
- **Staff**: Login (`/staff/login`), Dashboard (`/staff/dashboard`), Builder (`/staff/builder`), Billing (`/staff/billing`)
  - Announcements management at `/staff/announcements` (list) and `/staff/announcements/:id` (editor)
  - Accessible from SessionOverview via "Manage Announcement" button at `/staff/sessions/:id/announcement`
- **Director-only**: User Management (`/staff/admin/users`), Service Catalog (`/staff/catalog`)

## Database Schema
- `users` — id (UUID), name, email (unique, @thenhfcs.com domain), password (bcrypt hash), role (director|staff), is_active, created_at, last_login_at
- `audit_logs` — id, actor_id, action, target_id, created_at
- `contact_submissions` — id, name, email, subject, message, status, created_at
- `arrangements` — id, family_name, email, phone, status, next_step, scheduled_time, staff_id, selections (JSONB), notes, created_at
- `arrangement_items` — id, arrangement_id, section, description, amount
- `activity_logs` — id, arrangement_id, actor_id, action (created|updated|deleted), details, created_at — tracks all staff actions on arrangements within DB transactions
- `service_catalog` — id (UUID), item_type (package|service|merchandise|add-on|cash-advance), name, description, category, default_price, display_order, included_in (JSONB array of package IDs), is_active
- `announcements` — id (UUID), arrangement_id, slug (unique), deceased_first_name, deceased_last_name, date_of_birth, date_of_passing, brief_obituary, full_obituary, epitaph, service_details (JSONB), portrait_image_path, memorial_song_url, media_gallery (JSONB), is_published, created_at
- `condolence_messages` — id (UUID), announcement_id, visitor_name, message, created_at
- `cremation_orders` — id (UUID), order_token (unique, URL-safe), contact_name, contact_email, contact_phone, decedent_name, state_of_death, current_phase (intake|forms|payment|fulfillment|completed), payment_status, payment_reference, payment_timestamp, packet_locked, drive_root_folder_id, drive_root_folder_url, drive_subfolders (JSONB map of subfolder name → Drive folder ID), created_at, updated_at
- `cremation_events` — id (UUID), order_id, event_type (ORDER_CREATED|FORM_SUBMITTED|PAYMENT_LINK_CREATED|PAYMENT_CONFIRMED|PAYMENT_FAILED|REMAINS_RECEIVED|CREMATION_SCHEDULED|CREMATION_COMPLETED|RELEASE_RECORDED|SHIPMENT_RECORDED|CASE_COMPLETED), actor_type (system|staff|family), actor_id, details (JSONB), created_at
- `cremation_documents` — id (UUID), order_id, drive_file_id, drive_url, document_type, folder_path, created_at
- `waitlist_signups` — id (UUID), email, zip, created_at

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
- `GET/POST /api/announcements` — List/create announcements (auth required)
- `GET/PATCH/DELETE /api/announcements/:id` — CRUD single announcement (auth required)
- `GET /api/announcements/by-arrangement/:arrangementId` — Get announcement for arrangement (auth required)
- `GET /api/announcements/:id/condolences` — Staff condolence moderation (auth required)
- `DELETE /api/condolences/:id` — Delete condolence message (auth required)
- `GET /api/public/announcements/:slug` — Public announcement data (published only)
- `GET /api/public/obituaries/:slug` — Public obituary data (published only)
- `GET /api/public/announcements/:slug/condolences` — Public condolence list
- `POST /api/public/announcements/:slug/condolences` — Public condolence submission (with length validation)
- `POST /api/cremation/check-service-area` — Public, checks if zip is within 60mi of Hammond, LA
- `POST /api/cremation/orders` — Public, creates cremation order with auto-generated token
- `GET /api/cremation/orders/:token` — Public, retrieves order by token (family portal)
- `GET /api/cremation/orders` — Staff, lists all cremation orders
- `PATCH /api/cremation/orders/:id` — Staff, updates cremation order
- `POST /api/cremation/orders/:id/events` — Staff, logs operational events
- `GET /api/cremation/orders/:id/events` — Staff, retrieves event timeline
- `POST /api/cremation/waitlist` — Public, captures out-of-area interest
- `GET /api/cremation/orders/:id/documents` — List Drive document references for a case (auth required)
- `GET /api/cremation/orders/:id/drive-link` — Get root Drive folder URL for a case (auth required)
- `POST /api/cremation/orders/:id/create-drive-folder` — Create Drive folder structure for a case (auth required)
- `POST /api/cremation/orders/:id/payment-link` — Generate Square checkout link (auth required)
- `POST /api/cremation/webhooks/square` — Square webhook endpoint (public, signature-verified)
- `GET /api/cremation/orders/:id/payment-status` — Get payment status (auth required)
- `POST /api/cremation/orders/:id/compliance-packet` — Manually trigger/regenerate compliance packet (auth required, blocked if locked)
- `GET /api/cremation/orders/:id/compliance-status` — Get compliance readiness, Louisiana checks, and generated documents (auth required)

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Session signing secret
- `ADMIN_EMAIL` — Bootstrap admin email (first-run)
- `ADMIN_PASSWORD` — Bootstrap admin password (first-run)
- `ADMIN_NAME` — Bootstrap admin display name (first-run)
- `GOOGLE_SERVICE_ACCOUNT_JSON` — Google Workspace service account credentials JSON (for Drive integration)
- `GOOGLE_DRIVE_PARENT_FOLDER_ID` — Google Drive parent folder ID where Orders/ folder structure is created
- `SQUARE_ACCESS_TOKEN` — Square API access token for payment processing
- `SQUARE_LOCATION_ID` — Square location ID for checkout
- `SQUARE_WEBHOOK_SIGNATURE_KEY` — Square webhook signature key for verification
- `SQUARE_ENVIRONMENT` — Square environment (sandbox|production, defaults to sandbox)

## Google Drive Integration
- Service module: `server/services/google-drive.ts` — authenticates via service account, creates case folder structures, uploads files, lists files
- Case folder structure: `Orders/{OrderToken}/` with subfolders: 01 Intake, 02 Authorization, 03 Vital Stats, 04 SSN Restricted, 05 Shipping & Urn, 06 Compliance Packet
- References stored in `cremation_documents` table (only Drive IDs/URLs, no sensitive documents in DB)
- Exposed methods: `createFolder()`, `createCaseStructure()`, `uploadFile()`, `getFileUrl()`, `getFolderUrl()`, `listFiles()`, `isConfigured()`

## Design
- Dark theme with muted gold primary (#D4AF37-ish via CSS variables)
- Serif fonts for headings, light sans-serif for body
- Louisiana-specific legal content citing statutes §37:876, §37:880, 51 §103
- Uploaded PDF: Louisiana Funeral Planning Guide
