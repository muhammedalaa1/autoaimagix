import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { User } from "@/lib/api/types";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

/**
 * Data Access Layer: the single place the server resolves the current user.
 * It forwards the session cookie to the API's /auth/me, so the backend stays
 * the source of truth for identity and role. Wrapped in React `cache` so
 * layout + page share one lookup per request.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: { cookie: `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}` },
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Failed to load session (status ${response.status})`);

  const { data } = (await response.json()) as { data: User };
  return data;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
