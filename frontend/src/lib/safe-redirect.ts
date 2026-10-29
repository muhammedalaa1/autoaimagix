import { DEFAULT_AUTHED_ROUTE } from "./constants";

/**
 * Only allow same-site relative paths as post-login destinations, so
 * `/login?next=https://evil.com` (or `//evil.com`) can't be used as an open redirect.
 */
export function safeRedirectPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return DEFAULT_AUTHED_ROUTE;
  }
  return next;
}
