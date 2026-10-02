import { shuffle, type Choice, type Question } from "@/lib/types";

/** How hard the wrong answers are, not which questions you get.
 *
 *  Every wrong choice in `ltf.choices` carries a tier:
 *    1  obvious    – eliminable without knowing the rule
 *    2  plausible  – a real misconception
 *    3  tricky     – a near miss (adjacent number, swapped term, true but not
 *                    the answer). Difficult only; never shown on Standard.
 *  Both levels always show three choices.
 *  The correct choice has no tier. A missing tier reads as plausible, which
 *  is what the figure questions in src/content are. */
export type Level = "standard" | "difficult";

export const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: "standard", label: "Standard", hint: "Three choices. One is usually easy to rule out." },
  { id: "difficult", label: "Difficult", hint: "All three answers are plausible. No giveaways." },
];

const LEVEL_KEY = "ltf_level_v1";

export function loadLevel(): Level {
  if (typeof window === "undefined") return "standard";
  try {
    const v = localStorage.getItem(LEVEL_KEY);
    // "advanced" and "expert" were earlier names for Difficult (2026-10-02).
    return v === "difficult" || v === "advanced" || v === "expert" ? "difficult" : "standard";
  } catch {
    return "standard";
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

  // Difficult: a near miss plus the best of the rest, never an obvious one.
  // Top up from whatever is left so there are always three choices.
  const preferred =
    level === "standard" ? original : [...shuffle(tricky), ...shuffle(plausible)];
  const distractors = [...preferred, ...shuffle(wrong.filter((c) => !preferred.includes(c)))].slice(0, 2);

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
