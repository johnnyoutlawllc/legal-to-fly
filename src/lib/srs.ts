import { type Question } from "@/lib/types";
import { buildSession } from "@/lib/session";

/** The daily drill: a short session the app schedules for you. Reviews that
 *  are due come first, new material fills the rest, and misses come back
 *  right before you'd forget them (SM-2). State lives in localStorage until
 *  auth ships (LTF-01), keyed by question slug, which survives re-seeds
 *  where UUIDs would not. */

export const DRILL_SIZE = 10;

export type SrsItem = {
  /** SM-2 easiness factor, floor 1.3. */
  ease: number;
  /** Days until the next review. */
  interval: number;
  /** Consecutive successful reviews. */
  reps: number;
  /** YYYY-MM-DD the question is next due. */
  due: string;
  seen: number;
  lapses: number;
};

export type SrsMap = Record<string, SrsItem>;

export type Streak = {
  /** YYYY-MM-DD of the last completed drill. */
  last: string;
  current: number;
  best: number;
  /** Total drills ever completed. */
  total: number;
};

const SRS_KEY = "ltf_srs_v1";
const STREAK_KEY = "ltf_streak_v1";

/** Local calendar date, not UTC: an 11pm drill should count for today. */
export function today(): string {
  return toDateString(new Date());
}

function toDateString(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return toDateString(new Date(y, m - 1, d + days));
}

export function loadSrs(): SrsMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SRS_KEY) ?? "{}") as SrsMap;
  } catch {
    return {};
  }
}

export function saveSrs(map: SrsMap): void {
  localStorage.setItem(SRS_KEY, JSON.stringify(map));
}

/** SM-2, collapsed to the binary signal a multiple-choice answer gives us:
 *  correct is quality 4, a miss is quality 2. A miss resets the ladder and
 *  comes back tomorrow. */
export function review(prev: SrsItem | undefined, correct: boolean, on = today()): SrsItem {
  const item = prev ?? { ease: 2.5, interval: 0, reps: 0, due: on, seen: 0, lapses: 0 };
  const q = correct ? 4 : 2;
  const ease = Math.max(1.3, item.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  let reps: number;
  let interval: number;
  if (correct) {
    reps = item.reps + 1;
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(item.interval * ease);
  } else {
    reps = 0;
    interval = 1;
  }

  return {
    ease,
    interval,
    reps,
    due: addDays(on, interval),
    seen: item.seen + 1,
    lapses: item.lapses + (correct ? 0 : 1),
  };
}

export function dueCount(srs: SrsMap, on = today()): number {
  return Object.values(srs).filter((s) => s.due <= on).length;
}

/** Reviews that are due (oldest debt first), then new questions sampled to
 *  the FAA area weights, then (only if the bank runs dry) the reviews due
 *  soonest. */
export function buildDrill(pool: Question[], srs: SrsMap, size = DRILL_SIZE): Question[] {
  const t = today();
  const due = pool
    .filter((q) => srs[q.slug] && srs[q.slug].due <= t)
    .sort((a, b) => srs[a.slug].due.localeCompare(srs[b.slug].due));
  const fresh = pool.filter((q) => !srs[q.slug]);
  const later = pool
    .filter((q) => srs[q.slug] && srs[q.slug].due > t)
    .sort((a, b) => srs[a.slug].due.localeCompare(srs[b.slug].due));

  const picked: Question[] = due.slice(0, size);
  if (picked.length < size) picked.push(...buildSession(fresh, size - picked.length));
  if (picked.length < size) picked.push(...later.slice(0, size - picked.length));
  return picked;
}

export function loadStreak(): Streak {
  const empty: Streak = { last: "", current: 0, best: 0, total: 0 };
  if (typeof window === "undefined") return empty;
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(STREAK_KEY) ?? "{}") };
  } catch {
    return empty;
  }
}

/** What the streak reads as right now: yesterday's streak survives until
 *  today's drill is done, but a two-day gap has already broken it. */
export function effectiveStreak(s: Streak, on = today()): number {
  if (s.last === on || s.last === addDays(on, -1)) return s.current;
  return 0;
}

export function saveStreak(s: Streak): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(s));
}

/** Idempotent per day: the second drill of the day is extra credit. */
export function recordCompletion(on = today()): Streak {
  const s = loadStreak();
  if (s.last === on) return s;
  const current = s.last === addDays(on, -1) ? s.current + 1 : 1;
  const next: Streak = {
    last: on,
    current,
    best: Math.max(current, s.best),
    total: s.total + 1,
  };
  saveStreak(next);
  return next;
}
