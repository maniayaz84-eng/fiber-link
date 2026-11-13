# Fiber Link

Fiber Link is a bilingual customer portal and admin dashboard for a Pakistani fiber internet provider. Customers can browse published packages, sign up, submit payment proof, and track subscription status. Authorized admins can review payment submissions, approve or reject them, and manage package content and customer records.

This project is built with Next.js, TypeScript, Tailwind CSS, Supabase, and Resend.

## Tools and accounts you need

- Node.js 20+ and npm
- A Supabase project with Postgres and Auth enabled
- A Resend account for transactional email delivery
- A GitHub account if you want to deploy with Vercel
- A local terminal such as PowerShell, Bash, or zsh

## Install dependencies

Windows PowerShell:

```powershell
cd "C:\path\to\fiber-link"
npm install
```

macOS/Linux:

```bash
cd /path/to/fiber-link
npm install
```

## Environment setup

Copy the example environment file and fill in the real values:

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Required values:

- `NEXT_PUBLIC_SUPABASE_URL`: the URL of your Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the public anon key from Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: server-only secret used for admin scripts and trusted backend tasks
- `RESEND_API_KEY`: the API key from Resend for transactional email delivery
- `EMAIL_FROM`: sender address such as `Fiber Link <noreply@yourdomain.com>`
- `NEXT_PUBLIC_SITE_URL`: public base URL used for app links, usually `http://localhost:3000` in local development

Keep the service-role and Resend keys private. Never expose them in browser code.

## Supabase setup

1. Create a Supabase project.
2. Go to Project Settings → API and copy the project URL and anon key.
3. Add the project URL and anon key to `.env.local`.
4. Apply the SQL migration file in `supabase/migrations/0001_initial_schema.sql`.
5. If you want seed data, run the script in `supabase/seed.sql`.

You can use the Supabase SQL editor or the Supabase CLI.

## Apply database migrations

Example using the Supabase CLI:

```bash
supabase db push
```

If you are using the SQL editor instead, paste the migration contents into the project SQL editor and run them manually.

## Create the first admin safely

Use an existing customer account and promote it with the helper script:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
node --loader tsx scripts/promote-admin.ts <USER_UUID>
```

If you do not already have the user UUID, you can fetch it from Supabase Auth or from your database.

## Storage bucket and policies

Create a private bucket named `payment-proof` in Supabase Storage and set the bucket to private.

Basic rules:

- Customers should only upload to their own subscription file paths.
- Admin users should be allowed to read and review approved proof files.
- Public access should be blocked.
- Restrict file types to the allowed formats and set a reasonable size limit.

For production, define explicit storage policies in Supabase using `auth.uid()` and `is_admin()` checks.

## Email setup

1. Create a Resend account and verify a sender domain or use a sandbox sender address.
2. Add `RESEND_API_KEY` and `EMAIL_FROM` to `.env.local`.
3. Confirm that the app is sending emails from trusted server-side code only.
4. Test the email flow with a real user account before production launch.

## Run locally

Windows PowerShell:

```powershell
npm run dev
```

Open: `http://localhost:3000`

## Run tests and production build

```bash
npm run test
npm run typecheck
npm run build
```

## Deploy

A straightforward deployment path:

1. Push the project to GitHub.
2. Create a Vercel project connected to the repo.
3. Add the environment variables from `.env.local` to Vercel.
4. Point the project to the production Supabase URL and keys.
5. Run the migrations in the production Supabase project.
6. Configure the custom domain and email sender if needed.

## Update business content

- Packages, prices, and availability are managed from the database or admin area.
- Payment instructions and support details should be stored in app settings or a config table.
- Translations live in `src/lib/i18n/dictionaries.ts`.
- Replace placeholder values with real data before launch.

## Common issues

- "Supabase public environment variables are missing": copy `.env.example` to `.env.local` and set the required values.
- "node not recognized": ensure Node.js is installed and available in PATH.
- Build fails in TypeScript: run `npm run typecheck` and fix the exact project errors.
- Emails not sending: confirm `RESEND_API_KEY` and `EMAIL_FROM` are set and the sender is verified.
- Admin access denied: make sure the user exists in `user_roles` with the `admin` role.

## Production notes

This project intentionally keeps a clear boundary between payment approval and real ISP provisioning. The app can mark a request as active only after an authorized admin confirms the provisioning step; the code and database are designed to make that distinction explicit.
