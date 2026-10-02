import { shuffle, type Choice, type Question } from "@/lib/types";

/** How hard the wrong answers are, not which questions you get.
 *
 *  Every wrong choice in `ltf.choices` carries a tier:
 *    1  obvious    – eliminable without knowing the rule
 *    2  plausible  – a real misconception
 *    3  tricky     – a near miss (adjacent number, swapped term, true but not
 *                    the answer). Expert only; never shown on Easy.
 *  The correct choice has no tier. A missing tier reads as plausible, which
 *  is what the figure questions in src/content are. */
export type Level = "easy" | "advanced" | "expert";

export const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: "easy", label: "Easy", hint: "Three choices. One is usually easy to rule out." },
  { id: "advanced", label: "Advanced", hint: "The giveaway answer is gone. Only plausible choices remain." },
  { id: "expert", label: "Expert", hint: "Near misses: off-by-one numbers, swapped terms, true but not the answer." },
];

const LEVEL_KEY = "ltf_level_v1";

export function loadLevel(): Level {
  if (typeof window === "undefined") return "easy";
  try {
    const v = localStorage.getItem(LEVEL_KEY);
    return v === "advanced" || v === "expert" ? v : "easy";
  } catch {
    return "easy";
  }
}

export function saveLevel(level: Level): void {
  try {
    localStorage.setItem(LEVEL_KEY, level);
  } catch {}
}

const tierOf = (c: Choice) => c.tier ?? 2;

/** Pick the choices for a level, shuffle them, and re-letter A/B/C by
 *  position. Rationales never mention letters, so re-lettering is safe. */
export function present(q: Question, level: Level): Question {
  const correct = q.choices.filter((c) => c.is_correct);
  const wrong = q.choices.filter((c) => !c.is_correct);
  const original = wrong.filter((c) => tierOf(c) <= 2);
  const plausible = wrong.filter((c) => tierOf(c) === 2);
  const tricky = wrong.filter((c) => tierOf(c) === 3);

  let distractors: Choice[];
  if (level === "easy") {
    distractors = original;
  } else if (level === "advanced") {
    distractors = plausible.length ? plausible : tricky.slice(0, 1);
  } else {
    distractors = [...shuffle(tricky), ...shuffle(plausible)].slice(0, 2);
  }
  if (distractors.length === 0) distractors = original;

  const choices = shuffle([...correct, ...distractors]).map((c, i) => ({
    ...c,
    label: "ABCD"[i],
    sort_order: i,
  }));
  return { ...q, choices };
}

export function presentAll(questions: Question[], level: Level): Question[] {
  return questions.map((q) => present(q, level));
}
