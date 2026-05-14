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
  unexpected_failure: NETWORK,
};

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
    return CODE_MESSAGES[errorCode];
  }

  if (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("failed to fetch")
  ) {
    return NETWORK;
  }

  if (message.includes("invalid login credentials")) {
    return GENERIC_SIGN_IN;
  }

  switch (context) {
    case "sign_in":
      return GENERIC_SIGN_IN;
    case "sign_up":
      return GENERIC_SIGN_UP;
    case "otp":
      return "We couldn't send or verify that link. Check the email address and try again.";
    case "password_reset":
      return "We couldn't send a reset link right now. Try again shortly.";
    case "update_password":
      return "We couldn't update your password. Sign in again and retry, or request a new reset link.";
    default:
      return "Something went wrong. Please try again.";
  }
}
