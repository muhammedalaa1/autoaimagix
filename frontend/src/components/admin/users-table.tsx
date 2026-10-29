"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/error-state";
import { RoleBadge } from "@/components/role-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getErrorMessage } from "@/lib/api/client";
import { usersApi } from "@/lib/api/endpoints";
import { formatDate } from "@/lib/format";

export function UsersTable() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: usersApi.list,
  });

  if (isPending) return <Skeleton className="h-64 rounded-xl" />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />;

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Notes</TableHead>
            <TableHead className="text-right">Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{user.notesCount}</TableCell>
              <TableCell className="text-right text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
