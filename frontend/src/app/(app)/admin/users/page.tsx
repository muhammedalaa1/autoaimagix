import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { UsersTable } from "@/components/admin/users-table";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader title="Users" description="Everyone with an account, and how many notes they have." />
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <AdminOnly>
          <UsersTable />
        </AdminOnly>
      </Suspense>
    </>
  );
}

// Server-side gate so non-admins never receive this page. The API also
// returns 403 on /users for non-admins, so this isn't the only line of defence.
async function AdminOnly({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role !== "admin") notFound();
  return children;
}
