export type CloudinaryAdminCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

const MISSING_CONFIG_MESSAGE =
  "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or CLOUDINARY_CLOUD_NAME, plus CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in web/.env.local, or set CLOUDINARY_URL (see web/.env.example).";

function parseCloudinaryUrl(raw: string): CloudinaryAdminCredentials | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "cloudinary:") return null;
    const apiKey = decodeURIComponent(u.username || "");
    const apiSecret = decodeURIComponent(u.password || "");
    const cloudName = (u.hostname || "").trim();
    if (!apiKey || !apiSecret || !cloudName) return null;
    return { cloudName, apiKey, apiSecret };
  } catch {
    return null;
  }
}

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

  const url = process.env.CLOUDINARY_URL?.trim();
  if (url) {
    const parsed = parseCloudinaryUrl(url);
    if (parsed) return { ok: true, credentials: parsed };
  }

  return { ok: false, error: MISSING_CONFIG_MESSAGE };
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

/** Structured fields for logs — never logs secrets */
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
