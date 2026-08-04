import {
  type MasteryMap,
  areaProgress,
  loadExams,
  loadMastery,
} from "@/lib/mastery";
import { effectiveStreak, loadStreak, today } from "@/lib/srs";

/** The badge case. Earned state lives in localStorage as id -> date earned.
 *  Everything a badge needs is derivable from mastery, the streak, and the
 *  local exam history, so `claimNewBadges` can run at any award point (end of
 *  a drill, practice session, or mock exam — and on the flight path itself,
 *  which catches anything earned but never claimed). */

export type BadgeId =
  | "preflight"
  | "streak3"
  | "streak7"
  | "streak30"
  | "area-I"
  | "area-II"
  | "area-III"
  | "area-IV"
  | "area-V"
  | "solo"
  | "checkride"
  | "ace";

export type BadgeDef = {
  id: BadgeId;
  name: string;
  /** How you earn it — shown on locked badges as the quest. */
  hint: string;
};

export const BADGES: BadgeDef[] = [
  { id: "preflight", name: "Preflight Check", hint: "Answer your first question" },
  { id: "streak3", name: "Pattern Work", hint: "Keep a 3-day drill streak" },
  { id: "streak7", name: "Cross-Country", hint: "Keep a 7-day drill streak" },
  { id: "streak30", name: "Frequent Flyer", hint: "Keep a 30-day drill streak" },
  { id: "area-I", name: "Lawful Operator", hint: "Master every Regulations question" },
  { id: "area-II", name: "Airspace Navigator", hint: "Master every Airspace question" },
  { id: "area-III", name: "Weather Watcher", hint: "Master every Weather question" },
  { id: "area-IV", name: "Load Master", hint: "Master every Loading & Performance question" },
  { id: "area-V", name: "Mission Commander", hint: "Master every Operations question" },
  { id: "solo", name: "First Solo", hint: "Finish a full mock exam" },
  { id: "checkride", name: "Checkride Ready", hint: "Pass a mock exam at 70% or better" },
  { id: "ace", name: "Aced It", hint: "Score 90% or better on a mock exam" },
];

/** id -> YYYY-MM-DD earned */
export type EarnedMap = Partial<Record<BadgeId, string>>;

const BADGES_KEY = "ltf_badges_v1";

export function loadEarned(): EarnedMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(BADGES_KEY) ?? "{}") as EarnedMap;
  } catch {
    return {};
  }
}

function evaluate(
  pool: { slug: string; acs_element_code: string }[],
  mastery: MasteryMap
): Set<BadgeId> {
  const earned = new Set<BadgeId>();

  if (Object.keys(mastery).length > 0) earned.add("preflight");

  const streak = loadStreak();
  const days = Math.max(effectiveStreak(streak), streak.best);
  if (days >= 3) earned.add("streak3");
  if (days >= 7) earned.add("streak7");
  if (days >= 30) earned.add("streak30");

  for (const p of areaProgress(pool, mastery)) {
    if (p.total > 0 && p.mastered === p.total) earned.add(`area-${p.area}` as BadgeId);
  }

  const exams = loadExams();
  if (exams.length > 0) earned.add("solo");
  if (exams.some((e) => e.pct >= 70)) earned.add("checkride");
  if (exams.some((e) => e.pct >= 90)) earned.add("ace");

  return earned;
}

/** Evaluate everything, persist anything newly earned, and return just the
 *  new ones so the calling screen can celebrate them. */
export function claimNewBadges(
  pool: { slug: string; acs_element_code: string }[],
  mastery: MasteryMap = loadMastery()
): BadgeDef[] {
  if (typeof window === "undefined" || pool.length === 0) return [];
  const have = loadEarned();
  const qualified = evaluate(pool, mastery);
  const fresh = BADGES.filter((b) => qualified.has(b.id) && !have[b.id]);
  if (fresh.length > 0) {
    for (const b of fresh) have[b.id] = today();
    localStorage.setItem(BADGES_KEY, JSON.stringify(have));
  }
  return fresh;
}
