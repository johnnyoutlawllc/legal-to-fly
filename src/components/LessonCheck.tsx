"use client";

import { useState } from "react";
import { useInstructor } from "@/lib/instructor";
import { CHECK_VOICE } from "@/lib/instructors";

/** Inline tap-to-answer knowledge check used inside lesson bodies via the
 *  `::check ... ::` block. Deliberately not graded or recorded anywhere —
 *  it exists to keep reading active, not to feed mastery or the SRS. */

const LETTERS = ["A", "B", "C", "D"];

const DEFAULT = {
  right: ["Nailed it."],
  wrong: ["Not quite."],
};

const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

export default function LessonCheck({
  q,
  choices,
  correct,
  why,
}: {
  q: string;
  choices: string[];
  correct: number;
  why: string;
}) {
  const { instructor } = useInstructor();
  const [picked, setPicked] = useState<number | null>(null);
  const [verdict, setVerdict] = useState("");
  const answered = picked !== null;
  const right = picked === correct;

  const answer = (j: number) => {
    setPicked(j);
    const bank = instructor ? CHECK_VOICE[instructor] : DEFAULT;
    setVerdict(pick(j === correct ? bank.right : bank.wrong) + " ");
  };

  return (
    <div
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
      data-ltf-hl
      data-ltf-tip="Quick checks keep reading active. They are not graded."
      data-ltf-myth="Skip these. Real pilots don't need practice questions."
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
        ✈ Quick check
      </p>
      <p className="mt-2 font-medium leading-6">{q}</p>
      <div className="mt-4 space-y-2">
        {choices.map((c, j) => {
          let cls = "border-[var(--border)] hover:bg-[var(--surface-2)]";
          if (answered) {
            if (j === correct) cls = "border-[var(--correct)] bg-[var(--correct)]/10";
            else if (j === picked) cls = "border-[var(--wrong)] bg-[var(--wrong)]/10";
            else cls = "border-[var(--border)] opacity-50";
          }
          return (
            <button
              key={j}
              disabled={answered}
              onClick={() => answer(j)}
              className={`flex w-full items-start gap-3 rounded-lg border px-4 py-2.5 text-left text-sm leading-6 transition-colors ${cls} ${
                answered ? "" : "cursor-pointer"
              }`}
            >
              <span className="mt-0.5 font-mono text-xs text-[var(--muted)]">
                {LETTERS[j]}
              </span>
              <span>{c}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          <span
            className={`font-semibold ${
              right ? "text-[var(--correct)]" : "text-[var(--wrong)]"
            }`}
          >
            {verdict}
          </span>
          {why}
        </p>
      )}
    </div>
  );
}
