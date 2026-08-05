"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AREA_TITLES } from "@/lib/session";
import { type MasteryMap, areaProgress, loadMastery } from "@/lib/mastery";
import { type EarnedMap, basicsRead, claimNewBadges, loadEarned } from "@/lib/badges";
import { effectiveStreak, loadStreak } from "@/lib/srs";
import { BadgeShelf } from "@/components/Badges";

/** The Trailhead move: the study plan is a visible trail. Five areas, a
 *  progress bar each, a badge at the end of every one. All local state, so an
 *  anonymous hobbyist gets the full game from question one. */

type PoolRow = { slug: string; acs_element_code: string };

const AREA_WEIGHT_LABEL: Record<string, string> = {
  I: "15-25% of the exam",
  II: "15-25% of the exam",
  III: "11-16% of the exam",
  IV: "7-11% of the exam",
  V: "35-45% of the exam",
};

export function FlightPath() {
  const [pool, setPool] = useState<PoolRow[] | null>(null);
  const [mastery, setMastery] = useState<MasteryMap>({});
  const [earned, setEarned] = useState<EarnedMap>({});
  const [streak, setStreak] = useState(0);
  const [read, setRead] = useState(false);

  useEffect(() => {
    setMastery(loadMastery());
    setEarned(loadEarned());
    setStreak(effectiveStreak(loadStreak()));
    setRead(basicsRead());
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("questions")
        .select("slug, acs_element_code")
        .eq("is_active", true);
      if (cancelled || !data) return;
      setPool(data as PoolRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Catch anything earned in a past session but never claimed (e.g. a streak
  // that quietly crossed 7 yesterday).
  useEffect(() => {
    if (!pool) return;
    claimNewBadges(pool, loadMastery());
    setEarned(loadEarned());
  }, [pool]);

  const progress = useMemo(
    () => (pool ? areaProgress(pool, mastery) : []),
    [pool, mastery]
  );
  const totals = useMemo(() => {
    const mastered = progress.reduce((n, p) => n + p.mastered, 0);
    const total = progress.reduce((n, p) => n + p.total, 0);
    return { mastered, total, pct: total ? Math.round((mastered / total) * 100) : 0 };
  }, [progress]);

  return (
    <section
      id="path"
      className="border-t border-[var(--border)] py-16"
      data-ltf-hl
      data-ltf-tip="Five ACS areas. Fill every bar and you are mock-exam ready."
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Your flight path</h2>
          <p className="mt-2 text-[var(--muted)]">
            Five areas, exactly what the FAA tests. Turn every bar orange and
            you are ready.
          </p>
        </div>
        <div className="flex gap-3">
          <Stat value={`${totals.pct}%`} label="of the bank mastered" />
          <Stat value={String(streak)} label="day streak" accent={streak > 0} />
        </div>
      </div>

      <div className="mt-8 h-2 w-full overflow-hidden rounded bg-[var(--surface-2)]">
        <div
          className="h-full rounded bg-[var(--accent)] transition-all duration-700"
          style={{ width: `${totals.pct}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {pool
          ? `${totals.mastered} of ${totals.total} questions answered correctly at least once.`
          : "Loading the question bank…"}
      </p>

      <div className="mt-8 space-y-4">
        <Link
          href="/basics"
          className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-4">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg font-mono text-xs ${
                  read
                    ? "bg-[var(--accent)] text-black"
                    : "bg-[var(--surface-2)] text-[var(--accent)]"
                }`}
              >
                107
              </span>
              <span>
                <span className="block font-medium">Start here: 107 Basics</span>
                <span className="block text-xs text-[var(--muted)]">
                  What the certificate is, why you need it, and how the test works
                </span>
              </span>
            </span>
            <span className="shrink-0 text-sm text-[var(--muted)]">
              {read ? (
                <span className="text-[var(--accent)]">Read ✓</span>
              ) : (
                "5 minute read"
              )}
              <span className="ml-3 hidden text-[var(--accent)] group-hover:inline">
                Read →
              </span>
            </span>
          </div>
        </Link>

        {progress.map((p) => {
          const done = p.total > 0 && p.mastered === p.total;
          return (
            <Link
              key={p.area}
              href={`/study/${p.area}`}
              className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-4">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg font-mono text-sm ${
                      done
                        ? "bg-[var(--accent)] text-black"
                        : "bg-[var(--surface-2)] text-[var(--accent)]"
                    }`}
                  >
                    {p.area}
                  </span>
                  <span>
                    <span className="block font-medium">
                      {AREA_TITLES[p.area] ?? "Unknown"}
                    </span>
                    <span className="block text-xs text-[var(--muted)]">
                      {AREA_WEIGHT_LABEL[p.area] ?? ""}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-sm text-[var(--muted)]">
                  {done ? (
                    <span className="text-[var(--accent)]">Mastered ✓</span>
                  ) : (
                    `${p.mastered}/${p.total}`
                  )}
                  <span className="ml-3 hidden text-[var(--accent)] group-hover:inline">
                    Study →
                  </span>
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded bg-[var(--surface-2)]">
                <div
                  className="h-full rounded bg-[var(--accent)] transition-all duration-700"
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-16">
        <BadgeShelf earned={earned} />
      </div>
    </section>
  );
}

function Stat({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-center">
      <p className={`text-2xl font-semibold ${accent ? "text-[var(--accent)]" : ""}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
