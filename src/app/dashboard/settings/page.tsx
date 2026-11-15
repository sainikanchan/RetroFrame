"use client";

import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { user, isSupabaseConfigured, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl">Account Settings</h1>
      <p className="text-sm text-ink-soft">Manage your RetroFrame account.</p>

      <div className="mt-8 flex flex-col gap-5 rounded-lg border border-line bg-paper p-5">
        <div>
          <Label>Display name</Label>
          <Input className="mt-1.5" defaultValue={user?.name || ""} placeholder="Your name" disabled={!isSupabaseConfigured} />
        </div>
        <div>
          <Label>Email</Label>
          <Input className="mt-1.5" defaultValue={user?.email || ""} placeholder="you@example.com" disabled />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-xs text-ink-soft">Switch the whole app to darkroom mode</p>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
        </div>
        {user?.isGuest && (
          <p className="rounded-md border border-line bg-paper-dim p-3 text-xs text-ink-soft">
            You&apos;re in guest mode — projects are saved to this browser only. Sign up to sync across devices.
          </p>
        )}
        <Button variant="destructive" className="w-fit" onClick={() => signOut()}>Sign out</Button>
      </div>
    </div>
  );
}
