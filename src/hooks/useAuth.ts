"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface AppUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  isGuest: boolean;
}

const GUEST_KEY = "retroframe:guest-user";

function loadGuest(): AppUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(GUEST_KEY);
  return raw ? JSON.parse(raw) : null;
}

function createGuest(): AppUser {
  const user: AppUser = { id: `guest_${Date.now()}`, name: "Guest", isGuest: true };
  localStorage.setItem(GUEST_KEY, JSON.stringify(user));
  return user;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (mounted) {
          setUser(
            data.user
              ? { id: data.user.id, email: data.user.email ?? undefined, name: data.user.user_metadata?.name, isGuest: false }
              : loadGuest()
          );
          setLoading(false);
        }
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(
            session?.user
              ? { id: session.user.id, email: session.user.email ?? undefined, name: session.user.user_metadata?.name, isGuest: false }
              : loadGuest()
          );
        });
        return () => sub.subscription.unsubscribe();
      } else {
        setUser(loadGuest());
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const continueAsGuest = useCallback(() => {
    const guest = createGuest();
    setUser(guest);
    return guest;
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      if (!supabase) throw new Error("Supabase isn't configured yet. Use Guest mode, or add your project keys — see README.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    [supabase]
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string, name: string) => {
      if (!supabase) throw new Error("Supabase isn't configured yet. Use Guest mode, or add your project keys — see README.");
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (error) throw error;
    },
    [supabase]
  );

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error("Supabase isn't configured yet. Use Guest mode, or add your project keys — see README.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw error;
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(GUEST_KEY);
    setUser(null);
  }, [supabase]);

  return {
    user,
    loading,
    isSupabaseConfigured: isSupabaseConfigured(),
    continueAsGuest,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut,
  };
}
