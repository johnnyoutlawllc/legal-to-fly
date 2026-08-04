"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/*
 * Google is the only way in: no passwords, no forms. The row in
 * `ltf.profiles` is normally created by the `on_auth_user_created_ltf`
 * trigger; the upsert below is the fallback for accounts that predate it
 * (this Supabase project is shared across all Outlaw apps, so plenty do).
 *
 * The fallback is an upsert and single-flight because getSession() and
 * onAuthStateChange() both fire on a fresh sign-in and would otherwise race
 * each other into a duplicate-key error. Same lesson as unwavering.band.
 */

type Ctx = {
  user: User | null;
  loading: boolean;
  displayName: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

function firstNameOf(user: User | null): string | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  const full =
    (typeof meta.given_name === "string" && meta.given_name) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  if (full) return full.split(/\s+/)[0];
  return user.email?.split("@")[0] ?? "you";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const ensured = useRef<Set<string>>(new Set());

  const ensureProfile = useCallback(async (u: User | null) => {
    if (!u || ensured.current.has(u.id)) return;
    ensured.current.add(u.id);
    const meta = u.user_metadata ?? {};
    await supabase.from("profiles").upsert(
      {
        id: u.id,
        display_name:
          (typeof meta.full_name === "string" && meta.full_name) ||
          (typeof meta.name === "string" && meta.name) ||
          (u.email?.split("@")[0] ?? null),
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const u = data.session?.user ?? null;
      setUser(u);
      setLoading(false);
      void ensureProfile(u);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      void ensureProfile(u);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [ensureProfile]);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
        queryParams: { prompt: "select_account" },
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      user,
      loading,
      displayName: firstNameOf(user),
      signInWithGoogle,
      signOut,
    }),
    [user, loading, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
