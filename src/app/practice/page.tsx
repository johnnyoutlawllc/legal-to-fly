"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { areaFromElement, shuffle, type Question } from "@/lib/types";
import {
  AREA_TITLES,
  PASS_PERCENT,
  PRACTICE_SIZE,
  SELECT_QUESTION_COLUMNS,
  buildSession,
  prepare,
} from "@/lib/session";
import { recordAnswer } from "@/lib/mastery";
import { claimNewBadges, type BadgeDef } from "@/lib/badges";
import { NewBadges } from "@/components/Badges";
import { useAuth } from "@/lib/auth";
import { saveTestAttempt, syncTestAttempts } from "@/lib/test-attempts";

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <p className="text-[var(--muted)]">Loading questions…</p>
        </Shell>
      }
    >
      <Practice />
    </Suspense>
  );
}

function Practice() {
  const { user } = useAuth();
  // ?area=II studies one area of operation; no param is the normal
  // exam-weighted mix. Anything unrecognized falls back to the mix.
  const rawArea = useSearchParams().get("area");
  const area = rawArea && AREA_TITLES[rawArea] ? rawArea : null;

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [pool, setPool] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [newBadges, setNewBadges] = useState<BadgeDef[]>([]);
  const [saveStatus, setSaveStatus] = useState("");
  const attemptId = useRef<string | null>(null);
  const startedAt = useRef<number | null>(null);
  const saved = useRef(false);
  const syncedUser = useRef<string | null>(null);

  const draw = useCallback(
    (from: Question[]) =>
      area
        ? shuffle(from.filter((q) => areaFromElement(q.acs_element_code) === area)).slice(
            0,
            PRACTICE_SIZE
          )
        : buildSession(from, PRACTICE_SIZE),
    [area]
  );

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
        return;
      }
      const all = prepare(data);
      setPool(all);
      attemptId.current = crypto.randomUUID();
      startedAt.current = Date.now();
      setQuestions(draw(all));
    })();
    return () => {
      cancelled = true;
    };
  }, [draw]);

  const current = questions?.[index];
  const answered = picked !== null;
  const total = questions?.length ?? 0;
  const answeredCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter(Boolean).length;
  const finished = total > 0 && answeredCount === total;

  const choose = useCallback(
    (choiceId: string) => {
      if (picked || !current) return;
      const choice = current.choices.find((c) => c.id === choiceId);
      if (!choice) return;
      setPicked(choiceId);
      setResults((r) => ({ ...r, [current.id]: choice.is_correct }));
      recordAnswer(current.slug, choice.is_correct);
    },
    [picked, current]
  );

  const next = useCallback(() => {
    setPicked(null);
    setIndex((i) => i + 1);
  }, []);

  // Session over: see whether that unlocked anything.
  useEffect(() => {
    if (finished && pool.length > 0) {
      queueMicrotask(() => setNewBadges(claimNewBadges(pool)));
    }
  }, [finished, pool]);

  // Draw a fresh set from the whole bank rather than reshuffling the same 20.
  const restart = useCallback(() => {
    attemptId.current = crypto.randomUUID();
    startedAt.current = Date.now();
    saved.current = false;
    syncedUser.current = null;
    setSaveStatus("");
    setResults({});
    setPicked(null);
    setIndex(0);
    setNewBadges([]);
    setQuestions(draw(pool));
  }, [pool, draw]);

  const byArea = useMemo(() => {
    if (!questions) return [];
    const acc: Record<string, { right: number; total: number }> = {};
    for (const q of questions) {
      const decided = results[q.id];
      if (decided === undefined) continue;
      const a = areaFromElement(q.acs_element_code);
      acc[a] ??= { right: 0, total: 0 };
      acc[a].total += 1;
      if (decided) acc[a].right += 1;
    }
    return Object.entries(acc).sort((a, b) => a[0].length - b[0].length);
  }, [questions, results]);

  useEffect(() => {
    if (!finished || !questions || !attemptId.current) return;
    if (!saved.current) {
      saved.current = true;
      const missed = new Map<string, number>();
      for (const q of questions) {
        if (!results[q.id]) {
          missed.set(q.acs_element_code, (missed.get(q.acs_element_code) ?? 0) + 1);
        }
      }
      try {
        saveTestAttempt({
          id: attemptId.current,
          kind: "practice",
          completedAt: new Date().toISOString(),
          area,
          correct: correctCount,
          total,
          pct: Math.round((correctCount / total) * 100),
          byArea: Object.fromEntries(byArea),
          missedCodes: [...missed].map(([code, count]) => ({ code, count })),
          elapsedSeconds: startedAt.current === null ? null : Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)),
        });
        queueMicrotask(() => setSaveStatus("Saved in this browser"));
      } catch {
        saved.current = false;
        queueMicrotask(() => setSaveStatus("Could not save this result in your browser"));
        return;
      }
    }
    if (user && syncedUser.current !== user.id) {
      syncedUser.current = user.id;
      void syncTestAttempts(user.id)
        .then(() => setSaveStatus("Saved to your account"))
        .catch(() => {
          syncedUser.current = null;
          setSaveStatus("Saved in this browser; account sync pending");
        });
    }
  }, [finished, questions, results, area, correctCount, total, byArea, user]);

  if (error) {
    return (
      <Shell area={area}>
        <p className="text-[var(--wrong)]">Could not load questions: {error}</p>
      </Shell>
    );
  }

  if (!questions) {
    return (
      <Shell area={area}>
        <p className="text-[var(--muted)]">Loading questions…</p>
      </Shell>
    );
  }

  if (finished || !current) {
    const pct = total ? Math.round((correctCount / total) * 100) : 0;
    const passed = pct >= PASS_PERCENT;
    return (
      <Shell area={area}>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
            {area ? `${AREA_TITLES[area]} session complete` : "Session complete"}
          </p>
          <p className="mt-3 text-5xl font-semibold tracking-tight">{pct}%</p>
          <p className="mt-2 text-[var(--muted)]">
            {correctCount} of {total} correct.{" "}
            <span className={passed ? "text-[var(--correct)]" : "text-[var(--wrong)]"}>
              {passed
                ? "That is a passing score on the real thing."
                : `The real test needs ${PASS_PERCENT}%. Run it again.`}
            </span>
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">{saveStatus}</p>

          <NewBadges badges={newBadges} />

          {!area && (
            <>
              <h2 className="mt-8 text-sm font-medium uppercase tracking-widest text-[var(--muted)]">
                By area of operation
              </h2>
              <ul className="mt-3 divide-y divide-[var(--border)]">
                {byArea.map(([a, s]) => {
                  const areaPct = Math.round((s.right / s.total) * 100);
                  return (
                    <li key={a} className="flex items-center justify-between py-3">
                      <span>
                        <span className="mr-3 font-mono text-sm text-[var(--accent)]">
                          {a}
                        </span>
                        {AREA_TITLES[a] ?? "Unknown"}
                      </span>
                      <span
                        className={
                          areaPct >= PASS_PERCENT
                            ? "text-[var(--correct)]"
                            : "text-[var(--wrong)]"
                        }
                      >
                        {s.right}/{s.total} · {areaPct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
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
              onClick={restart}
              className="h-11 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
            >
              Go again
            </button>
            <Link
              href="/#path"
              className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface-2)]"
            >
              Back to your flight path
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const correctChoice = current.choices.find((c) => c.is_correct);
  const pickedChoice = current.choices.find((c) => c.id === picked);

  return (
    <Shell area={area}>
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>
            Question {index + 1} of {total}
          </span>
          <span>
            {correctCount}/{answeredCount} correct
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded bg-[var(--surface-2)]">
          <div
            className="h-full bg-[var(--accent)] transition-all"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <p className="text-lg leading-8">{current.stem}</p>

        <div className="mt-6 space-y-3">
          {current.choices.map((c) => {
            const isPicked = c.id === picked;
            const reveal = answered && (c.is_correct || isPicked);
            const tone = !reveal
              ? "border-[var(--border)] hover:border-[var(--accent)]"
              : c.is_correct
                ? "border-[var(--correct)] bg-[var(--correct)]/5"
                : "border-[var(--wrong)] bg-[var(--wrong)]/5";
            return (
              <button
                key={c.id}
                onClick={() => choose(c.id)}
                disabled={answered}
                className={`flex w-full gap-4 rounded-lg border px-4 py-3 text-left transition-colors ${tone} ${
                  answered ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <span className="font-mono text-sm text-[var(--muted)]">{c.label}</span>
                <span className="flex-1">{c.body}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-6 border-t border-[var(--border)] pt-6">
            <p
              className={`font-medium ${
                pickedChoice?.is_correct ? "text-[var(--correct)]" : "text-[var(--wrong)]"
              }`}
            >
              {pickedChoice?.is_correct
                ? "Correct."
                : `Not quite. The answer is ${correctChoice?.label}.`}
            </p>

            {!pickedChoice?.is_correct && pickedChoice?.rationale && (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                <span className="text-[var(--text)]">
                  Why {pickedChoice.label} is wrong:{" "}
                </span>
                {pickedChoice.rationale}
              </p>
            )}

            <p className="mt-3 leading-7 text-[var(--muted)]">{current.explanation}</p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {current.citation && (
                <span className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono">
                  {current.citation}
                </span>
              )}
              <span className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono text-[var(--accent)]">
                {current.acs_element_code}
              </span>
            </div>

            <button
              onClick={next}
              className="mt-6 h-11 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
            >
              {index + 1 === total ? "See results" : "Next question"}
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({
  children,
  area = null,
}: {
  children: React.ReactNode;
  area?: string | null;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
          <span className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Legal<span className="text-[var(--accent)]">to</span>Fly
            </Link>
            {area && (
              <span className="rounded border border-[var(--accent)]/50 px-2 py-0.5 text-xs text-[var(--accent)]">
                {AREA_TITLES[area]}
              </span>
            )}
          </span>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            Exit
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
