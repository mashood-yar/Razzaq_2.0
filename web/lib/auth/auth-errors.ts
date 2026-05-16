/**
 * Maps Supabase Auth (GoTrue) error codes/messages to user-facing copy.
 * @see https://github.com/supabase/auth-js/blob/master/src/lib/errors.ts
 */

const GENERIC_SIGN_IN =
  "We couldn't sign you in. Please check your email and password and try again.";
const GENERIC_SIGN_UP =
  "We couldn't create your account. Please try again or use a different sign-up method.";
const NETWORK =
  "Connection problem. Check your internet connection and try again.";
/** GoTrue uses `unexpected_failure` for many non-network issues; don't blame the user's internet. */
const SERVICE_TRY_AGAIN =
  "We couldn't reach the sign-in service. Try again in a moment.";

/** Known `AuthError` / REST `error_code` values from Supabase Auth. */
const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: GENERIC_SIGN_IN,
  invalid_grant: GENERIC_SIGN_IN,
  email_not_confirmed:
    "Please confirm your email using the link we sent you, then try signing in.",
  user_not_found: GENERIC_SIGN_IN,
  otp_expired:
    "This sign-in link has expired. Request a new magic link from the login page.",
  flow_state_expired:
    "This sign-in link has expired. Request a new one and try again.",
  same_password: "Please choose a new password that differs from your current one.",
  weak_password:
    "That password is too weak. Use at least 8 characters with letters and numbers.",
  signup_disabled:
    "New registrations are temporarily unavailable. Please try again later.",
  user_already_exists:
    "An account with this email already exists. Sign in instead, or reset your password.",
  over_request_rate_limit:
    "Too many attempts from this location. Wait a minute and try again.",
  unexpected_failure: SERVICE_TRY_AGAIN,
};

function looksLikeConnectivityIssue(messageLower: string): boolean {
  return (
    messageLower.includes("fetch failed") ||
    messageLower.includes("failed to fetch") ||
    messageLower.includes("networkerror") ||
    messageLower.includes("load failed") ||
    messageLower.includes("econnrefused") ||
    messageLower.includes("enotfound") ||
    messageLower.includes("getaddrinfo") ||
    messageLower.includes("etimedout") ||
    messageLower.includes("eai_again") ||
    messageLower.includes("socket hang up") ||
    messageLower.includes("connect econnrefused")
  );
}

function normalize(raw: unknown): string {
  if (raw instanceof Error && raw.message) return raw.message;
  return String(raw ?? "").trim();
}

/**
 * Parses `error_description` pairs like `error_code=invalid_credentials`.
 */
function codeFromSupabaseDescription(message: string): string | undefined {
  const m = /\berror_code=([a-z0-9_]+)/i.exec(message);
  return m ? m[1].toLowerCase() : undefined;
}

export function friendlyAuthMessage(
  error: unknown,
  context: "sign_in" | "sign_up" | "otp" | "password_reset" | "update_password",
): string {
  const message = normalize(error).toLowerCase();
  const fromDesc = normalize(error);
  const errorCode =
    typeof (error as { code?: string })?.code === "string"
      ? ((error as { code: string }).code || "").toLowerCase()
      : codeFromSupabaseDescription(fromDesc);

  if (errorCode && CODE_MESSAGES[errorCode]) {
    return withDevDetail(CODE_MESSAGES[errorCode], error);
  }

  if (looksLikeConnectivityIssue(message)) {
    return withDevDetail(NETWORK, error);
  }

  if (message.includes("invalid login credentials")) {
    return withDevDetail(GENERIC_SIGN_IN, error);
  }

  let fallback: string;
  switch (context) {
    case "sign_in":
      fallback = GENERIC_SIGN_IN;
      break;
    case "sign_up":
      fallback = GENERIC_SIGN_UP;
      break;
    case "otp":
      fallback =
        "We couldn't send or verify that link. Check the email address and try again.";
      break;
    case "password_reset":
      fallback = "We couldn't send a reset link right now. Try again shortly.";
      break;
    case "update_password":
      fallback =
        "We couldn't update your password. Sign in again and retry, or request a new reset link.";
      break;
    default:
      fallback = "Something went wrong. Please try again.";
  }
  return withDevDetail(fallback, error);
}

/** In development, append the upstream message so misclassified errors are visible. */
function withDevDetail(friendly: string, error: unknown): string {
  if (process.env.NODE_ENV !== "development") return friendly;
  const raw = normalize(error);
  if (!raw || friendly.includes(raw)) return friendly;
  return `${friendly} [dev: ${raw}]`;
}
