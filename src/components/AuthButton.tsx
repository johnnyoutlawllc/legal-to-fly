"use client";

import { useAuth } from "@/lib/auth";

export function AuthButton() {
  const { user, loading, displayName, signInWithGoogle, signOut } = useAuth();

  if (loading) return <span className="h-9 w-28" />;

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="h-9 cursor-pointer rounded-lg border border-[var(--border)] px-4 text-sm font-medium transition-colors hover:bg-[var(--surface)]"
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <span className="flex items-center gap-3 text-sm">
      <span className="text-[var(--muted)]">
        Hey, <span className="text-[var(--text)]">{displayName}</span>
      </span>
      <button
        onClick={signOut}
        className="cursor-pointer text-[var(--muted)] transition-colors hover:text-[var(--text)]"
      >
        Sign out
      </button>
    </span>
  );
}
