import { areaFromElement, shuffle, type Question } from "@/lib/types";

export const AREA_TITLES: Record<string, string> = {
  I: "Regulations",
  II: "Airspace & Operating Requirements",
  III: "Weather",
  IV: "Loading & Performance",
  V: "Operations",
};

/** Midpoints of the FAA's published weightings for each area of operation.
 *  The bank is not proportional to these, so we sample to the weights rather
 *  than drawing uniformly. A uniform draw would over-test Regulations and
 *  under-test Operations, which is the opposite of the real exam. */
export const AREA_WEIGHTS: Record<string, number> = {
  I: 0.2,
  II: 0.2,
  III: 0.135,
  IV: 0.09,
  V: 0.4,
};

/** The real UAG exam: 60 questions, 2 hours, 70% to pass. */
export const EXAM_QUESTION_COUNT = 60;
export const EXAM_SECONDS = 2 * 60 * 60;
export const PASS_PERCENT = 70;

export const PRACTICE_SIZE = 20;

export function buildSession(all: Question[], size: number): Question[] {
  const pools: Record<string, Question[]> = {};
  for (const q of all) {
    const area = areaFromElement(q.acs_element_code);
    (pools[area] ??= []).push(q);
  }

  const picked: Question[] = [];
  for (const [area, weight] of Object.entries(AREA_WEIGHTS)) {
    const pool = shuffle(pools[area] ?? []);
    picked.push(...pool.slice(0, Math.round(size * weight)));
  }

  // Rounding, or a thin pool in one area, can leave us short of the target.
  if (picked.length < size) {
    const chosen = new Set(picked.map((q) => q.id));
    picked.push(
      ...shuffle(all.filter((q) => !chosen.has(q.id))).slice(0, size - picked.length)
    );
  }

  return shuffle(picked).slice(0, size);
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Question order is shuffled; choice order never is. The rationales refer to
 *  answers by letter, so shuffling choices would scramble the explanations. */
export const SELECT_QUESTION_COLUMNS =
  "id, slug, stem, explanation, acs_element_code, difficulty, citation, choices(id,label,body,is_correct,rationale,sort_order)";

export function prepare(rows: unknown): Question[] {
  return ((rows ?? []) as Question[]).map((q) => ({
    ...q,
    choices: [...q.choices].sort((a, b) => a.sort_order - b.sort_order),
  }));
}
