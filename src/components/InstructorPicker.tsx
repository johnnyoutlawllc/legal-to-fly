"use client";

import { INSTRUCTORS, type InstructorId } from "@/lib/instructors";
import { useInstructor } from "@/lib/instructor";
import InstructorAvatar from "./InstructorAvatar";

/** Home-page roster. Persists under ltf_instructor_v1. */

export default function InstructorPicker() {
  const { instructor, setInstructor, ready } = useInstructor();

  return (
    <section
      id="instructors"
      className="border-t border-[var(--border)] py-16"
      data-ltf-hl
      data-ltf-tip="Pick a guide. They follow you through lessons and drills."
    >
      <p className="text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
        Choose your instructor
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        Who&apos;s teaching today?
      </h2>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        Same rules, same ACS codes. Different voice on your shoulder. Switch
        anytime.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INSTRUCTORS.map((i) => {
          const on = ready && instructor === i.id;
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => setInstructor(i.id)}
              className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-colors ${
                on
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <InstructorAvatar id={i.id} className="h-14 w-14 shrink-0" />
              <span className="min-w-0">
                <span className="block font-semibold" style={{ color: on ? i.accent : undefined }}>
                  {i.name}
                </span>
                <span className="mt-0.5 block text-sm text-[var(--accent)]">{i.tagline}</span>
                <span className="mt-2 block text-sm leading-5 text-[var(--muted)]">{i.blurb}</span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setInstructor(null)}
          className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-colors sm:col-span-2 lg:col-span-1 ${
            ready && instructor === null
              ? "border-[var(--accent)] bg-[var(--accent)]/10"
              : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
          }`}
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[var(--surface-2)] text-2xl">
            ✕
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">Study solo</span>
            <span className="mt-0.5 block text-sm text-[var(--accent)]">No guide. Just the material.</span>
            <span className="mt-2 block text-sm leading-5 text-[var(--muted)]">
              Hide the animated instructor and keep the default copy.
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}

export function InstructorMiniSelect({ className = "" }: { className?: string }) {
  const { instructor, setInstructor } = useInstructor();
  return (
    <label className={`flex items-center gap-2 text-xs text-[var(--muted)] ${className}`}>
      <span className="uppercase tracking-widest">Guide</span>
      <select
        value={instructor ?? "solo"}
        onChange={(e) => {
          const v = e.target.value;
          setInstructor(v === "solo" ? null : (v as InstructorId));
        }}
        className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--text)]"
      >
        <option value="solo">Solo</option>
        {INSTRUCTORS.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </select>
    </label>
  );
}
