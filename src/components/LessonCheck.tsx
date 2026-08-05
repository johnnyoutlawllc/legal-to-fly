"use client";

import { useState } from "react";

/** Inline tap-to-answer knowledge check used inside lesson bodies via the
 *  `::check ... ::` block. Deliberately not graded or recorded anywhere —
 *  it exists to keep reading active, not to feed mastery or the SRS. */

const LETTERS = ["A", "B", "C", "D"];

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
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const right = picked === correct;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
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
              onClick={() => setPicked(j)}
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
            {right ? "Nailed it. " : "Not quite. "}
          </span>
          {why}
        </p>
      )}
    </div>
  );
}
