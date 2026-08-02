# SchoolOS

A multi-tenant SaaS platform that gives Nigerian private schools their own branded website, admissions pipeline, results portal, and staff dashboards — on their own custom domain.

One deployment serves every school on the platform. Each school gets its own subdomain or custom domain, brand colors and logo, admin/teacher accounts, and fully separated data, all backed by a single Supabase project and a shared, restyleable design template.

"Intellect Companion Schools" is the platform's own demo/reference tenant, not the product itself — see it live to get a feel for what a school's site looks like before onboarding a real one.

## What's included

- **Public school site** — homepage, admissions (with auto-generated student IDs), news & events, academic calendar, class/exam timetables, staff directory, photo gallery, contact form, and a results portal for students/parents.
- **Admin dashboard** — manage results, admissions, students, staff, timetables, fees, messaging, and more, all scoped to that school's own data.
- **Teacher dashboard** — upload results (single, batch, or from a photo of a mark sheet), take attendance, write report card comments.
- **Platform-owner console** (`/platform`) — onboard new schools, assign subdomains/custom domains, brand colors, and logos, and create each school's first admin login.
- **Security** — hashed passwords, per-school session scoping, optional TOTP two-factor authentication, Postgres-backed rate limiting on login/result-checker endpoints, and an audit log for sensitive actions.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `SUPABASE_URL` / `SUPABASE_SECRET_KEY` (and the other variables it documents) before running — every page resolves its tenant through Supabase, so nothing renders without a working connection.

Open <http://localhost:3000> in your browser.

## Build for production

```bash
npm run build
```

## Deploy on Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Set the environment variables from `.env.example`, including `PLATFORM_ROOT_DOMAIN` once you own a real domain for wildcard subdomain routing.
4. Click **Deploy**.

## Key routes

- `/` — the current tenant's public school site (or the SchoolOS marketing landing page if no school resolves for the request's host)
- `/portal` — student/parent results portal
- `/teacher-dashboard` — teacher login and result upload
- `/admin` — school admin dashboard
- `/platform` — platform-owner console for onboarding and managing schools
