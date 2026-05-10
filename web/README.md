This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment (`web/`)

Copy `.env.example` to `.env.local` and fill in real keys (`.env.local` is gitignored).

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable client key (or set `NEXT_PUBLIC_SUPABASE_ANON_KEY` JWT instead) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy anon JWT from dashboard if you are not using publishable keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; never expose to the client |
| `RESEND_API_KEY` | Transactional email (when wired) |
| `ADMIN_SEED_EMAIL` | Optional note for which account you promote to admin |

Supabase SSR helpers live in `utils/supabase/` and root `middleware.ts` refreshes the session cookie. Browser client: `@/utils/supabase/client`; server: `@/utils/supabase/server` (`createClient()`).

## First admin user (both strategies)

1. **Manual (Supabase Dashboard)** — After signup: **Authentication → Users**, note the user id → **Table Editor → `profiles`** → set **`role`** to **`admin`**.
2. **Seed SQL** — Edit the email in `supabase/seed-first-admin.sql`, then run it in **SQL Editor**.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
