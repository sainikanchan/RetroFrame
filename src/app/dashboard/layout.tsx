"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { FolderHeart, Heart, Share2, Clock, Settings, Plus, LogOut } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "My Projects", icon: FolderHeart, exact: true },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/shared", label: "Shared Projects", icon: Share2 },
  { href: "/dashboard/capsules", label: "Memory Capsules", icon: Clock },
  { href: "/dashboard/settings", label: "Account Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-dvh bg-paper">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-paper-dim/30 p-5">
        <Link href="/"><Logo /></Link>
        <Button asChild className="mt-6" variant="accent">
          <Link href="/create"><Plus className="size-4" /> New Polaroid</Link>
        </Button>
        <nav className="mt-8 flex flex-col gap-1">
          {LINKS.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-safelight text-sprocket" : "text-ink-soft hover:bg-paper-dim"
                )}
              >
                <l.icon className="size-4" /> {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-line pt-4">
          <p className="truncate text-xs text-ink-soft">{user?.isGuest ? "Guest session" : user?.email || user?.name}</p>
          <Button size="sm" variant="ghost" onClick={() => signOut()}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
