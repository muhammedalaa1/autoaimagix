import { redirect } from "next/navigation";
import { DEFAULT_AUTHED_ROUTE } from "@/lib/constants";

// Visitors without a session are sent to /login by src/proxy.ts before this runs.
export default function Home() {
  redirect(DEFAULT_AUTHED_ROUTE);
}
