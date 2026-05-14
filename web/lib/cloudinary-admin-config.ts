/** Admin upload routes ONLY read credentials from these env vars (no CLOUDINARY_URL, no hardcoded keys). */

export type CloudinaryAdminCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export const CLOUDINARY_ADMIN_ENV_MISSING_MESSAGE =
  "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, plus CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in web/.env.local (see web/.env.example). HTTP 401 Invalid api_key means the key or secret does not match the cloud name — copy API Key + API Secret from the same dashboard product.";

/** Resolve credentials strictly from env; used for guards before `cloudinary.config({ ... })`. */
export function getCloudinaryAdminCredentials():
  | { ok: true; credentials: CloudinaryAdminCredentials }
  | { ok: false; error: string } {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (cloudName && apiKey && apiSecret) {
    return { ok: true, credentials: { cloudName, apiKey, apiSecret } };
  }
  return { ok: false, error: CLOUDINARY_ADMIN_ENV_MISSING_MESSAGE };
}

export function cloudinaryErrorMessage(error: unknown, fallback = "Failed to upload image"): string {
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    const nested = e.error;
    if (nested && typeof nested === "object" && "message" in nested) {
      const m = (nested as { message: unknown }).message;
      if (typeof m === "string" && m.trim()) return m.trim();
    }
    if (typeof e.message === "string" && e.message.trim()) {
      const msg = e.message.trim();
      if (typeof e.http_code === "number") return `${msg} (HTTP ${e.http_code})`;
      return msg;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
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
