import { areaFromElement, shuffle, type Question } from "@/lib/types";
import { loadMastery } from "@/lib/mastery";
import {
  EXAM_CALCULATION_QUESTIONS,
  EXAM_FIGURE_QUESTIONS,
  EXAM_SCENARIO_QUESTIONS,
} from "@/content/exam-figure-questions";

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

/** Shuffle, then put questions this browser has not answered (or answered
 *  longest ago) first, so a retake draws new questions before repeats. Last
 *  answers are bucketed by hour so one session's questions stay mixed. */
export function freshFirst(pool: Question[]): Question[] {
  const mastery = loadMastery();
  const age = (q: Question) => Math.floor((mastery[q.slug]?.last ?? 0) / 3_600_000);
  return shuffle(pool).sort((a, b) => age(a) - age(b));
}

export function buildSession(all: Question[], size: number): Question[] {
  const pools: Record<string, Question[]> = {};
  for (const q of all) {
    const area = areaFromElement(q.acs_element_code);
    (pools[area] ??= []).push(q);
  }

  const picked: Question[] = [];
  for (const [area, weight] of Object.entries(AREA_WEIGHTS)) {
    const pool = freshFirst(pools[area] ?? []);
    picked.push(...pool.slice(0, Math.round(size * weight)));
  }

  // Rounding, or a thin pool in one area, can leave us short of the target.
  if (picked.length < size) {
    const chosen = new Set(picked.map((q) => q.id));
    picked.push(
      ...freshFirst(all.filter((q) => !chosen.has(q.id))).slice(0, size - picked.length)
    );
  }

  return shuffle(picked).slice(0, size);
}

/** Vary applied questions between attempts while retaining charts, calculations,
 *  scenarios, and the published ACS area mix on every 60-question mock. */
export function buildExamSession(all: Question[]): Question[] {
  const target: Record<string, number> = { I: 12, II: 12, III: 8, IV: 5, V: 23 };
  const selected = [
    ...freshFirst(EXAM_FIGURE_QUESTIONS).slice(0, 5),
    ...freshFirst(EXAM_CALCULATION_QUESTIONS).slice(0, 3),
    ...freshFirst(EXAM_SCENARIO_QUESTIONS).slice(0, 2),
  ];
  const chosen = new Set(selected.map((question) => question.id));
  const available = freshFirst(all.filter((question) => !chosen.has(question.id)));
  for (const question of selected) target[areaFromElement(question.acs_element_code)] -= 1;
  for (const [area, count] of Object.entries(target)) {
    const candidates = available.filter((question) => areaFromElement(question.acs_element_code) === area && !chosen.has(question.id));
    for (const question of candidates.slice(0, count)) {
      selected.push(question);
      chosen.add(question.id);
    }
  }
  if (selected.length < EXAM_QUESTION_COUNT) {
    selected.push(...available.filter((question) => !chosen.has(question.id)).slice(0, EXAM_QUESTION_COUNT - selected.length));
  }
  return shuffle(selected).slice(0, EXAM_QUESTION_COUNT);
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Choices load in authored order; lib/difficulty picks, shuffles and
 *  re-letters them per session. */
export const SELECT_QUESTION_COLUMNS =
  "id, slug, stem, explanation, acs_element_code, difficulty, citation, choices(id,label,body,is_correct,rationale,sort_order,tier)";

export function prepare(rows: unknown): Question[] {
  return ((rows ?? []) as Question[]).map((q) => ({
    ...q,
    choices: [...q.choices].sort((a, b) => a.sort_order - b.sort_order),
  }));
}
