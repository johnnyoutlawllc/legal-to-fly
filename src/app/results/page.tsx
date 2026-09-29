"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/lib/auth";
import { loadExams } from "@/lib/mastery";
import { AREA_TITLES, PASS_PERCENT, formatClock } from "@/lib/session";
import { loadTestAttempts, syncTestAttempts, type TestAttempt } from "@/lib/test-attempts";

export default function ResultsPage() {
  const { user, loading } = useAuth();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [older, setOlder] = useState<{ date: string; pct: number }[]>([]);
  const [syncError, setSyncError] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setAttempts(loadTestAttempts());
      setOlder(loadExams());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void syncTestAttempts(user.id)
      .then((merged) => {
        if (!cancelled) {
          setAttempts(merged);
          setSyncError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setSyncError(true);
      });
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Legal<span className="text-[var(--accent)]">to</span>Fly
          </Link>
          <AuthButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:py-14">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--accent)]">Your progress</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Test results</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          Each completed practice session and mock exam appears here. Results save in this browser.
          {user ? " They also sync to your account." : " Sign in to keep them across devices."}
        </p>
        {syncError && <p className="mt-3 text-sm text-[var(--wrong)]">Account sync is unavailable right now. Your browser copy is still here.</p>}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/practice" className="rounded-lg bg-[var(--accent)] px-5 py-3 font-medium text-black">Practice questions</Link>
          <Link href="/exam" className="rounded-lg border border-[var(--border)] px-5 py-3 font-medium hover:bg-[var(--surface)]">Take a mock exam</Link>
        </div>

        {attempts.length === 0 && !loading ? (
          <p className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--muted)]">
            No completed tests saved yet. Finish a practice session or mock exam to start your history.
          </p>
        ) : (
          <ol className="mt-10 space-y-4">
            {attempts.map((attempt) => <AttemptCard key={attempt.id} attempt={attempt} />)}
          </ol>
        )}

        {older.length > 0 && (
          <section className="mt-12 border-t border-[var(--border)] pt-8">
            <h2 className="text-xl font-semibold">Earlier mock scores</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Scores saved before detailed attempt history was added. Dates and percentages were the only details recorded then.</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {older.map((record, index) => <li key={`${record.date}-${index}`}>{record.date} · {record.pct}%</li>)}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function AttemptCard({ attempt }: { attempt: TestAttempt }) {
  const date = new Date(attempt.completedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  const title = attempt.kind === "mock"
    ? "Mock exam"
    : attempt.area ? `${AREA_TITLES[attempt.area]} practice` : "Practice session";
  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{date}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{attempt.pct}%</p>
          <p className={`text-sm ${attempt.pct >= PASS_PERCENT ? "text-[var(--correct)]" : "text-[var(--wrong)]"}`}>
            {attempt.correct}/{attempt.total} correct · {attempt.pct >= PASS_PERCENT ? "Pass" : "Below 70%"}
          </p>
        </div>
      </div>
      {attempt.elapsedSeconds !== null && <p className="mt-3 text-sm text-[var(--muted)]">Time used: {formatClock(attempt.elapsedSeconds)}</p>}
      <details className="mt-4 border-t border-[var(--border)] pt-4">
        <summary className="cursor-pointer font-medium text-[var(--accent)]">Area breakdown and missed ACS codes</summary>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {Object.entries(attempt.byArea).map(([area, score]) => (
            <li key={area} className="text-[var(--muted)]">{AREA_TITLES[area] ?? area}: {score.right}/{score.total}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[var(--muted)]">
          {attempt.missedCodes.length
            ? `Missed: ${attempt.missedCodes.map(({ code, count }) => `${code}${count > 1 ? ` ×${count}` : ""}`).join(", ")}`
            : "No missed ACS codes."}
        </p>
      </details>
    </li>
  );
}
