# Intellect Schools

A Next.js website for Intellect Schools with a public landing page, student results portal, teacher dashboard, and admin dashboard.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000> in your browser.

## Build for production

```bash
npm run build
```

## Check code quality

```bash
npm run lint
```

## Deploy on Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Keep the default Next.js settings. The project requires Node.js 20.9 or newer, which is declared in `package.json`.
4. Click **Deploy**.

The main routes are:

- `/` — public school landing page
- `/portal` — student results portal demo
- `/teacher-dashboard` — teacher result upload demo
- `/admin` — admin dashboard demo
