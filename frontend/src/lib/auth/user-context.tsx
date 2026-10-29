"use client";

import { createContext, use, type ReactNode } from "react";
import type { User } from "@/lib/api/types";

const UserContext = createContext<User | null>(null);

export function UserProvider({ user, children }: { user: User; children: ReactNode }) {
  return <UserContext value={user}>{children}</UserContext>;
}

/** The signed-in user, resolved on the server by the (app) layout. UI-only — the API enforces access. */
export function useUser() {
  const user = use(UserContext);
  if (!user) throw new Error("useUser must be used inside <UserProvider>");
  return user;
}
