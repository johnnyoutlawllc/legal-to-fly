"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { areaFromElement } from "@/lib/types";
import { AREA_TITLES } from "@/lib/session";
import { loadMastery, isMastered } from "@/lib/mastery";
import { BADGES, type BadgeId, loadEarned } from "@/lib/badges";
import { BadgeIcon } from "@/components/Badges";
import { lessonsForArea } from "@/content/lessons";
import { readLessons } from "@/lib/lesson-progress";

/** The briefing before the questions. Clicking an area on the flight path
 *  lands here: what the area actually covers, how the FAA weights it, your
 *  progress through it, and the badge waiting at the end. The Study button
 *  is where the questions start. */

const BLURBS: Record<string, { what: string; why: string }> = {
  I: {
    what: "The rules themselves. What Part 107 lets you do without asking, what needs a waiver, who can be certificated, flying over people, and Remote ID.",
    why: "This is the densest memorization on the test, and where the classic trick questions live. Daylight rules, the 400-foot ceiling, and what counts as a reportable event all hide here.",
  },
  II: {
    what: "The alphabet soup of airspace. Which class you are standing in, what you can fly in without authorization, and how to read the sectional chart that tells you.",
    why: "Controlled-airspace questions are where hobbyists lose the most points, because nothing about flying in the backyard prepares you for a sectional chart. The real exam hands you chart excerpts and expects answers.",
  },
  III: {
    what: "Where aviation weather reports come from and how to read them, plus what wind, stability, and density altitude do to a small aircraft.",
    why: "METARs and TAFs look like line noise until someone shows you the pattern, and then they are free points. Density altitude questions are the FAA's favorite way to check you actually understand performance.",
  },
  IV: {
    what: "Weight, balance, and performance. What changes when you strap on a heavier camera, and how load affects the way the aircraft flies.",
    why: "The smallest area on the exam and the quickest badge on the shelf. A handful of concepts cover every question the FAA can ask here.",
  },
  V: {
    what: "Everything about actually operating: radio calls, airport traffic patterns, emergencies, crew coordination, decision-making, your own physiology, and maintenance.",
    why: "The biggest slice of the real exam by far, at more than a third of the questions. A lot of it is judgment and common sense with official vocabulary attached.",
  },
};

const WEIGHTS: Record<string, string> = {
  I: "15-25%",
  II: "15-25%",
  III: "11-16%",
  IV: "7-11%",
  V: "35-45%",
};

type PoolRow = { slug: string; acs_element_code: string };
type TaskRow = { code: string; letter: string; title: string };

export default function StudyAreaPage() {
  const raw = useParams<{ area: string }>().area?.toUpperCase() ?? "";
  const area = AREA_TITLES[raw] ? raw : null;

  const [pool, setPool] = useState<PoolRow[] | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [mastered, setMastered] = useState(0);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [lessonsRead, setLessonsRead] = useState<Set<string>>(new Set());

  useEffect(() => setLessonsRead(readLessons()), []);

  useEffect(() => {
    if (!area) return;
    setBadgeEarned(!!loadEarned()[`area-${area}` as BadgeId]);
    let cancelled = false;
    (async () => {
      const [q, t] = await Promise.all([
        supabase.from("questions").select("slug, acs_element_code").eq("is_active", true),
        supabase
          .from("acs_tasks")
          .select("code, letter, title")
          .eq("area_code", area)
          .order("sort_order"),
      ]);
      if (cancelled) return;
      if (q.data) {
        const mine = (q.data as PoolRow[]).filter(
          (r) => areaFromElement(r.acs_element_code) === area
        );
        setPool(mine);
        const m = loadMastery();
        setMastered(mine.filter((r) => isMastered(m[r.slug])).length);
      }
      if (t.data) setTasks(t.data as TaskRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [area]);

  const badge = useMemo(
    () => (area ? BADGES.find((b) => b.id === `area-${area}`) : undefined),
    [area]
  );

  if (!area) {
    return (
      <Shell>
        <p className="text-[var(--muted)]">
          That area does not exist.{" "}
          <Link href="/#path" className="text-[var(--accent)]">
            Back to the flight path.
          </Link>
        </p>
      </Shell>
    );
  }

  const total = pool?.length ?? 0;
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  const blurb = BLURBS[area];

  return (
    <Shell>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
            Area {area} · {WEIGHTS[area]} of the exam
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {AREA_TITLES[area]}
          </h1>
        </div>
        {badge && (
          <div className="flex shrink-0 flex-col items-center">
            <BadgeIcon badge={badge} earned={badgeEarned} className="h-16 w-16" />
            <p className="mt-1 max-w-24 text-center text-xs text-[var(--muted)]">
              {badge.name}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>
            {pool
              ? `${mastered} of ${total} questions mastered`
              : "Loading your progress…"}
          </span>
          <span>{pct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded bg-[var(--surface-2)]">
          <div
            className="h-full rounded bg-[var(--accent)] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {badgeEarned && (
          <p className="mt-2 text-sm text-[var(--accent)]">
            Mastered. The {badge?.name} badge is yours.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="font-semibold">What this covers</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{blurb.what}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="font-semibold">Why it matters</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{blurb.why}</p>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="font-semibold">The FAA&apos;s own outline</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Tasks from the Airman Certification Standards for this area. Every
            question you see maps to one of these.
          </p>
          <ul className="mt-4 space-y-2">
            {tasks.map((t) => (
              <li key={t.code} className="flex items-center gap-3 text-sm">
                <span className="w-8 shrink-0 font-mono text-xs text-[var(--accent)]">
                  {t.code}
                </span>
                {t.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lessonsForArea(area).length > 0 && (
        <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="font-semibold">Learn it first</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Ground-school lessons for this area. Read, then drill.
          </p>
          <ul className="mt-4 space-y-2">
            {lessonsForArea(area).map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/learn/${l.slug}`}
                  className="flex items-center gap-3 text-sm transition-colors hover:text-[var(--accent)]"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                      lessonsRead.has(l.slug)
                        ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                        : "border-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    {lessonsRead.has(l.slug) ? "✓" : ""}
                  </span>
                  {l.title}
                  <span className="text-xs text-[var(--muted)]">
                    {l.minutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/practice?area=${area}`}
          className="inline-flex h-12 items-center rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
        >
          Study this area
        </Link>
        <Link
          href="/#path"
          className="inline-flex h-12 items-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface-2)]"
        >
          Back to your flight path
        </Link>
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Sessions are 20 questions with the answer explained after every one.
        Answer a question right once and it counts toward the bar above.
      </p>
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
