"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { areaFromElement, type Question } from "@/lib/types";
import {
  AREA_TITLES,
  EXAM_QUESTION_COUNT,
  EXAM_SECONDS,
  PASS_PERCENT,
  SELECT_QUESTION_COLUMNS,
  buildSession,
  formatClock,
  prepare,
} from "@/lib/session";
import { recordAnswer } from "@/lib/mastery";
import { claimNewBadges, type BadgeDef } from "@/lib/badges";
import { NewBadges } from "@/components/Badges";
import { useAuth } from "@/lib/auth";
import { saveTestAttempt, syncTestAttempts } from "@/lib/test-attempts";

type Phase = "loading" | "ready" | "running" | "done" | "error";

export default function ExamPage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [pool, setPool] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(EXAM_SECONDS);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [newBadges, setNewBadges] = useState<BadgeDef[]>([]);
  const [saveStatus, setSaveStatus] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const graded = useRef(false);
  const attemptId = useRef<string | null>(null);
  const syncedUser = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("questions")
        .select(SELECT_QUESTION_COLUMNS)
        .eq("is_active", true);
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setPhase("error");
        return;
      }
      setPool(prepare(data));
      setPhase("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const finish = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setPhase("done");
  }, []);

  const start = useCallback(() => {
    attemptId.current = crypto.randomUUID();
    syncedUser.current = null;
    setSaveStatus("");
    setQuestions(buildSession(pool, EXAM_QUESTION_COUNT));
    setAnswers({});
    setFlagged(new Set());
    setIndex(0);
    setRemaining(EXAM_SECONDS);
    setNewBadges([]);
    graded.current = false;
    setPhase("running");
  }, [pool]);

  // The clock is the whole point of a mock exam. When it hits zero, you are done.
  useEffect(() => {
    if (phase !== "running") return;
    timer.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null;
          setPhase("done");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [phase]);

  const scored = useMemo(() => {
    let correct = 0;
    const byArea: Record<string, { right: number; total: number }> = {};
    for (const q of questions) {
      const area = areaFromElement(q.acs_element_code);
      byArea[area] ??= { right: 0, total: 0 };
      byArea[area].total += 1;
      const picked = answers[q.id];
      const ok = !!picked && !!q.choices.find((c) => c.id === picked)?.is_correct;
      if (ok) {
        correct += 1;
        byArea[area].right += 1;
      }
    }
    const pct = questions.length
      ? Math.round((correct / questions.length) * 100)
      : 0;
    return { correct, pct, passed: pct >= PASS_PERCENT, byArea };
  }, [questions, answers]);

  // Grade once per exam: feed mastery, log the score, see what it unlocked.
  // Unanswered questions are recorded as misses, same as the scoring.
  useEffect(() => {
    if (phase !== "done" || questions.length === 0 || graded.current) return;
    graded.current = true;
    for (const q of questions) {
      const picked = answers[q.id];
      const ok = !!picked && !!q.choices.find((c) => c.id === picked)?.is_correct;
      recordAnswer(q.slug, ok);
    }
    const missed = new Map<string, number>();
    for (const q of questions) {
      const picked = answers[q.id];
      if (!picked || !q.choices.find((c) => c.id === picked)?.is_correct) {
        missed.set(q.acs_element_code, (missed.get(q.acs_element_code) ?? 0) + 1);
      }
    }
    try {
      saveTestAttempt({
        id: attemptId.current ?? crypto.randomUUID(),
        kind: "mock",
        completedAt: new Date().toISOString(),
        area: null,
        correct: scored.correct,
        total: questions.length,
        pct: scored.pct,
        byArea: scored.byArea,
        missedCodes: [...missed].map(([code, count]) => ({ code, count })),
        elapsedSeconds: EXAM_SECONDS - remaining,
      });
      queueMicrotask(() => setSaveStatus("Saved in this browser"));
    } catch {
      queueMicrotask(() => setSaveStatus("Could not save this result in your browser"));
    }
    setNewBadges(claimNewBadges(pool));
  }, [phase, questions, answers, scored, pool, remaining]);

  useEffect(() => {
    if (phase !== "done" || !user || !saveStatus.startsWith("Saved") || syncedUser.current === user.id) return;
    syncedUser.current = user.id;
    void syncTestAttempts(user.id)
      .then(() => setSaveStatus("Saved to your account"))
      .catch(() => setSaveStatus("Saved in this browser; account sync pending"));
  }, [phase, user, saveStatus]);

  const missedCodes = useMemo(() => {
    const codes: Record<string, number> = {};
    for (const q of questions) {
      const picked = answers[q.id];
      const ok = !!picked && !!q.choices.find((c) => c.id === picked)?.is_correct;
      if (!ok) codes[q.acs_element_code] = (codes[q.acs_element_code] ?? 0) + 1;
    }
    return Object.entries(codes).sort((a, b) => b[1] - a[1]);
  }, [questions, answers]);

  if (phase === "error") {
    return (
      <Shell>
        <p className="text-[var(--wrong)]">Could not load questions: {error}</p>
      </Shell>
    );
  }

  if (phase === "loading") {
    return (
      <Shell>
        <p className="text-[var(--muted)]">Loading question bank…</p>
      </Shell>
    );
  }

  if (phase === "ready") {
    return (
      <Shell>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Mock exam</h1>
          <p className="mt-3 leading-7 text-[var(--muted)]">
            Sixty questions, two hours, seventy percent to pass. Questions are
            drawn to the FAA&apos;s published area weightings. No feedback until
            you finish, and the clock does not stop.
          </p>
          <p className="mt-4 rounded-lg border border-[var(--accent)]/50 bg-[var(--accent)]/10 p-4 text-sm leading-6">
            Readiness check: this bank does not yet include questions that require
            reading an actual FAA chart figure or doing a calculation. A passing
            score here is useful practice, but it does not predict your UAG score.
            Before booking, work through the{" "}
            <a href="https://www.faa.gov/sites/faa.gov/files/training_testing/testing/test_questions/uag_questions.pdf" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">FAA sample questions</a>
            {" "}with the{" "}
            <a href="https://www.faa.gov/training_testing/testing/supplements" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">FAA testing supplement</a>.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-[var(--muted)]">
            <li>· You can flag questions and come back to them.</li>
            <li>· Unanswered questions are scored as wrong, exactly like the real test.</li>
            <li>· You get a full review with ACS codes at the end.</li>
          </ul>
          <button
            onClick={start}
            className="mt-8 h-12 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
          >
            Start the clock
          </button>
        </div>
      </Shell>
    );
  }

  if (phase === "done") {
    return (
      <Shell>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
            Mock exam result
          </p>
          <p className="mt-3 text-6xl font-semibold tracking-tight">{scored.pct}%</p>
          <p
            className={`mt-3 text-lg font-medium ${
              scored.passed ? "text-[var(--correct)]" : "text-[var(--wrong)]"
            }`}
          >
            {scored.passed ? "Pass" : "Fail"}
          </p>
          <p className="mt-1 text-[var(--muted)]">
            {scored.correct} of {questions.length} correct. The real exam needs{" "}
            {PASS_PERCENT}%.
          </p>
          <p className="mt-4 rounded-lg border border-[var(--accent)]/50 bg-[var(--accent)]/10 p-4 text-sm leading-6">
            This score does not cover chart-figure interpretation or calculation
            questions. Review the{" "}
            <a href="https://www.faa.gov/sites/faa.gov/files/training_testing/testing/test_questions/uag_questions.pdf" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">FAA sample questions</a>
            {" "}and their referenced figures before treating it as a readiness measure.
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">{saveStatus}</p>

          <NewBadges badges={newBadges} />

          <h2 className="mt-8 text-sm font-medium uppercase tracking-widest text-[var(--muted)]">
            By area of operation
          </h2>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {Object.entries(scored.byArea)
              .sort((a, b) => a[0].length - b[0].length)
              .map(([area, s]) => {
                const pct = Math.round((s.right / s.total) * 100);
                return (
                  <li key={area} className="flex items-center justify-between py-3">
                    <span>
                      <span className="mr-3 font-mono text-sm text-[var(--accent)]">
                        {area}
                      </span>
                      {AREA_TITLES[area] ?? "Unknown"}
                    </span>
                    <span
                      className={
                        pct >= PASS_PERCENT
                          ? "text-[var(--correct)]"
                          : "text-[var(--wrong)]"
                      }
                    >
                      {s.right}/{s.total} · {pct}%
                    </span>
                  </li>
                );
              })}
          </ul>

          {missedCodes.length > 0 && (
            <>
              <h2 className="mt-8 text-sm font-medium uppercase tracking-widest text-[var(--muted)]">
                ACS codes you missed
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                These are the same codes the FAA prints on your Airman Knowledge
                Test Report. Study these directly.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {missedCodes.map(([code, n]) => (
                  <span
                    key={code}
                    className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono text-xs text-[var(--accent)]"
                  >
                    {code}
                    {n > 1 && ` ×${n}`}
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/results"
              className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface-2)]"
            >
              View past results
            </Link>
            <button
              onClick={start}
              className="h-11 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
            >
              Take another
            </button>
            <Link
              href="/practice"
              className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface-2)]"
            >
              Practice instead
            </Link>
          </div>
        </div>

        <h2 className="mt-10 text-lg font-semibold">Review every question</h2>
        <div className="mt-4 space-y-4">
          {questions.map((q, i) => {
            const picked = answers[q.id];
            const correct = q.choices.find((c) => c.is_correct);
            const ok = !!picked && picked === correct?.id;
            return (
              <div
                key={q.id}
                className={`rounded-xl border bg-[var(--surface)] p-5 ${
                  ok ? "border-[var(--border)]" : "border-[var(--wrong)]"
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-medium leading-7">
                    <span className="mr-2 text-[var(--muted)]">{i + 1}.</span>
                    {q.stem}
                  </p>
                  <span
                    className={`shrink-0 text-sm ${
                      ok ? "text-[var(--correct)]" : "text-[var(--wrong)]"
                    }`}
                  >
                    {ok ? "Correct" : picked ? "Wrong" : "Skipped"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  <span className="text-[var(--correct)]">
                    Answer {correct?.label}:
                  </span>{" "}
                  {correct?.body}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {q.explanation}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {q.citation && (
                    <span className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono">
                      {q.citation}
                    </span>
                  )}
                  <span className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono text-[var(--accent)]">
                    {q.acs_element_code}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Shell>
    );
  }

  // phase === "running"
  const current = questions[index];
  const answeredCount = Object.keys(answers).length;
  const low = remaining < 300;

  return (
    <Shell>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm text-[var(--muted)]">
          Question {index + 1} of {questions.length} · {answeredCount} answered
        </span>
        <span
          className={`font-mono text-lg tabular-nums ${
            low ? "text-[var(--wrong)]" : "text-[var(--text)]"
          }`}
        >
          {formatClock(remaining)}
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-1">
        {questions.map((q, i) => {
          const done = !!answers[q.id];
          const isFlagged = flagged.has(q.id);
          return (
            <button
              key={q.id}
              onClick={() => setIndex(i)}
              aria-label={`Go to question ${i + 1}`}
              className={`h-6 w-6 rounded text-[10px] font-mono transition-colors ${
                i === index
                  ? "bg-[var(--accent)] text-black"
                  : isFlagged
                    ? "bg-[var(--surface-2)] text-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : done
                      ? "bg-[var(--surface-2)] text-[var(--text)]"
                      : "bg-[var(--surface)] text-[var(--muted)]"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <p className="text-lg leading-8">{current.stem}</p>

        <div className="mt-6 space-y-3">
          {current.choices.map((c) => {
            const selected = answers[current.id] === c.id;
            return (
              <button
                key={c.id}
                onClick={() =>
                  setAnswers((a) => ({ ...a, [current.id]: c.id }))
                }
                className={`flex w-full gap-4 rounded-lg border px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] hover:border-[var(--accent)]"
                }`}
              >
                <span className="font-mono text-sm text-[var(--muted)]">
                  {c.label}
                </span>
                <span className="flex-1">{c.body}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="h-11 rounded-lg border border-[var(--border)] px-5 transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={() =>
              setIndex((i) => Math.min(questions.length - 1, i + 1))
            }
            disabled={index === questions.length - 1}
            className="h-11 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Next
          </button>
          <button
            onClick={() =>
              setFlagged((f) => {
                const n = new Set(f);
                if (n.has(current.id)) n.delete(current.id);
                else n.add(current.id);
                return n;
              })
            }
            className="h-11 rounded-lg border border-[var(--border)] px-5 text-sm transition-colors hover:bg-[var(--surface-2)]"
          >
            {flagged.has(current.id) ? "Unflag" : "Flag for review"}
          </button>
          <button
            onClick={finish}
            className="ml-auto h-11 rounded-lg border border-[var(--wrong)] px-5 text-sm text-[var(--wrong)] transition-colors hover:bg-[var(--wrong)]/10"
          >
            Submit exam
          </button>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Legal<span className="text-[var(--accent)]">to</span>Fly
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            Exit
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
