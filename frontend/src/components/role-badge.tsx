import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/api/types";

export function RoleBadge({ role }: { role: Role }) {
  if (role === "admin") {
    return (
      <Badge>
        <ShieldCheck />
        Admin
      </Badge>
    );
  }
  return <Badge variant="secondary">User</Badge>;
}
