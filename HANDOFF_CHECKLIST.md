# NHFCS Handoff Checklist — What's Needed to Go Fully Operational

## 1. Environment Variables & Secrets

### Already Configured
- [x] `DATABASE_URL` — PostgreSQL connection
- [x] `SESSION_SECRET` — Session signing
- [x] `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` — Director bootstrap

### Need to Be Set

| Variable | Purpose | Where to Get It |
|----------|---------|-----------------|
| `SQUARE_ACCESS_TOKEN` | Process cremation payments | [Square Developer Dashboard](https://developer.squareup.com/) → Application → Credentials |
| `SQUARE_LOCATION_ID` | Identifies your Square business location | Square Dashboard → Locations |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Verify payment webhook callbacks | Square Dashboard → Webhooks → Signature Key |
| `SQUARE_ENVIRONMENT` | Set to `production` when live (currently defaults to `sandbox`) | Just set the value |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google Drive document storage for cremation cases | [Google Cloud Console](https://console.cloud.google.com/) → IAM → Service Accounts → Create Key (JSON) |
| `GOOGLE_DRIVE_PARENT_FOLDER_ID` | Root Drive folder where case folders are created | Create a folder in Google Drive, copy its ID from the URL |

---

## 2. Third-Party Accounts Needed

### Square (Payments)
- [ ] Create a Square developer account
- [ ] Create an application in the Square Dashboard
- [ ] Set the Square webhook URL to: `https://yourdomain.com/api/cremation/webhooks/square`
- [ ] Subscribe the webhook to `payment.completed` events
- [ ] Switch from sandbox to production when ready to accept real payments

### Google Workspace (Document Storage)
- [ ] Create a Google Cloud project with the Drive API enabled
- [ ] Create a service account and download its JSON key
- [ ] Create a shared Drive folder for cremation case documents
- [ ] Share that folder with the service account's email address (with Editor permissions)
- [ ] The app will auto-create `Orders/{token}/` subfolders for each case

### Twilio (SMS — Not Yet Integrated)
- [ ] Create a Twilio account at [twilio.com](https://www.twilio.com)
- [ ] Get a phone number, Account SID, Auth Token
- [ ] Provide credentials to integrate SMS sending from the session overview

---

## 3. JotForm Setup

The system has two form templates seeded with placeholder IDs. You need real JotForm form IDs:

| Form | Current Status | What to Do |
|------|---------------|------------|
| Vital Statistics | `PLACEHOLDER_VITAL_STATS` | Create the form in JotForm, copy the form ID, update via Catalog Admin or database |
| Authorization for Embalming/Cremation | `PLACEHOLDER_AUTHORIZATION` | Same — create in JotForm, copy the form ID |

The cremation case detail page also references a JotForm template URL (`https://form.jotform.com/TEMPLATE`) that needs a real form ID.

JotForm prefill fields the system sends: `sessionId`, `familyName`, `serviceType`, `staffName`

---

## 4. Domain & DNS

- [ ] Point your domain (e.g., `thenhfcs.com`) to the deployed Replit app
- [ ] Update the Square webhook URL to use your production domain
- [ ] Update Open Graph meta tags in `client/index.html` if the domain changes

---

## 5. Deployment Settings

- [ ] Publish via Replit deployments (autoscale mode)
- [ ] Build command: `npm run build`
- [ ] Run command: `node dist/index.cjs`
- [ ] Ensure all environment variables above are set in the deployment environment (not just dev)

---

## 6. Content That Needs Real Data

### Announcement Pages
- [ ] Charles Braud announcement is hardcoded and live
- [ ] New announcements can be created from the staff portal (Staff → Announcements)
- [ ] Portrait images should be uploaded to `client/public/assets/announcements/<slug>/`

### Public Page Content
- [ ] Home page hero images — currently using placeholder/stock assets in `client/public/assets/`
- [ ] About page staff photos and bios
- [ ] Contact page — verify the address, phone number, and hours are correct
- [ ] Resources/FAQ content — verify legal citations are current

### Service Catalog
- [x] 44 items seeded (packages, services, caskets, urns, florals, add-ons, cash advances)
- [ ] Review and adjust all default prices to match your actual GPL pricing
- [ ] Add any missing items via the Catalog Admin page (Director login → Catalog)

---

## 7. Features That Are Stubbed / Partial

| Feature | Status | What's Missing |
|---------|--------|----------------|
| SMS sending (session forms) | Not integrated | Needs Twilio credentials and API integration |
| Email sending (forms, billing) | UI only | Needs an email service (SendGrid, AWS SES, etc.) |
| Send Flowers / Sympathy Gifts | Placeholder links on obituary page | Need vendor URLs or affiliate links |
| Digital signature (billing) | Button exists, no implementation | Needs a signature service (DocuSign, HelloSign) or custom canvas |
| Form fill page (`/staff/form-fill`) | Placeholder page | Needs JotForm embed or custom form builder |
| Payment processing | Backend complete | Needs Square credentials to process real payments |
| Google Drive folders | Backend complete | Needs service account credentials to create case folders |
| Obituary page livestream | Field exists in editor | Needs YouTube/Facebook Live URL per service |

---

## 8. Security Checklist for Production

- [ ] Change the default admin password (`BeverlyJean1!`) immediately after first login
- [ ] Set a strong, unique `SESSION_SECRET` (already set, verify it's not a default)
- [ ] Ensure `SQUARE_ENVIRONMENT` is set to `production` (not `sandbox`) for real payments
- [ ] Verify rate limiting is working on `/api/auth/login` (10 attempts per 15 minutes)
- [ ] Review and rotate Square webhook signature key periodically
- [ ] Set `NODE_ENV=production` in the deployment environment

---

## 9. Staff Onboarding

- [ ] Director logs in at `/staff/login` with bootstrap credentials
- [ ] Director creates staff accounts via `/staff/admin/users`
- [ ] All staff emails must end in `@thenhfcs.com`
- [ ] Passwords require: 8+ characters, uppercase, lowercase, number, special character
- [ ] Staff roles: `director` (full access) vs `staff` (dashboard, builder, billing only)

---

## Summary — Priority Order

1. **Immediate (to accept cases):** Square credentials, JotForm IDs, Google Drive setup
2. **Soon (for full communication):** Twilio SMS, email service integration
3. **Before launch:** Domain/DNS, production deployment, content review, security hardening
4. **Nice to have:** Digital signature, livestream integration, Send Flowers vendor links
