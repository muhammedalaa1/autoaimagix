"use client";

import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { RoleBadge } from "@/components/role-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/api/endpoints";
import { useUser } from "@/lib/auth/user-context";

export function UserMenu() {
  const user = useUser();

  const logout = useMutation({
    mutationFn: authApi.logout,
    // A full page load drops every in-memory cache (React Query + router) from this session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional hard reload
    onSuccess: () => window.location.assign("/login"),
    onError: () => toast.error("Couldn't log out. Please try again."),
  });

  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {initials}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span className="flex items-center justify-between gap-2 font-medium text-foreground">
              <span className="truncate">{user.name}</span>
              <RoleBadge role={user.role} />
            </span>
            <span className="truncate text-xs font-normal">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={logout.isPending} onClick={() => logout.mutate()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
