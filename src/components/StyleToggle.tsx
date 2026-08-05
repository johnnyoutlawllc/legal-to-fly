"use client";

import { useLearningStyle } from "@/lib/style";
import { InstructorMiniSelect } from "./InstructorPicker";

/** Floating learning-style switch, mounted once in the root layout so it is
 *  on every page. Serious keeps the site as-is; Playful unlocks mini-games
 *  and looser feedback. Instructor sits beside it so you can switch guides
 *  without returning home. */

export default function StyleToggle() {
  const { style, setStyle } = useLearningStyle();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/95 p-1 shadow-lg shadow-black/40 backdrop-blur">
        <span className="hidden pl-2 pr-1 text-[10px] uppercase tracking-widest text-[var(--muted)] sm:block">
          Style
        </span>
        <button
          onClick={() => setStyle("serious")}
          title="Serious: just the material"
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            style === "serious"
              ? "bg-[var(--accent)] text-black"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          Serious
        </button>
        <button
          onClick={() => setStyle("playful")}
          title="Playful: mini-games and mischief"
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            style === "playful"
              ? "bg-[var(--accent)] text-black"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          Playful
        </button>
      </div>
      <div className="rounded-full border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-1.5 shadow-lg shadow-black/40 backdrop-blur">
        <InstructorMiniSelect />
      </div>
    </div>
  );
}
