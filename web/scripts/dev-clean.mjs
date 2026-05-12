/**
 * Stops processes listening on common Next dev ports (avoids two servers sharing one `.next`),
 * then deletes `.next`. Run before `next dev` via `npm run dev:clean`.
 */
import { rmSync } from "fs";
import { spawnSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const PORTS = [3000, 3001, 3002];

function killListenPortWindows(port) {
  const ps = `$listen = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($procId in $listen) { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue }`;
  spawnSync("powershell.exe", ["-NoProfile", "-Command", ps], {
    stdio: "inherit",
  });
}

function killListenPortUnix(port) {
  spawnSync("sh", [
    "-c",
    `lsof -ti:${port} | xargs kill -9 2>/dev/null || true`,
  ]);
}

for (const port of PORTS) {
  if (process.platform === "win32") killListenPortWindows(port);
  else killListenPortUnix(port);
}

const nextDir = join(webRoot, ".next");
if (process.platform === "win32") {
  spawnSync("cmd.exe", ["/c", "rd", "/s", "/q", nextDir], { stdio: "inherit" });
} else {
  rmSync(nextDir, { recursive: true, force: true });
}

console.log("[dev-clean] Freed ports %s and removed .next", PORTS.join(", "));
