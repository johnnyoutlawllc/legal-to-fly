import { areaFromElement } from "@/lib/types";

/** Mastery is the fuel for the flight path and the badges: one record per
 *  question slug, fed by every surface (practice, drill, exam). A question
 *  counts as mastered once it has been answered correctly at least once.
 *  Separate from the SRS schedule on purpose — grading practice answers into
 *  SM-2 would pollute the drill's scheduling. Keyed by slug, which survives
 *  re-seeds where UUIDs would not. */

export type MasteryItem = {
  correct: number;
  seen: number;
};

export type MasteryMap = Record<string, MasteryItem>;

const MASTERY_KEY = "ltf_mastery_v1";
const EXAMS_KEY = "ltf_exams_v1";

export type ExamRecord = {
  /** YYYY-MM-DD */
  date: string;
  pct: number;
};

export function loadMastery(): MasteryMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(MASTERY_KEY) ?? "{}") as MasteryMap;
  } catch {
    return {};
  }
}

export function saveMastery(map: MasteryMap): void {
  localStorage.setItem(MASTERY_KEY, JSON.stringify(map));
}

/** Load, record one answer, save. Returns the updated map. */
export function recordAnswer(slug: string, correct: boolean): MasteryMap {
  const map = loadMastery();
  const item = map[slug] ?? { correct: 0, seen: 0 };
  map[slug] = {
    correct: item.correct + (correct ? 1 : 0),
    seen: item.seen + 1,
  };
  saveMastery(map);
  return map;
}

export function isMastered(item: MasteryItem | undefined): boolean {
  return (item?.correct ?? 0) >= 1;
}

export type AreaProgress = {
  area: string;
  mastered: number;
  total: number;
  pct: number;
};

/** Per-area mastered counts against the loaded pool. `pool` only needs slug
 *  and acs_element_code, so callers can fetch a light column list. */
export function areaProgress(
  pool: { slug: string; acs_element_code: string }[],
  mastery: MasteryMap
): AreaProgress[] {
  const acc: Record<string, { mastered: number; total: number }> = {};
  for (const q of pool) {
    const area = areaFromElement(q.acs_element_code);
    acc[area] ??= { mastered: 0, total: 0 };
    acc[area].total += 1;
    if (isMastered(mastery[q.slug])) acc[area].mastered += 1;
  }
  const order = ["I", "II", "III", "IV", "V"];
  return Object.entries(acc)
    .map(([area, s]) => ({
      area,
      ...s,
      pct: s.total ? Math.round((s.mastered / s.total) * 100) : 0,
    }))
    .sort((a, b) => order.indexOf(a.area) - order.indexOf(b.area));
}

export function loadExams(): ExamRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(EXAMS_KEY) ?? "[]") as ExamRecord[];
  } catch {
    return [];
  }
}

export function recordExam(pct: number, date: string): ExamRecord[] {
  const exams = loadExams();
  exams.push({ date, pct });
  localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
  return exams;
}
