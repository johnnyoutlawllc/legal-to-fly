"use client";

import { LEVELS, type Level } from "@/lib/difficulty";

export function LevelPicker({
  value,
  onChange,
  showHint = true,
}: {
  value: Level;
  onChange: (level: Level) => void;
  showHint?: boolean;
}) {
  const hint = LEVELS.find((l) => l.id === value)?.hint;
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Difficulty"
        className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1"
      >
        {LEVELS.map((l) => {
          const active = l.id === value;
          return (
            <button
              key={l.id}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(l.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--accent)] text-black"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {l.label}
            </button>
          );
        })}
      </div>
      {showHint && hint && <p className="mt-2 text-sm text-[var(--muted)]">{hint}</p>}
    </div>
  );
}
