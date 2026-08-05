"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LESSONS, lessonBySlug } from "@/content/lessons";
import { AREA_TITLES } from "@/lib/session";
import { isLessonRead, markLessonRead } from "@/lib/lesson-progress";
import LessonBody from "@/components/LessonBody";

/** One ground-school lesson. Reaching the bottom is what marks it read; the
 *  exits push you into the question bank for the lesson's area, because the
 *  read only sticks once you've answered questions with it. */

export default function LessonPage() {
  const slug = useParams<{ slug: string }>().slug ?? "";
  const lesson = lessonBySlug(slug);
  const [read, setRead] = useState(false);

  useEffect(() => {
    if (lesson) setRead(isLessonRead(lesson.slug));
  }, [lesson]);

  if (!lesson) {
    return (
      <Shell>
        <p className="text-[var(--muted)]">
          That lesson does not exist.{" "}
          <Link href="/learn" className="text-[var(--accent)]">
            Back to ground school.
          </Link>
        </p>
      </Shell>
    );
  }

  const next = LESSONS.find((l) => l.order === lesson.order + 1);
  const finish = () => {
    markLessonRead(lesson.slug);
    setRead(true);
  };

  return (
    <Shell>
      <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
        Ground school · Lesson {lesson.order} of {LESSONS.length}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{lesson.title}</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Area {lesson.area} · {AREA_TITLES[lesson.area]} · {lesson.minutes} min
        read
      </p>
      <p className="mt-1 font-mono text-xs text-[var(--muted)]">
        ACS {lesson.acs.join(", ")} · {lesson.cites.join(" · ")}
      </p>

      <div className="mt-10">
        <LessonBody md={lesson.body} />
      </div>

      <div className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="font-semibold">
          {read ? "Lesson read." : "Done reading?"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          The read only sticks once you use it. Drill Area {lesson.area} while
          it is fresh.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/practice?area=${lesson.area}`}
            onClick={finish}
            className="inline-flex h-11 items-center rounded-lg bg-[var(--accent)] px-5 font-medium text-black transition-opacity hover:opacity-90"
          >
            Drill Area {lesson.area}
          </Link>
          {!read && (
            <button
              onClick={finish}
              className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-5 font-medium transition-colors hover:bg-[var(--surface-2)]"
            >
              Mark as read
            </button>
          )}
          {next ? (
            <Link
              href={`/learn/${next.slug}`}
              onClick={finish}
              className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-5 font-medium transition-colors hover:bg-[var(--surface-2)]"
            >
              Next: {next.title}
            </Link>
          ) : (
            <Link
              href="/exam"
              onClick={finish}
              className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-5 font-medium transition-colors hover:bg-[var(--surface-2)]"
            >
              Take the mock exam
            </Link>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Legal<span className="text-[var(--accent)]">to</span>Fly
          </Link>
          <Link
            href="/learn"
            className="text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            All lessons
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
