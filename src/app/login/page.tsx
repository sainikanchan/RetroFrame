"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithPassword, signInWithGoogle, continueAsGuest, isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signInWithPassword(email, password);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper-dim/40 px-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-paper p-8 polaroid-shadow">
        <Link href="/" className="mx-auto flex w-fit"><Logo /></Link>
        <h1 className="mt-6 font-display text-2xl">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-soft">Sign in to sync your Polaroids everywhere.</p>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-md border border-line bg-paper-dim p-3 text-xs text-ink-soft">
            Supabase isn&apos;t connected yet, so email/Google sign-in are disabled in this preview. Use Guest mode
            below — see README to connect your own Supabase project.
          </p>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div>
            <Label>Email</Label>
            <Input className="mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!isSupabaseConfigured} />
          </div>
          <div>
            <Label>Password</Label>
            <Input className="mt-1.5" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={!isSupabaseConfigured} />
          </div>
          <Button type="submit" disabled={busy || !isSupabaseConfigured}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-ink-soft">
          <div className="h-px flex-1 bg-line" /> or <div className="h-px flex-1 bg-line" />
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="outline" disabled={!isSupabaseConfigured} onClick={() => signInWithGoogle().catch((e) => toast.error(e.message))}>
            Continue with Google
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              continueAsGuest();
              router.push("/dashboard");
            }}
          >
            Continue as Guest
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-ink-soft">
          No account? <Link href="/signup" className="underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
