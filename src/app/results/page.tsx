"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/lib/auth";
import { loadExams } from "@/lib/mastery";
import { AREA_TITLES, PASS_PERCENT, formatClock } from "@/lib/session";
import { loadTestAttempts, saveTestAttempt, syncTestAttempts, type TestAttempt } from "@/lib/test-attempts";

export default function ResultsPage() {
  const { user, loading } = useAuth();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [older, setOlder] = useState<{ date: string; pct: number }[]>([]);
  const [syncError, setSyncError] = useState(false);
  const [entryMessage, setEntryMessage] = useState("");

  function addEarlierResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const kind = fields.get("kind") === "mock" ? "mock" : "practice";
    const area = fields.get("area");
    const correct = Number(fields.get("correct"));
    const total = Number(fields.get("total"));
    const date = String(fields.get("date") ?? "");
    if (!Number.isInteger(correct) || !Number.isInteger(total) || total <= 0 || correct < 0 || correct > total || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setEntryMessage("Enter a valid date and a correct count between 0 and the question count.");
      return;
    }
    try {
      setAttempts(saveTestAttempt({
        id: crypto.randomUUID(),
        kind,
        completedAt: new Date(`${date}T12:00:00`).toISOString(),
        area: kind === "practice" && typeof area === "string" && area in AREA_TITLES ? area : null,
        correct,
        total,
        pct: Math.round((correct / total) * 100),
        byArea: {},
        missedCodes: [],
        elapsedSeconds: null,
      }));
      setEntryMessage("Result saved.");
      form.reset();
      if (user) {
        void syncTestAttempts(user.id)
          .then(setAttempts)
          .catch(() => setSyncError(true));
      }
    } catch {
      setEntryMessage("Could not save this result in your browser.");
    }
  }

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

        <details className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <summary className="cursor-pointer font-medium text-[var(--accent)]">Add a result from a test already in progress</summary>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">For tests opened before automatic saving was added, enter the score shown on the result screen. Only the date and score can be recovered this way.</p>
          <form onSubmit={addEarlierResult} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Test type
              <select name="kind" className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                <option value="practice">Practice session</option>
                <option value="mock">Mock exam</option>
              </select>
            </label>
            <label className="text-sm">Area, if applicable
              <select name="area" className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                <option value="">Mixed or not applicable</option>
                {Object.entries(AREA_TITLES).map(([code, title]) => <option key={code} value={code}>{title}</option>)}
              </select>
            </label>
            <label className="text-sm">Date
              <input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">Correct
                <input name="correct" type="number" required min="0" className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3" />
              </label>
              <label className="text-sm">Questions
                <input name="total" type="number" required min="1" defaultValue="20" className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3" />
              </label>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-[var(--accent)] px-5 py-3 font-medium text-black">Save result</button>
              {entryMessage && <p role="status" className="mt-2 text-sm text-[var(--muted)]">{entryMessage}</p>}
            </div>
          </form>
        </details>

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
        {Object.keys(attempt.byArea).length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">Detailed review was not recorded for this result.</p>
        ) : (
          <>
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
          </>
        )}
      </details>
    </li>
  );
}
