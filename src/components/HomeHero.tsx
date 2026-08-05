"use client";

import Link from "next/link";
import { useInstructor } from "@/lib/instructor";
import { homeVoice } from "@/lib/instructors";

/** Hero copy that swaps with the selected instructor. */

export default function HomeHero() {
  const { instructor } = useInstructor();
  const v = homeVoice(instructor);

  return (
    <section className="py-20 sm:py-24">
      <p
        className="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--accent)]"
        data-ltf-hl
        data-ltf-tip="Part 107 is the certificate that lets you fly for hire."
      >
        {v.eyebrow}
      </p>
      <h1
        className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl"
        data-ltf-hl
        data-ltf-tip="This is the whole pitch: you can fly; the test makes it official."
      >
        {v.headline}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">{v.sub}</p>

      <div
        className="mt-10 flex flex-col gap-3 sm:flex-row"
        data-ltf-hl
        data-ltf-tip="Start with the daily drill. Ten questions is enough."
        data-ltf-myth="Skip the drill. Just binge a four-hour video like everyone else."
      >
        <Link
          href="/drill"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
        >
          {v.drillCta}
        </Link>
        <Link
          href="/learn"
          className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface)]"
        >
          {v.learnCta}
        </Link>
        <Link
          href="#path"
          className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface)]"
        >
          {v.pathCta}
        </Link>
        <Link
          href="/exam"
          className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface)]"
        >
          {v.examCta}
        </Link>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">{v.footnote}</p>
    </section>
  );
}
