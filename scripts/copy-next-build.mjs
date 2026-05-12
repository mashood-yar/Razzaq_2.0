/**
 * Vercel clones the monorepo at repo root; Next emits web/.next.
 * Copy to ./.next so the Next.js deployment preset picks up the build.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "web", ".next");
const dest = path.join(root, ".next");

if (!fs.existsSync(src)) {
  console.error("copy-next-build: missing", src);
  process.exit(1);
}
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log("copy-next-build: web/.next -> .next");
