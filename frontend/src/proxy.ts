import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

/**
 * Optimistic route guard: bounces visitors with no session cookie to /login
 * before rendering. It only checks the cookie exists — the real verification
 * happens server-side via /auth/me (see lib/auth/session.ts) and, ultimately,
 * in the API, which authorizes every request on its own.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(AUTH_COOKIE_NAME)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  const destination = request.nextUrl.pathname + request.nextUrl.search;
  if (destination !== "/") loginUrl.searchParams.set("next", destination);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/", "/notes/:path*", "/weather/:path*", "/admin/:path*"],
};
