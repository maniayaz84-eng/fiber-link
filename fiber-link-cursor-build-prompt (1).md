# Fiber Link — Cursor Build Specification

> **Purpose:** Give Cursor one clear, implementation-ready specification for building a secure, scalable, beginner-friendly fiber internet subscription web app for customers in Pakistan.
>
> **Company:** Fiber Link  
> **Primary audience:** Pakistani home and business internet customers  
> **Languages:** English and Roman Urdu  
> **Currency:** Pakistani Rupees (PKR / Rs.)  
> **Product:** Customer website + protected admin dashboard

---

## 0. Instructions to Cursor

Act as a senior full-stack engineer, product designer, database architect, and QA engineer.

The project owner is a beginner. Explain important decisions in simple language, avoid unnecessary complexity, and do not assume the owner knows how to configure infrastructure.

**Build the working application, not just a UI mockup.** Before implementation:

1. Inspect the existing repository and identify its current framework, files, package manager, and conventions.
2. If the repository is empty, initialize the project using the stack below.
3. Write a short implementation plan and list any assumptions.
4. Create or update `README.md` with beginner-friendly setup instructions.
5. Implement in small phases. After each phase, run relevant checks and fix errors before continuing.
6. Never claim a feature works unless it has been implemented and tested.
7. Do not overwrite existing user work without inspecting it first.
8. Do not put secrets in source code or commit `.env` files.
9. If a required value or external service credential is missing, create a safe placeholder, document it, and continue with a clear setup note. Never invent credentials.
10. Keep the application deployable and maintainable. Prefer simple, proven solutions over unnecessary enterprise complexity.

At the end, report:
- What was built
- Main routes
- Database tables and security policies
- Required environment variables
- Commands to run locally
- How to create the first admin safely
- Tests/checks completed
- Known limitations and next steps

---

## 1. Product Vision

Build **Fiber Link**, a responsive web application where customers can:

1. Browse available fiber internet packages.
2. Create an account or sign in.
3. Select a package and submit a subscription request.
4. See the payment instructions configured by Fiber Link.
5. Upload a payment screenshot/receipt.
6. Receive an email confirming that the payment proof was submitted and is awaiting ISP/admin verification.
7. Track the request and its status from their dashboard.
8. After an authorized admin verifies the payment and approves the subscription, see the subscription marked **Active**.

Admins can securely manage packages, review payment proofs, approve or reject requests, manage customers, and view subscription records.

### Important business rule

Uploading a screenshot is **not proof that payment has been verified**. A subscription must remain `payment_submitted` / pending until an authorized admin reviews it.

Only an authorized admin can approve a payment. Approval changes the app's subscription status to `active` and sends a confirmation email.

**Do not claim that the customer's router or actual internet service has been technically provisioned.** Unless Fiber Link later supplies an ISP/RADIUS/CRM provisioning API, “Active” means the subscription is approved and active in the Fiber Link application. Show this distinction in the admin workflow and document it.

---

## 2. Recommended Technology Stack

Use current stable, mutually compatible releases at implementation time. Do not use deprecated APIs.

- **Framework:** Next.js with App Router
- **Language:** TypeScript, strict mode
- **UI:** Tailwind CSS
- **Components:** shadcn/ui where useful; accessible components
- **Icons:** Lucide
- **Backend/database/authentication:** Supabase
  - Supabase Auth
  - Supabase PostgreSQL
  - Supabase Storage for payment proof images
  - Row Level Security (RLS)
- **Email:** Resend through server-side code, or a similarly reliable transactional email provider if Resend is unavailable
- **Validation:** Zod
- **Forms:** React Hook Form where it improves maintainability
- **Deployment target:** Vercel + Supabase

Use server components by default. Use client components only for interactive UI. Put privileged operations in secure server-side code (Route Handlers or Server Actions as appropriate).

Do not add a separate backend server unless a real requirement emerges. Next.js server-side functionality plus Supabase is sufficient for the initial product.

---

## 3. User Roles and Permissions

Use two roles:

### Customer

- Can sign up, sign in, sign out, and reset password.
- Can view public packages.
- Can create subscription requests for themselves.
- Can upload payment proof for their own pending request.
- Can view only their own profile, subscriptions, and payment submissions.
- Cannot approve payments, edit package prices, assign roles, or access admin pages/data.

### Admin

- Can access the protected admin dashboard.
- Can create, edit, activate, deactivate, and archive packages.
- Can review payment proof submissions.
- Can approve or reject a payment submission with an optional reason.
- Can approve a subscription and change its status to `active`.
- Can view and manage customer subscription records.
- Can view an audit trail of administrative decisions.

**Security requirement:** Never trust a role value supplied by the browser. Enforce admin permissions on the server and in database RLS policies. Do not expose the Supabase service-role key to the browser.

### First admin setup

Do not make public sign-up capable of creating admins.

Provide a documented, secure one-time admin bootstrap procedure. Prefer a server-side script or SQL operation run by the project owner after creating the account. Explain exactly how to do this in the README. Do not hardcode an admin email or password.

---

## 4. Main Customer Experience

### Public pages

- `/` — Home page
- `/packages` — Internet packages
- `/packages/[slug]` — Package detail page
- `/about` — About Fiber Link
- `/contact` — Contact information and support details
- `/login` — Sign in
- `/signup` — Customer registration
- `/forgot-password` — Password recovery
- `/privacy` — Privacy policy placeholder
- `/terms` — Terms and conditions placeholder

### Customer-protected pages

- `/dashboard` — Customer overview
- `/dashboard/subscriptions` — Customer's subscriptions and requests
- `/dashboard/subscriptions/new` — Start a subscription
- `/dashboard/subscriptions/[id]` — Subscription details and status
- `/dashboard/payments/[subscriptionId]` — Payment instructions and upload proof
- `/dashboard/profile` — Profile details

Protect customer routes. If a visitor is not signed in, redirect them to `/login` and preserve a safe return path.

### Subscription flow

1. Customer opens `/packages`.
2. Customer selects a package.
3. If not signed in, ask them to sign in or register, then return them to the selected package.
4. Customer confirms their contact and installation details.
5. Server creates a subscription request with a **snapshot** of the selected package name, speed, and price. This prevents later package edits from changing an existing request.
6. Show payment instructions configured by an admin (for example, bank transfer or a supported local payment method). Do not invent Fiber Link account numbers, wallet numbers, or payment details.
7. Customer uploads payment proof.
8. Validate file type and size on the server. Store it in a private Supabase Storage bucket.
9. Save a payment submission record and set subscription status to `payment_submitted`.
10. Send the customer a confirmation email: payment proof received; verification is pending.
11. Show a success state and the request reference number.
12. Admin reviews the proof.
13. Admin approves or rejects the payment with an optional note.
14. If approved, set payment status to `approved`, subscription status to `active`, record the admin and timestamp, and send an activation/approval email.
15. If rejected, set payment status to `rejected`, keep the subscription inactive, save the reason, notify the customer, and let them submit corrected proof if the business rules allow it.

Prevent duplicate submissions and accidental repeated approvals. Use safe, server-side state transitions.

---

## 5. Status Model

Use explicit statuses. Do not rely on vague text labels.

### Subscription status

- `draft`
- `pending_payment`
- `payment_submitted`
- `under_review`
- `active`
- `rejected`
- `cancelled`
- `expired`

### Payment status

- `not_submitted`
- `submitted`
- `under_review`
- `approved`
- `rejected`

Define allowed transitions in server-side business logic. For example:

- `pending_payment` → `payment_submitted`
- `payment_submitted` → `under_review`
- `under_review` → `active` (only after payment approval)
- `under_review` → `rejected`
- `rejected` → `payment_submitted` (if resubmission is enabled)

Do not allow a customer to set their own subscription or payment status.

---

## 6. Admin Dashboard

### Admin routes

- `/admin` — Dashboard overview
- `/admin/packages` — Package list
- `/admin/packages/new` — Create package
- `/admin/packages/[id]` — Edit package
- `/admin/subscriptions` — Subscription requests
- `/admin/subscriptions/[id]` — Subscription details
- `/admin/payments` — Payment review queue
- `/admin/payments/[id]` — Review a payment submission
- `/admin/customers` — Customer list
- `/admin/customers/[id]` — Customer details
- `/admin/settings` — Business contact and payment instructions

### Admin dashboard features

- Summary cards: total customers, pending payment reviews, active subscriptions, rejected submissions.
- Search and filter by customer, reference number, status, and date.
- Paginated lists; do not load all records at once.
- Payment proof preview through a short-lived signed URL generated on the server for an authorized admin.
- Approve/reject actions with a confirmation dialog.
- Optional rejection reason.
- Clear status history and timestamps.
- Package CRUD with validation.
- Empty, loading, error, and success states.

Admin pages must be protected by server-side authorization, not just hidden navigation links.

---

## 7. Packages

Each package should support:

- Name
- URL slug
- Description
- Download speed (Mbps)
- Upload speed (Mbps), if supplied
- Monthly price in PKR (store as integer paisa or integer PKR consistently; choose one approach and document it)
- Billing period (initially monthly)
- Installation fee (optional)
- Data limit or “Unlimited”
- Features list
- “Popular” flag
- Active/inactive status
- Display order

Use sample/demo package data only if clearly marked as demo content and easy to replace. Never present invented packages or prices as real Fiber Link offers.

Package cards should show price, speed, key features, and a clear “Subscribe” action.

---

## 8. Pakistani Audience, Language, and UX

Provide two language modes:

- English
- Roman Urdu (Urdu written using Latin characters)

Use a visible language switcher in the header and retain the selected language across navigation. Keep all UI labels, form validation messages, buttons, empty states, email templates, and status descriptions translatable.

Examples of tone:

| English | Roman Urdu |
|---|---|
| Choose your package | Apna package select karein |
| Subscribe now | Abhi subscribe karein |
| Payment proof uploaded | Payment ka screenshot upload ho gaya hai |
| Waiting for verification | Tasdeeq ka intezar hai |
| Your package is active | Aap ka package active ho gaya hai |
| Contact support | Support se rabta karein |

Use simple, respectful Roman Urdu. Avoid mixing Urdu script into the Roman Urdu mode.

### Visual design direction

Create a modern, trustworthy ISP brand experience:

- Brand name: **Fiber Link**
- Visual style: clean, modern, fast, reliable, friendly
- Use a restrained blue/indigo palette with a complementary accent.
- Strong typography and clear spacing.
- Responsive layouts for mobile, tablet, and desktop.
- Clear package comparison.
- Obvious subscription progress/status.
- Accessible contrast, keyboard navigation, labels, and focus states.
- Use subtle motion only where it helps usability.
- Avoid clutter, fake testimonials, fake customer counts, fake coverage claims, or invented awards.

### Homepage sections

1. Header with logo/name, navigation, language switcher, login/dashboard action.
2. Hero section with a clear fiber internet value proposition and “View Packages” CTA.
3. Package highlights loaded from the database.
4. “How it works” in three or four steps.
5. Why choose Fiber Link (only factual, configurable claims).
6. Coverage/contact section with configurable service-area information.
7. FAQ section.
8. Footer with contact details, support hours, terms, and privacy links.

Do not invent phone numbers, addresses, WhatsApp numbers, coverage areas, or payment details. Put these in admin-configurable settings and show a neutral placeholder until configured.

---

## 9. Database Design

Create Supabase SQL migrations in the repository, for example:

`supabase/migrations/0001_initial_schema.sql`

Use UUID primary keys, timestamps, foreign keys, indexes, and appropriate constraints.

Suggested tables:

### `profiles`

- `id` UUID primary key, references `auth.users(id)`
- `full_name`
- `phone`
- `preferred_language` (`en` or `roman_ur`)
- `created_at`
- `updated_at`

### `user_roles`

- `user_id` UUID, references `auth.users(id)`
- `role` (`customer` or `admin`)
- `created_at`

Use a unique constraint on `user_id` if each user has one role. Do not allow users to write their own role.

### `packages`

- `id`
- `name`
- `slug` (unique)
- `description`
- `download_speed_mbps`
- `upload_speed_mbps` (nullable)
- `monthly_price_pkr`
- `installation_fee_pkr` (nullable)
- `data_limit_label`
- `features` (JSONB or text array)
- `is_popular`
- `is_active`
- `display_order`
- `created_at`
- `updated_at`

### `subscriptions`

- `id`
- `reference_code` (unique, human-readable, non-secret)
- `user_id`
- `package_id` (nullable if package is later archived/deleted; prefer archive over delete)
- `package_name_snapshot`
- `download_speed_snapshot`
- `monthly_price_pkr_snapshot`
- `customer_name`
- `customer_phone`
- `installation_address`
- `city`
- `notes` (nullable)
- `status`
- `created_at`
- `updated_at`
- `approved_at` (nullable)
- `approved_by` (nullable admin user ID)

### `payment_submissions`

- `id`
- `subscription_id`
- `user_id`
- `amount_pkr`
- `payment_method`
- `transaction_reference` (nullable)
- `proof_storage_path`
- `status`
- `reviewed_by` (nullable)
- `reviewed_at` (nullable)
- `rejection_reason` (nullable)
- `created_at`

### `admin_audit_logs`

- `id`
- `admin_user_id`
- `action`
- `entity_type`
- `entity_id`
- `details` (JSONB, avoid storing secrets)
- `created_at`

### `app_settings`

- `key` (primary key)
- `value` (JSONB)
- `updated_at`
- `updated_by`

Use indexes for common lookups, including user subscriptions, subscription status, payment status, and reference code.

Use database constraints for valid statuses and non-negative prices. Use transactions or a carefully designed database function for approval so payment approval, subscription activation, and audit logging cannot partially succeed.

---

## 10. Supabase Security — Mandatory

Security is a core requirement, not a later enhancement.

### Row Level Security

Enable RLS on every table exposed through the Supabase API.

Policies must ensure:

- Public/anonymous users can read only active package fields intended for public display.
- Authenticated customers can read and update only their own permitted profile fields.
- Customers can read only their own subscriptions and payment submissions.
- Customers can create subscription requests only for themselves.
- Customers cannot write privileged status fields or approve payments.
- Only admins can create/update packages, review payment submissions, change subscription statuses, and read admin audit logs.
- Sensitive settings are not publicly readable.
- Audit logs cannot be edited by customers.

If necessary, expose a limited public view for active packages rather than granting broad table access.

### Storage

- Create a **private** bucket for payment proofs.
- Do not use public bucket URLs for receipts.
- Use a path structure such as `user-id/subscription-id/random-file-name`.
- Validate ownership and permissions before upload and before generating signed URLs.
- Restrict file size and MIME types (allow common image formats such as JPEG, PNG, and WebP; optionally PDF only if explicitly supported).
- Generate random filenames; do not trust user-supplied filenames.
- Do not allow SVG or executable files as payment proof.
- Ensure a customer cannot access another customer's proof.

### Secrets

Use server-only environment variables for privileged keys. Never prefix secrets with `NEXT_PUBLIC_`.

Create `.env.example` with placeholders only, such as:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Use the current Supabase publishable/anon key conventions supported by the installed SDK, and document any naming difference. The service role key must only be used in trusted server-side code and only when necessary.

---

## 11. Email Notifications

Create responsive, branded email templates for:

1. Payment proof received — awaiting verification.
2. Payment approved — subscription marked active in Fiber Link.
3. Payment rejected — include the admin's reason if provided and next steps.
4. Optional subscription request created.

Email requirements:

- Send only from server-side code.
- Validate the recipient email.
- Do not send duplicate emails on repeated requests or retries.
- Log delivery failures safely without exposing secrets or payment proof.
- Do not block a successful database transaction because an email provider is temporarily unavailable; record the notification failure and provide a retry strategy.
- Use a configurable sender identity.
- Include English and Roman Urdu versions based on the customer's preference.

If Resend credentials are missing, implement a development-safe email adapter that logs a clearly marked preview to the server console. Never claim a real email was sent in development mode.

---

## 12. Validation and Error Handling

Use Zod schemas on the server for all important input.

Validate:

- Name and phone number
- Email
- Installation address and city
- Package ID and active status
- Payment amount
- Payment method
- Transaction reference
- Uploaded file MIME type and size
- Admin approval/rejection input

For Pakistani phone numbers, accept common local formats and normalize consistently; do not reject valid numbers just because they are not in one exact display format.

Provide helpful user-facing messages in both languages. Never expose raw database errors, stack traces, service keys, or internal implementation details.

Use rate limiting or abuse protection for authentication-sensitive and upload/submit endpoints where appropriate.

---

## 13. Architecture and Code Organization

Keep the project modular and easy for a beginner to understand. Suggested structure:

```text
src/
  app/
    (public)/
      page.tsx
      packages/
      about/
      contact/
    (auth)/
      login/
      signup/
      forgot-password/
    dashboard/
      page.tsx
      subscriptions/
      payments/
      profile/
    admin/
      page.tsx
      packages/
      subscriptions/
      payments/
      customers/
      settings/
    api/
      webhooks/
  components/
    ui/
    layout/
    packages/
    dashboard/
    admin/
    forms/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    auth/
    email/
    i18n/
    validations/
    permissions/
    utils/
  types/
supabase/
  migrations/
  seed.sql
public/
README.md
.env.example
```

Adjust the structure if the installed Next.js version recommends a different convention, but keep concerns separated.

Rules:

- No giant page components.
- Reuse UI components and validation schemas.
- Keep database access and business logic out of presentational components.
- Use typed database models; generate Supabase types if practical.
- Keep admin and customer layouts separate.
- Use server-side authorization for every protected operation.
- Use pagination for admin/customer lists.
- Add loading, empty, error, and success states.
- Avoid overengineering, microservices, and unnecessary paid services.

---

## 14. Testing and Quality Gates

Set up the appropriate test tools for the chosen stack.

At minimum, test:

### Authentication and authorization

- Customer can sign up and sign in.
- Signed-out users cannot access protected routes.
- Customer A cannot view Customer B's subscription or payment proof.
- Customer cannot access admin routes or perform admin actions.
- Customer cannot assign themselves the admin role.

### Subscription and payment workflow

- Customer can create a subscription for an active package.
- Inactive package cannot be newly subscribed to.
- Customer can upload an allowed proof file.
- Disallowed file types and oversized files are rejected.
- Uploading proof does not activate the subscription.
- Only an admin can approve/reject payment.
- Approval activates the subscription exactly once.
- Rejection leaves the subscription inactive and records the reason.
- Customer sees the correct status.
- Email failure does not corrupt the payment/subscription state.

### General quality

- `npm run lint`
- `npm run typecheck` (add this script)
- `npm run build`
- Unit/integration tests for critical status transitions and permission helpers
- Responsive checks for mobile and desktop
- Keyboard navigation and accessible form labels

Fix all errors found by these checks. If an external service prevents a test, document that limitation precisely.

---

## 15. Performance, Reliability, and Cost

- Use Supabase and Next.js without adding unnecessary infrastructure.
- Fetch public package data efficiently.
- Use pagination for large lists.
- Add database indexes for common filters.
- Optimize images and avoid oversized uploads.
- Use caching only for public, non-sensitive data.
- Never cache private customer or admin data in a shared cache.
- Avoid expensive polling; use refresh/revalidation or Supabase Realtime only if genuinely useful.
- Keep logs free of passwords, tokens, full payment details, and private proof URLs.
- Include graceful error states for Supabase and email-provider outages.

---

## 16. Build Phases — Follow in Order

Do not try to build every feature in one giant unverified step.

### Phase 1 — Repository and foundation

- Inspect repository.
- Initialize/confirm Next.js, TypeScript, Tailwind, and component setup.
- Create app layout, theme, navigation, responsive shell.
- Add `.env.example` and beginner-friendly README.
- Run lint, typecheck, and build.

**Gate:** App starts locally and builds successfully.

### Phase 2 — Supabase foundation

- Configure Supabase browser and server clients using current recommended patterns.
- Add SQL migrations, constraints, indexes, and RLS policies.
- Add generated or maintained TypeScript database types.
- Add a safe admin bootstrap procedure.
- Document Supabase project setup.

**Gate:** Migrations apply; RLS rules are reviewed and tested.

### Phase 3 — Authentication and roles

- Build signup, login, logout, password reset.
- Create profile handling.
- Implement secure server-side role checks.
- Protect dashboard and admin routes.

**Gate:** Customer/admin access tests pass.

### Phase 4 — Public website and packages

- Build homepage, package list/detail, about, and contact.
- Build English/Roman Urdu switcher.
- Load active packages from Supabase.
- Build responsive package cards.

**Gate:** Public pages work with real database package data.

### Phase 5 — Customer subscription flow

- Build subscription form.
- Save package snapshot and customer details.
- Display configurable payment instructions.
- Create private Storage bucket and secure proof upload.
- Save payment submission and status.
- Build customer dashboard and status tracking.

**Gate:** Customer can submit proof; subscription remains inactive pending review.

### Phase 6 — Admin dashboard and review

- Build admin overview and protected management pages.
- Build package management.
- Build payment review queue and secure proof preview.
- Implement atomic approval/rejection flow and audit logs.

**Gate:** Only admins can approve/reject; state changes are correct and auditable.

### Phase 7 — Email notifications

- Integrate transactional email provider.
- Build bilingual templates.
- Add failure handling and duplicate-send protection.

**Gate:** Test emails are received in configured environment; development mode is clearly identified.

### Phase 8 — Final QA and deployment preparation

- Run all tests, lint, typecheck, and production build.
- Review RLS and Storage policies.
- Check mobile responsiveness and accessibility.
- Remove demo data or label it clearly.
- Finish README with exact setup/deploy steps.

**Gate:** No known critical security or build errors remain.

---

## 17. Acceptance Criteria

The project is complete only when all of the following are true:

- [ ] Fiber Link public website is responsive and professional.
- [ ] English and Roman Urdu modes work across the customer journey.
- [ ] Customer signup, login, logout, and password recovery work.
- [ ] Customer can browse active packages and create a subscription request.
- [ ] Payment instructions are configurable, not hardcoded invented details.
- [ ] Customer can upload payment proof to private storage.
- [ ] Customer receives a payment-submission confirmation when email is configured.
- [ ] Uploading proof does not activate a subscription.
- [ ] Admin dashboard is protected by server-side authorization.
- [ ] Admin can manage packages and review payment submissions.
- [ ] Admin approval activates the app subscription and records who approved it and when.
- [ ] Admin rejection records a reason and does not activate the subscription.
- [ ] Customer can track their own request status.
- [ ] RLS and Storage access rules prevent cross-customer data access.
- [ ] Audit log records sensitive admin decisions.
- [ ] `.env.example` contains placeholders, not secrets.
- [ ] README explains setup, migrations, first admin creation, local development, and deployment.
- [ ] Lint, typecheck, tests, and production build pass, or any external blocker is explicitly documented.

---

## 18. Final Instruction

Start by inspecting the repository. Then present a concise plan and implement **Phase 1**. Continue through the phases in order, validating each gate before moving on.

When you need business-specific information that has not been supplied (real package prices, payment account details, contact numbers, coverage areas, support hours, company address, or logo), create configurable placeholders and list exactly what the owner must provide. Do not invent business facts.

Keep explanations beginner-friendly. Make secure defaults the easiest path. Build a real, working Fiber Link application.
