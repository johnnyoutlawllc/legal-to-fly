"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LESSONS } from "@/content/lessons";
import { AREA_TITLES } from "@/lib/session";
import { readLessons } from "@/lib/lesson-progress";

/** Ground school index. The lessons run in a deliberate order: learn the map,
 *  then the weather, then the aircraft, then the judgment calls. Each one ends
 *  by sending you into the question bank for that area. */

export default function LearnPage() {
  const [read, setRead] = useState<Set<string>>(new Set());
  useEffect(() => setRead(readLessons()), []);

  const done = LESSONS.filter((l) => read.has(l.slug)).length;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Legal<span className="text-[var(--accent)]">to</span>Fly
          </Link>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            Exit
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
          Ground school
        </p>
        <h1
          className="mt-2 text-3xl font-semibold tracking-tight"
          data-ltf-hl
          data-ltf-tip="Read in order. Charts first, then airspace, weather, and judgment."
        >
          The lessons behind the questions
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          Eight short reads that teach the skills the exam actually tests:
          reading a sectional chart, decoding a METAR, and the judgment
          vocabulary the FAA wants. Every lesson names its ACS tasks and the
          rules it comes from, and ends by sending you into the questions for
          that area.
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {done} of {LESSONS.length} read
        </p>

        <ol className="mt-8 space-y-3">
          {LESSONS.map((l) => (
            <li key={l.slug}>
              <Link
                href={`/learn/${l.slug}`}
                className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--surface-2)]"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                    read.has(l.slug)
                      ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                      : "border-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  {read.has(l.slug) ? "✓" : l.order}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{l.title}</span>
                  <span className="mt-0.5 block text-sm text-[var(--muted)]">
                    Area {l.area} · {AREA_TITLES[l.area]} · {l.minutes} min read
                  </span>
                </span>
                <span className="hidden shrink-0 font-mono text-xs text-[var(--muted)] sm:block">
                  {l.acs.join(" ")}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
