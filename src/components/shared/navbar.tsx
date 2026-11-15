"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- standard next-themes hydration-safe mount guard
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-paper/90 px-5 backdrop-blur sm:px-8">
      <Link href="/">
        <Logo />
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-ink-soft md:flex">
        <Link href="/create" className="hover:text-ink">Create</Link>
        <Link href="/gallery" className="hover:text-ink">Gallery</Link>
        <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
      </nav>
      <div className="flex items-center gap-2">
        {mounted && (
          <Button size="icon" variant="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        )}
        {user ? (
          <Button asChild size="sm" variant="accent">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        ) : (
          <Button asChild size="sm" variant="accent">
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
