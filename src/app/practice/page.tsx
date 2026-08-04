"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { areaFromElement, type Question } from "@/lib/types";
import {
  AREA_TITLES,
  PASS_PERCENT,
  PRACTICE_SIZE,
  SELECT_QUESTION_COLUMNS,
  buildSession,
  prepare,
} from "@/lib/session";

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [pool, setPool] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});

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
      setQuestions(buildSession(all, PRACTICE_SIZE));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    },
    [picked, current]
  );

  const next = useCallback(() => {
    setPicked(null);
    setIndex((i) => i + 1);
  }, []);

  // Draw a fresh set from the whole bank rather than reshuffling the same 20.
  const restart = useCallback(() => {
    setResults({});
    setPicked(null);
    setIndex(0);
    setQuestions(buildSession(pool, PRACTICE_SIZE));
  }, [pool]);

  const byArea = useMemo(() => {
    if (!questions) return [];
    const acc: Record<string, { right: number; total: number }> = {};
    for (const q of questions) {
      const decided = results[q.id];
      if (decided === undefined) continue;
      const area = areaFromElement(q.acs_element_code);
      acc[area] ??= { right: 0, total: 0 };
      acc[area].total += 1;
      if (decided) acc[area].right += 1;
    }
    return Object.entries(acc).sort((a, b) => a[0].length - b[0].length);
  }, [questions, results]);

  if (error) {
    return (
      <Shell>
        <p className="text-[var(--wrong)]">Could not load questions: {error}</p>
      </Shell>
    );
  }

  if (!questions) {
    return (
      <Shell>
        <p className="text-[var(--muted)]">Loading questions…</p>
      </Shell>
    );
  }

  if (finished || !current) {
    const pct = total ? Math.round((correctCount / total) * 100) : 0;
    const passed = pct >= PASS_PERCENT;
    return (
      <Shell>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
            Session complete
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

          <h2 className="mt-8 text-sm font-medium uppercase tracking-widest text-[var(--muted)]">
            By area of operation
          </h2>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {byArea.map(([area, s]) => {
              const areaPct = Math.round((s.right / s.total) * 100);
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

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={restart}
              className="h-11 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
            >
              Go again
            </button>
            <Link
              href="/exam"
              className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface-2)]"
            >
              Try a timed mock exam
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const correctChoice = current.choices.find((c) => c.is_correct);
  const pickedChoice = current.choices.find((c) => c.id === picked);

  return (
    <Shell>
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
                : `Not quite — the answer is ${correctChoice?.label}.`}
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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Legal<span className="text-[var(--accent)]">to</span>Fly
          </Link>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            Exit
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
