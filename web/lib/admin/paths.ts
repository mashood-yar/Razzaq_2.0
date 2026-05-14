/**
 * Root-absolute admin URLs only.
 * Never use segments like `admin/login` without a leading `/` — under `/admin/*` they resolve to `/admin/admin/login`.
 */
export const ADMIN_LOGIN_PATH = "/admin/login" as const;
export const ADMIN_HOME_PATH = "/admin" as const;
