import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/session";
import { UserProvider } from "@/lib/auth/user-context";

// The session is request-time data, so it's resolved inside a Suspense boundary
// (required with Cache Components) instead of at the top level of the layout.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <UserProvider user={user}>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </UserProvider>
  );
}

function AppShellSkeleton() {
  return (
    <>
      <div className="h-14 border-b" />
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    </>
  );
}
