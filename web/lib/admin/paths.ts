/**
 * Root-absolute admin URLs only.
 * Never use segments like `admin/login` without a leading `/` — under `/admin/*` they resolve to `/admin/admin/login`.
 */
export const ADMIN_LOGIN_PATH = "/admin/login" as const;
export const ADMIN_HOME_PATH = "/admin" as const;

/** True only for the exact admin home route — avoids matching every /admin/* path. */
export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === ADMIN_HOME_PATH) {
    return pathname === ADMIN_HOME_PATH || pathname === `${ADMIN_HOME_PATH}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
