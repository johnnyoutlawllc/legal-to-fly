"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { type Question } from "@/lib/types";
import { SELECT_QUESTION_COLUMNS, prepare } from "@/lib/session";
import {
  DRILL_SIZE,
  type SrsMap,
  type Streak,
  addDays,
  buildDrill,
  dueCount,
  effectiveStreak,
  loadSrs,
  loadStreak,
  recordCompletion,
  review,
  saveSrs,
  today,
} from "@/lib/srs";
import {
  pullAndMergeSrs,
  pullStreak,
  pushAllSrs,
  pushSrsItem,
  recordDrillDayRemote,
} from "@/lib/sync";
import { useAuth } from "@/lib/auth";
import { AuthButton } from "@/components/AuthButton";
import { recordAnswer } from "@/lib/mastery";
import { claimNewBadges, type BadgeDef } from "@/lib/badges";
import { NewBadges } from "@/components/Badges";

const PRAISE = [
  "Cleared for takeoff.",
  "Solid copy.",
  "That one's staying filed.",
  "The FAA would be proud.",
  "Textbook.",
];

type Phase = "intro" | "run" | "done";

export default function DrillPage() {
  const { user } = useAuth();
  const [pool, setPool] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [srs, setSrs] = useState<SrsMap>({});
  const [streak, setStreak] = useState<Streak | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");

  // The running drill: a queue that misses go to the back of. Only the first
  // attempt at each question grades its schedule; the retry is just for
  // clearing the board.
  const [queue, setQueue] = useState<Question[]>([]);
  const [drillSize, setDrillSize] = useState(0);
  const [firstTry, setFirstTry] = useState<Record<string, boolean>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [praise, setPraise] = useState(0);
  const [newBadges, setNewBadges] = useState<BadgeDef[]>([]);

  useEffect(() => {
    setSrs(loadSrs());
    setStreak(loadStreak());
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
      setPool(prepare(data));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Signed in: merge the server's schedule with this browser's, then push the
  // result back so a new device starts from the same place.
  useEffect(() => {
    if (!user || !pool) return;
    let cancelled = false;
    (async () => {
      const merged = await pullAndMergeSrs(loadSrs(), pool);
      if (cancelled) return;
      saveSrs(merged);
      setSrs(merged);
      void pushAllSrs(merged, pool, user.id);
      const s = await pullStreak();
      if (!cancelled && s) setStreak(s);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, pool]);

  const due = useMemo(() => dueCount(srs), [srs]);
  const newCount = useMemo(
    () => (pool ? pool.filter((q) => !srs[q.slug]).length : 0),
    [pool, srs]
  );
  const doneToday = streak?.last === today();

  const start = useCallback(() => {
    if (!pool) return;
    const drill = buildDrill(pool, srs, DRILL_SIZE);
    setQueue(drill);
    setDrillSize(drill.length);
    setFirstTry({});
    setPicked(null);
    setPhase("run");
  }, [pool, srs]);

  const current = queue[0];
  const isRetry = current !== undefined && firstTry[current.slug] === false;
  const clearedCount = drillSize - queue.length;

  const choose = useCallback(
    (choiceId: string) => {
      if (picked || !current) return;
      const choice = current.choices.find((c) => c.id === choiceId);
      if (!choice) return;
      setPicked(choiceId);
      if (choice.is_correct) setPraise(Math.floor(Math.random() * PRAISE.length));

      if (firstTry[current.slug] === undefined) {
        setFirstTry((r) => ({ ...r, [current.slug]: choice.is_correct }));
        recordAnswer(current.slug, choice.is_correct);
        const item = review(srs[current.slug], choice.is_correct);
        const next = { ...srs, [current.slug]: item };
        saveSrs(next);
        setSrs(next);
        if (user) void pushSrsItem(user.id, current.id, item);
      }
    },
    [picked, current, firstTry, srs, user]
  );

  const next = useCallback(() => {
    if (!current || !picked) return;
    const choice = current.choices.find((c) => c.id === picked);
    setPicked(null);
    // A miss goes to the back of the queue until it's answered right.
    const rest = queue.slice(1);
    const requeued = choice?.is_correct ? rest : [...rest, current];
    setQueue(requeued);
    if (requeued.length === 0) {
      setStreak(recordCompletion());
      if (user) void recordDrillDayRemote(user.id);
      if (pool) setNewBadges(claimNewBadges(pool));
      setPhase("done");
    }
  }, [current, picked, queue, user, pool]);

  if (error) {
    return (
      <Shell>
        <p className="text-[var(--wrong)]">Could not load questions: {error}</p>
      </Shell>
    );
  }

  if (!pool || !streak) {
    return (
      <Shell>
        <p className="text-[var(--muted)]">Loading…</p>
      </Shell>
    );
  }

  if (phase === "intro") {
    const running = effectiveStreak(streak);
    return (
      <Shell>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
            Daily drill
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {doneToday
              ? "Done for today. Extra credit is open."
              : "Five minutes. Ten questions."}
          </h1>
          <p className="mt-3 max-w-xl leading-7 text-[var(--muted)]">
            The drill remembers every question you answer and brings the ones
            you miss back right before you would forget them. Show up daily and
            the schedule does the studying for you.
          </p>
          {!user && (
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Sign in with Google (top right) and your schedule and streak
              follow you to any device.
            </p>
          )}

          <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
            <Stat label="Day streak" value={String(running)} accent={running > 0} />
            <Stat label="Due today" value={String(due)} accent={due > 0} />
            <Stat label="Never seen" value={String(newCount)} />
          </div>

          <button
            onClick={start}
            className="mt-8 h-12 rounded-lg bg-[var(--accent)] px-8 font-medium text-black transition-opacity hover:opacity-90"
          >
            {doneToday ? "Go again" : "Start today's drill"}
          </button>
        </div>
      </Shell>
    );
  }

  if (phase === "done" || !current) {
    const right = Object.values(firstTry).filter(Boolean).length;
    const missed = Object.entries(firstTry).filter(([, ok]) => !ok);
    const dueTomorrow = Object.values(srs).filter(
      (s) => s.due <= addDays(today(), 1)
    ).length;
    return (
      <Shell>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
            Drill complete
          </p>
          <p className="mt-3 text-5xl font-semibold tracking-tight">
            {right}/{drillSize}
          </p>
          <p className="mt-2 text-[var(--muted)]">
            first try{missed.length > 0 ? ", and you cleared every miss before leaving" : ", a clean board"}
            .
          </p>

          <NewBadges badges={newBadges} />

          <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
            <Stat
              label="Day streak"
              value={String(effectiveStreak(streak))}
              accent
            />
            <Stat label="Best streak" value={String(streak.best)} />
            <Stat label="Due tomorrow" value={String(dueTomorrow)} />
          </div>

          <p className="mt-6 text-sm leading-6 text-[var(--muted)]">
            {missed.length > 0
              ? `The ${missed.length} you missed ${missed.length === 1 ? "is" : "are"} scheduled to come back tomorrow. That is the system working, not you failing.`
              : "Nothing new to worry about. Tomorrow's drill will mix in fresh material."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={start}
              className="h-11 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
            >
              Extra credit round
            </button>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface-2)]"
            >
              Done for today
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const answered = picked !== null;
  const correctChoice = current.choices.find((c) => c.is_correct);
  const pickedChoice = current.choices.find((c) => c.id === picked);

  return (
    <Shell>
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>
            {clearedCount} of {drillSize} cleared
            {isRetry && !answered && (
              <span className="ml-3 rounded border border-[var(--accent)] px-2 py-0.5 text-xs text-[var(--accent)]">
                back for another pass
              </span>
            )}
          </span>
          <span>{queue.length} left</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded bg-[var(--surface-2)]">
          <div
            className="h-full bg-[var(--accent)] transition-all"
            style={{ width: `${(clearedCount / drillSize) * 100}%` }}
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
                ? PRAISE[praise]
                : `Not quite. The answer is ${correctChoice?.label}. It'll be back before the end of the drill.`}
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
              {queue.length === 1 && pickedChoice?.is_correct
                ? "Finish drill"
                : "Next"}
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <p className={`text-2xl font-semibold ${accent ? "text-[var(--accent)]" : ""}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">{label}</p>
    </div>
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
          <span className="flex items-center gap-4">
            <AuthButton />
            <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
              Exit
            </Link>
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
