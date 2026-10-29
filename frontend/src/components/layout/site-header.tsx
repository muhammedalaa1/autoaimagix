"use client";

import { CloudSun, NotebookPen, StickyNote, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/auth/user-context";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

const NAV_ITEMS = [
  { href: "/notes", label: "Notes", icon: StickyNote, adminOnly: false },
  { href: "/weather", label: "Weather", icon: CloudSun, adminOnly: false },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
] as const;

export function SiteHeader() {
  const user = useUser();
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user.role === "admin");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <Link href="/notes" className="flex items-center gap-2 font-semibold">
          <NotebookPen className="size-5" />
          <span className="hidden sm:inline">Autoaimagix Notes</span>
        </Link>

        <nav className="flex items-center gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
