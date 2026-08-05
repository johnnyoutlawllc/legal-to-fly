"use client";

import { InstructorMiniSelect } from "./InstructorPicker";

/** Floating instructor switch, mounted once in the root layout. */

export default function GuideSelect() {
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-1.5 shadow-lg shadow-black/40 backdrop-blur">
      <InstructorMiniSelect />
    </div>
  );
}
