import { v2 as cloudinary } from "cloudinary";

/** Admin upload routes read credentials from env vars or `CLOUDINARY_URL` (never hardcoded). */

export type CloudinaryAdminCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export const CLOUDINARY_ADMIN_ENV_MISSING_MESSAGE =
  "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME), CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in web/.env.local — or set CLOUDINARY_URL=cloudinary://key:secret@cloud_name. Copy all three from the same Cloudinary dashboard product (Settings → API).";

const CLOUDINARY_INVALID_SIGNATURE_HINT =
  "Invalid Signature usually means CLOUDINARY_API_SECRET is wrong or has stray quotes/newlines. In Vercel and web/.env.local, paste the API Secret from Cloudinary Dashboard → Settings → API with no surrounding quotes, then redeploy/restart.";

/** Strip BOM, newlines, and wrapping quotes — common .env / Vercel paste issues. */
export function sanitizeCloudinaryEnvValue(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/\r?\n/g, "")
    .replace(/^\uFEFF/, "")
    .replace(/^["']+|["']+$/g, "")
    .trim();
}

function parseCloudinaryUrl(raw: string | undefined): CloudinaryAdminCredentials | null {
  const url = sanitizeCloudinaryEnvValue(raw);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "cloudinary:") return null;
    const cloudName = parsed.hostname;
    const apiKey = decodeURIComponent(parsed.username);
    const apiSecret = decodeURIComponent(parsed.password);
    if (!cloudName || !apiKey || !apiSecret) return null;
    return { cloudName, apiKey, apiSecret };
  } catch {
    return null;
  }
}

function readIndividualCloudinaryEnv(): Partial<CloudinaryAdminCredentials> {
  const cloudName =
    sanitizeCloudinaryEnvValue(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) ||
    sanitizeCloudinaryEnvValue(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = sanitizeCloudinaryEnvValue(process.env.CLOUDINARY_API_KEY);
  const apiSecret = sanitizeCloudinaryEnvValue(process.env.CLOUDINARY_API_SECRET);
  return { cloudName, apiKey, apiSecret };
}

/**
 * Prefer discrete env vars when all three are set (avoids CLOUDINARY_URL vs var mismatch).
 * Fall back to CLOUDINARY_URL when individual keys are incomplete (typical Vercel setup).
 */
export function getCloudinaryAdminCredentials():
  | { ok: true; credentials: CloudinaryAdminCredentials }
  | { ok: false; error: string } {
  const fromVars = readIndividualCloudinaryEnv();
  if (fromVars.cloudName && fromVars.apiKey && fromVars.apiSecret) {
    return {
      ok: true,
      credentials: {
        cloudName: fromVars.cloudName,
        apiKey: fromVars.apiKey,
        apiSecret: fromVars.apiSecret,
      },
    };
  }

  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  if (fromUrl) {
    return { ok: true, credentials: fromUrl };
  }

  return { ok: false, error: CLOUDINARY_ADMIN_ENV_MISSING_MESSAGE };
}

/** Apply sanitized credentials to the Cloudinary SDK (server-side signed upload). */
export function configureCloudinaryAdmin(credentials: CloudinaryAdminCredentials): void {
  // Reset SDK singleton so a stale CLOUDINARY_URL from process.env cannot leak partial config.
  cloudinary.config(true);
  cloudinary.config({
    cloud_name: credentials.cloudName,
    api_key: credentials.apiKey,
    api_secret: credentials.apiSecret,
    secure: true,
  });
}

export function cloudinaryErrorMessage(error: unknown, fallback = "Failed to upload image"): string {
  let message = fallback;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    const nested = e.error;
    if (nested && typeof nested === "object" && "message" in nested) {
      const m = (nested as { message: unknown }).message;
      if (typeof m === "string" && m.trim()) message = m.trim();
    } else if (typeof e.message === "string" && e.message.trim()) {
      message = e.message.trim();
      if (typeof e.http_code === "number") message = `${message} (HTTP ${e.http_code})`;
    }
  } else if (error instanceof Error && error.message) {
    message = error.message;
  }

  if (/invalid signature/i.test(message)) {
    return `${message}. ${CLOUDINARY_INVALID_SIGNATURE_HINT}`;
  }
  return message;
}

/** Structured fields for logs — never logs secrets or full API key */
export function cloudinaryErrorDiag(error: unknown): {
  message: string;
  httpCode?: number;
  name?: string;
} {
  const base = cloudinaryErrorMessage(error);
  let httpCode: number | undefined;
  let name: string | undefined;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    if (typeof e.http_code === "number") httpCode = e.http_code;
    else if (typeof e.http_status === "number") httpCode = e.http_status;
    if (typeof e.name === "string") name = e.name;
  }
  if (error instanceof Error) {
    name = name ?? error.name;
  }
  return { message: base, httpCode, name };
}
