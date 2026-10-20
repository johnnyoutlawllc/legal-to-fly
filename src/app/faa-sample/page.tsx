"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { FAA_SUPPLEMENT_URL } from "@/content/exam-figure-questions";
import { FAA_SAMPLE_PDF_URL, FAA_SAMPLE_QUESTIONS } from "@/content/faa-sample-questions";
import { PASS_PERCENT } from "@/lib/session";
import { shuffle, type Question } from "@/lib/types";

type Phase = "ready" | "running" | "done";
type Filter = "all" | "wrong";

/** Question order and answer order are shuffled per attempt, then re-lettered,
 *  so a retake tests the material rather than the memory of "it was C". */
function buildAttempt(mix: boolean): Question[] {
  const qs = mix ? shuffle(FAA_SAMPLE_QUESTIONS) : FAA_SAMPLE_QUESTIONS;
  return qs.map((q) => ({
    ...q,
    choices: (mix ? shuffle(q.choices) : q.choices).map((c, i) => ({ ...c, label: "ABC"[i], sort_order: i })),
  }));
}

export default function FaaSamplePage() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [mix, setMix] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");

  const start = useCallback(() => {
    setQuestions(buildAttempt(mix));
    setAnswers({});
    setIndex(0);
    setFilter("all");
    setPhase("running");
    window.scrollTo(0, 0);
  }, [mix]);

  const finish = useCallback(() => {
    setPhase("done");
    window.scrollTo(0, 0);
  }, []);

  const scored = useMemo(() => {
    const correct = questions.filter((q) => q.choices.find((c) => c.id === answers[q.id])?.is_correct).length;
    const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, pct, passed: pct >= PASS_PERCENT };
  }, [questions, answers]);

  if (phase === "ready") {
    return (
      <Shell>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-sm font-medium uppercase tracking-widest text-[var(--accent)]">From the FAA</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">FAA Sample Questions</h1>
          <p className="mt-3 leading-7 text-[var(--muted)]">
            All {FAA_SAMPLE_QUESTIONS.length} of the FAA&apos;s published sample questions for the
            Unmanned Aircraft General (UAG) test, worded exactly as the FAA wrote them, with the
            chart figures they refer to. Answer them all, then submit to see the correct answers and
            why.
          </p>
          <p className="mt-4 rounded-lg border border-[var(--accent)]/50 bg-[var(--accent)]/10 p-4 text-sm leading-6">
            The FAA publishes these questions without an answer key. The answers and explanations
            here are ours, checked against 14 CFR and the{" "}
            <a href={FAA_SUPPLEMENT_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">FAA-CT-8080-2H supplement</a>.
            Source:{" "}
            <a href={FAA_SAMPLE_PDF_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">FAA UAG sample questions (PDF)</a>.
          </p>
          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={mix} onChange={(e) => setMix(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            <span>
              <span className="font-medium">Mix up questions and answers</span>
              <span className="block text-[var(--muted)]">Turn off to take them in the FAA&apos;s original order and lettering.</span>
            </span>
          </label>
          <button onClick={start} className="mt-8 h-12 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90">
            Start
          </button>
        </div>
      </Shell>
    );
  }

  if (phase === "done") {
    const wrong = questions.length - scored.correct;
    return (
      <Shell>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-sm uppercase tracking-widest text-[var(--muted)]">FAA Sample Questions</p>
          <p className="mt-3 text-6xl font-semibold tracking-tight">{scored.pct}%</p>
          <p className={`mt-3 text-lg font-medium ${scored.passed ? "text-[var(--correct)]" : "text-[var(--wrong)]"}`}>
            {scored.passed ? "Passing score" : "Below passing"}
          </p>
          <p className="mt-1 text-[var(--muted)]">
            {scored.correct} of {questions.length} correct. The real exam needs {PASS_PERCENT}%.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={start} className="h-11 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90">
              Take it again
            </button>
            <Link href="/exam" className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface-2)]">
              Take a mock exam
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Answers and help</h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter review">
            {([["all", "All", questions.length], ["wrong", "Wrong", wrong]] as const).map(([id, label, n]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                aria-pressed={filter === id}
                className={`h-9 rounded-lg border px-3 text-sm font-medium transition-colors ${
                  filter === id ? "border-[var(--accent)] bg-[var(--accent)] text-black" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {label} <span className="tabular-nums opacity-70">{n}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {questions.map((q, i) => {
            const picked = q.choices.find((c) => c.id === answers[q.id]);
            const correct = q.choices.find((c) => c.is_correct);
            const ok = !!picked?.is_correct;
            if (filter === "wrong" && ok) return null;
            return (
              <div key={q.id} className={`rounded-xl border bg-[var(--surface)] p-5 ${ok ? "border-[var(--border)]" : "border-[var(--wrong)]"}`}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-medium leading-7">
                    <span className="mr-2 text-[var(--muted)]">{i + 1}.</span>
                    {q.stem}
                  </p>
                  <span className={`shrink-0 text-sm ${ok ? "text-[var(--correct)]" : "text-[var(--wrong)]"}`}>
                    {ok ? "Correct" : picked ? "Wrong" : "Skipped"}
                  </span>
                </div>
                <QuestionFigure question={q} />
                {picked && !ok && (
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    <span className="text-[var(--wrong)]">You answered {picked.label}:</span> {picked.body}
                  </p>
                )}
                <p className="mt-3 text-sm text-[var(--muted)]">
                  <span className="text-[var(--correct)]">Answer {correct?.label}:</span> {correct?.body}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  <span className="text-[var(--text)]">Why:</span> {q.explanation}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {q.citation && (
                    <span className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono">{q.citation}</span>
                  )}
                  <span className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono text-[var(--accent)]">{q.acs_element_code}</span>
                </div>
              </div>
            );
          })}
          {filter === "wrong" && wrong === 0 && (
            <p className="text-sm text-[var(--muted)]">Nothing wrong. Every answer was correct.</p>
          )}
        </div>
      </Shell>
    );
  }

  const current = questions[index];
  const answeredCount = Object.keys(answers).length;
  const last = index === questions.length - 1;

  return (
    <Shell>
      <div className="mb-5 text-sm text-[var(--muted)]">
        Question {index + 1} of {questions.length} · {answeredCount} answered
      </div>

      <div className="mb-5 flex flex-wrap gap-1">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setIndex(i)}
            aria-label={`Go to question ${i + 1}`}
            className={`h-6 w-6 rounded font-mono text-[10px] transition-colors ${
              i === index
                ? "bg-[var(--accent)] text-black"
                : answers[q.id]
                  ? "bg-[var(--surface-2)] text-[var(--text)]"
                  : "bg-[var(--surface)] text-[var(--muted)]"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <p className="text-lg leading-8">{current.stem}</p>
        <QuestionFigure question={current} />

        <div className="mt-6 space-y-3">
          {current.choices.map((c) => {
            const selected = answers[current.id] === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setAnswers((a) => ({ ...a, [current.id]: c.id }))}
                className={`flex w-full gap-4 rounded-lg border px-4 py-3 text-left transition-colors ${
                  selected ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] hover:border-[var(--accent)]"
                }`}
              >
                <span className="font-mono text-sm text-[var(--muted)]">{c.label}</span>
                <span className="flex-1">{c.body}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="h-11 rounded-lg border border-[var(--border)] px-5 transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40"
          >
            Back
          </button>
          {!last && (
            <button
              onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="h-11 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
            >
              Next
            </button>
          )}
          <button
            onClick={finish}
            className={`ml-auto h-11 rounded-lg px-5 text-sm transition-colors ${
              last
                ? "bg-[var(--accent)] font-medium text-black hover:opacity-90"
                : "border border-[var(--wrong)] text-[var(--wrong)] hover:bg-[var(--wrong)]/10"
            }`}
          >
            Submit and see answers
          </button>
        </div>
      </div>
    </Shell>
  );
}

function QuestionFigure({ question }: { question: Question }) {
  if (!question.figure) return null;
  return (
    <figure className="mt-5">
      <a href={question.figure.src} target="_blank" rel="noopener noreferrer" title="Open full-size figure">
        <Image
          src={question.figure.src}
          alt={question.figure.alt}
          width={990}
          height={1280}
          unoptimized
          className="h-auto w-full rounded-lg border border-[var(--border)]"
        />
      </a>
      <figcaption className="mt-2 text-xs leading-5 text-[var(--muted)]">
        {question.figure.label} · Tap or click to enlarge · Source:{" "}
        <a href={FAA_SUPPLEMENT_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">FAA-CT-8080-2H</a>
      </figcaption>
    </figure>
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
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            Exit
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
