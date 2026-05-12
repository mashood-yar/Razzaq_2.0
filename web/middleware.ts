import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/** Inline env check — middleware runs on Edge; avoid `@/` imports (Vercel bundler). */
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

function createMiddlewareSupabase(
  request: NextRequest,
  response: NextResponse,
  supabaseUrl: string,
  supabaseKey: string,
) {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
}

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
const ACCOUNT_PREFIX = "/account";
const STUDIO_PREFIX = "/studio";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value);
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createMiddlewareSupabase(request, response, url, key);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );

  if (user && isAuthPage) {
    const redirect = NextResponse.redirect(
      new URL("/account/orders", request.url),
    );
    copyCookies(response, redirect);
    return redirect;
  }

  if (!user && pathname.startsWith(ACCOUNT_PREFIX)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(login);
    copyCookies(response, redirect);
    return redirect;
  }

  const isStudioRoute =
    pathname === STUDIO_PREFIX || pathname.startsWith(`${STUDIO_PREFIX}/`);

  if (isStudioRoute) {
    if (!user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      const redirect = NextResponse.redirect(login);
      copyCookies(response, redirect);
      return redirect;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role as string | undefined;
    if (!role || !["admin", "staff"].includes(role)) {
      const redirect = NextResponse.redirect(new URL("/", request.url));
      copyCookies(response, redirect);
      return redirect;
    }
  }

  return response;
}

/**
 * Only run middleware on routes that gate or redirect based on auth.
 * Public pages (/, /shop, /products/*, …) skip this entirely so first paint never
 * blocks on a Supabase `getUser()` network round-trip — a common cause of “infinite loading”
 * when the auth request stalls or credentials are mismatched.
 */
export const config = {
  matcher: [
    "/account/:path*",
    "/login",
    "/login/:path*",
    "/register",
    "/register/:path*",
    "/forgot-password",
    "/reset-password",
    "/studio/:path*",
    "/studio",
  ],
};
