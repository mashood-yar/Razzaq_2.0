# Razzaq_2.0

**Secrets:** Copy `web/.env.example` to `web/.env.local` locally and fill in values. Never commit `.env` files.

## Deploy on Vercel (GitHub)

The Next.js app lives in **`web/`**, but Git checks out the **repository root**. This repo ships:

- **`vercel.json`** at the repo root — `installCommand: npm ci`, `buildCommand: npm run build`, Next.js framework, `outputDirectory` unset (not `public`).
- **`package.json`** at the repo root — `postinstall` runs `npm ci --prefix web`; **`build`** runs `next build` in `web` then copies **`web/.next` → `.next`** via **`scripts/copy-next-build.mjs`** so Vercel’s Next preset sees the output at the root.
- **`next`** as a root **devDependency** so Vercel can detect the Next.js version when the root `package.json` is the install context.

In **Vercel → Project → Settings → Build & Deployment**:

- **Root Directory:** leave **empty** or **`.`** (repository root). Do **not** set it to `web` unless you remove the root `vercel.json` workflow and build only inside `web`.
- **Framework preset:** Next.js (usually auto-detected).
- **Output Directory:** leave empty for Next.js.

Push to GitHub; Production should build with the same commands as local:

```bash
npm ci
npm run build
```

(Local development can stay `npm run dev` / `npm run build` from the repo root — those delegate to `web/`.)
