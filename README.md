# Razzaq_2.0

**Secrets:** Copy `web/.env.example` to `web/.env.local` locally and fill in values. Never commit `.env` files.

## Deploy on Vercel (GitHub)

The Next.js app is **`web/`**. Vercel must use that folder as the project root.

1. **Vercel → Project → Settings → Build & Deployment → Root Directory** → set **`web`** (browse and select the folder), then **Save**.
2. **Framework preset:** Next.js (auto-detected from `web/package.json`).
3. **Install Command:** leave default (`npm install` / `npm ci` in `web`).
4. **Build Command:** leave default (`npm run build` in `web`).
5. **Output Directory:** leave empty for Next.js.

Repo root `package.json` only helps **local** workflows (`npm run dev` / `npm run build` from the monorepo root). It is **not** used when Root Directory is `web`.

CLI deploy from the linked project:

```powershell
cd web
npx vercel deploy --prod --yes
```

Or link once with Root Directory `web` in the dashboard and rely on **Git push** to deploy.
