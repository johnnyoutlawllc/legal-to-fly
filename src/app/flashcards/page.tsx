"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { areaFromElement, shuffle, type Question } from "@/lib/types";
import { AREA_TITLES, SELECT_QUESTION_COLUMNS, prepare } from "@/lib/session";
import {
  EXAM_CALCULATION_QUESTIONS,
  EXAM_FIGURE_QUESTIONS,
  EXAM_SCENARIO_QUESTIONS,
  FAA_SUPPLEMENT_URL,
} from "@/content/exam-figure-questions";
import { FAA_SAMPLE_QUESTIONS } from "@/content/faa-sample-questions";

type Phase = "loading" | "ready" | "running" | "error";
type Mode = "auto" | "manual";
type SpeedId = "relaxed" | "normal" | "fast";
type Deck = "all" | "faa" | "charts" | "I" | "II" | "III" | "IV" | "V";

/** Seconds on the question, seconds on the answer, plus reading time per
 *  word of explanation so a long explanation is not cut off. */
const SPEEDS: { id: SpeedId; label: string; question: number; answer: number; perWord: number }[] = [
  { id: "relaxed", label: "Relaxed", question: 10, answer: 5, perWord: 0.25 },
  { id: "normal", label: "Normal", question: 6, answer: 3, perWord: 0.17 },
  { id: "fast", label: "Fast", question: 3, answer: 2, perWord: 0.1 },
];

const DECKS: { id: Deck; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "faa", label: "FAA sample questions" },
  { id: "charts", label: "Charts, METARs & math" },
  { id: "I", label: `I · ${AREA_TITLES.I}` },
  { id: "II", label: `II · ${AREA_TITLES.II}` },
  { id: "III", label: `III · ${AREA_TITLES.III}` },
  { id: "IV", label: `IV · ${AREA_TITLES.IV}` },
  { id: "V", label: `V · ${AREA_TITLES.V}` },
];

const BUILT_IN = [...EXAM_FIGURE_QUESTIONS, ...EXAM_CALCULATION_QUESTIONS, ...EXAM_SCENARIO_QUESTIONS];
const SETTINGS_KEY = "ltf_flashcards_v1";
const TICK_MS = 100;

type Settings = { deck: Deck; mode: Mode; speed: SpeedId; showChoices: boolean; showWhy: boolean };
const DEFAULTS: Settings = { deck: "all", mode: "auto", speed: "normal", showChoices: false, showWhy: true };

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") };
  } catch {
    return DEFAULTS;
  }
}

function deckOf(deck: Deck, bank: Question[]): Question[] {
  if (deck === "faa") return FAA_SAMPLE_QUESTIONS;
  if (deck === "charts") return [...BUILT_IN, ...FAA_SAMPLE_QUESTIONS.filter((q) => q.figure)];
  const all = [...bank, ...BUILT_IN, ...FAA_SAMPLE_QUESTIONS];
  return deck === "all" ? all : all.filter((q) => areaFromElement(q.acs_element_code) === deck);
}

export default function FlashcardsPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [bank, setBank] = useState<Question[]>([]);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [cards, setCards] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("questions").select(SELECT_QUESTION_COLUMNS).eq("is_active", true);
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setPhase("error");
        return;
      }
      setBank(prepare(data));
      setPhase("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (patch: Partial<Settings>) =>
    setSettings((s) => {
      const next = { ...s, ...patch };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

  const speed = SPEEDS.find((s) => s.id === settings.speed) ?? SPEEDS[1];
  const card = cards[index];
  const duration = useMemo(() => {
    if (!card) return 0;
    if (!flipped) return speed.question + (settings.showChoices ? 2 : 0) + (card.figure ? 4 : 0);
    const words = settings.showWhy ? card.explanation.split(/\s+/).length : 0;
    return speed.answer + words * speed.perWord;
  }, [card, flipped, speed, settings.showChoices, settings.showWhy]);

  const go = useCallback(
    (to: number) => {
      setIndex(((to % cards.length) + cards.length) % cards.length);
      setFlipped(false);
      elapsedRef.current = 0;
      setElapsed(0);
    },
    [cards.length],
  );

  const flip = useCallback(() => {
    elapsedRef.current = 0;
    setElapsed(0);
    if (flipped) go(index + 1);
    else setFlipped(true);
  }, [flipped, go, index]);

  const start = () => {
    setCards(shuffle(deckOf(settings.deck, bank)));
    setIndex(0);
    setFlipped(false);
    setPaused(false);
    elapsedRef.current = 0;
    setElapsed(0);
    setPhase("running");
    window.scrollTo(0, 0);
  };

  // Auto mode: count up while not paused; flip or advance when the side's time is up.
  const auto = phase === "running" && settings.mode === "auto" && !paused;
  const durationRef = useRef(duration);
  const flipRef = useRef(flip);
  useEffect(() => {
    durationRef.current = duration;
    flipRef.current = flip;
  }, [duration, flip]);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      elapsedRef.current += TICK_MS / 1000;
      if (durationRef.current > 0 && elapsedRef.current >= durationRef.current) flipRef.current();
      else setElapsed(elapsedRef.current);
    }, TICK_MS);
    return () => clearInterval(t);
  }, [auto]);

  useEffect(() => {
    if (phase !== "running") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLButtonElement) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      } else if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key.toLowerCase() === "p" && settings.mode === "auto") setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, flip, go, index, settings.mode]);

  if (phase === "error") {
    return (
      <Shell>
        <p className="text-[var(--wrong)]">Could not load questions: {error}</p>
      </Shell>
    );
  }

  if (phase === "loading") {
    return (
      <Shell>
        <p className="text-[var(--muted)]">Loading question bank…</p>
      </Shell>
    );
  }

  if (phase === "ready") {
    const count = deckOf(settings.deck, bank).length;
    return (
      <Shell>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Flash cards</h1>
          <p className="mt-3 leading-7 text-[var(--muted)]">
            Quick study: see the question, then the answer and why. Let it run on its own, or flip
            each card yourself. Nothing is graded.
          </p>

          <Setting label="Deck">
            <select
              value={settings.deck}
              onChange={(e) => update({ deck: e.target.value as Deck })}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 sm:w-auto"
            >
              {DECKS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <span className="ml-0 mt-2 block text-sm text-[var(--muted)] sm:ml-3 sm:mt-0 sm:inline">{count} cards</span>
          </Setting>

          <Setting label="Advance">
            <Toggle
              options={[
                ["auto", "Automatic"],
                ["manual", "Manual"],
              ]}
              value={settings.mode}
              onChange={(mode) => update({ mode })}
            />
          </Setting>

          {settings.mode === "auto" && (
            <Setting label="Speed">
              <Toggle options={SPEEDS.map((s) => [s.id, s.label] as [SpeedId, string])} value={settings.speed} onChange={(s) => update({ speed: s })} />
              <p className="mt-2 text-sm text-[var(--muted)]">
                About {speed.question}s on the question, then {speed.answer}s plus reading time on the answer.
              </p>
            </Setting>
          )}

          <div className="mt-6 space-y-3 text-sm">
            <Check checked={settings.showChoices} onChange={(v) => update({ showChoices: v })} label="Show the answer choices on the question side" />
            <Check checked={settings.showWhy} onChange={(v) => update({ showWhy: v })} label="Show the explanation with the answer" />
          </div>

          <button onClick={start} disabled={count === 0} className="mt-8 h-12 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40">
            Start
          </button>
          <p className="mt-4 text-xs text-[var(--muted)]">Keys: Space flips · ← → move · P pauses</p>
        </div>
      </Shell>
    );
  }

  const correct = card.choices.find((c) => c.is_correct);
  const pct = duration ? Math.min(100, (elapsed / duration) * 100) : 0;

  return (
    <Shell>
      <div className="mb-4 flex items-center justify-between text-sm text-[var(--muted)]">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <button onClick={() => setPhase("ready")} className="hover:text-[var(--text)]">
          Settings
        </button>
      </div>

      {settings.mode === "auto" && (
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className={`h-full ${flipped ? "bg-[var(--correct)]" : "bg-[var(--accent)]"}`} style={{ width: `${pct}%` }} />
        </div>
      )}

      <div
        onClick={flip}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Next card" : "Show answer"}
        className="min-h-[320px] cursor-pointer select-none rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
          {flipped ? "Answer" : "Question"} · <span className="font-mono text-[var(--accent)]">{card.acs_element_code}</span>
        </p>
        <p className={`mt-3 leading-8 ${flipped ? "text-base text-[var(--muted)]" : "text-lg"}`}>{card.stem}</p>

        {card.figure && !flipped && (
          <figure className="mt-4" onClick={(e) => e.stopPropagation()}>
            <a href={card.figure.src} target="_blank" rel="noopener noreferrer" title="Open full-size figure">
              <Image src={card.figure.src} alt={card.figure.alt} width={990} height={1280} unoptimized className="h-auto max-h-[420px] w-full rounded-lg border border-[var(--border)] object-contain" />
            </a>
            <figcaption className="mt-2 text-xs text-[var(--muted)]">
              {card.figure.label} · Source:{" "}
              <a href={FAA_SUPPLEMENT_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">FAA-CT-8080-2H</a>
            </figcaption>
          </figure>
        )}

        {settings.showChoices && !flipped && (
          <ul className="mt-5 space-y-2">
            {card.choices.map((c) => (
              <li key={c.id} className="rounded-lg border border-[var(--border)] px-4 py-2.5">
                {c.body}
              </li>
            ))}
          </ul>
        )}

        {flipped && (
          <>
            <p className="mt-5 rounded-lg border border-[var(--correct)]/60 bg-[var(--correct)]/10 px-4 py-3 text-lg font-medium">{correct?.body}</p>
            {settings.showWhy && <p className="mt-4 leading-7 text-[var(--muted)]">{card.explanation}</p>}
            {card.citation && <p className="mt-3 font-mono text-xs text-[var(--muted)]">{card.citation}</p>}
          </>
        )}

        {settings.mode === "manual" && <p className="mt-6 text-xs text-[var(--muted)]">{flipped ? "Tap for the next card" : "Tap to see the answer"}</p>}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={() => go(index - 1)} className="h-11 rounded-lg border border-[var(--border)] px-5 transition-colors hover:bg-[var(--surface-2)]">
          Back
        </button>
        {settings.mode === "auto" && (
          <button onClick={() => setPaused((p) => !p)} className="h-11 rounded-lg border border-[var(--border)] px-5 transition-colors hover:bg-[var(--surface-2)]">
            {paused ? "Resume" : "Pause"}
          </button>
        )}
        <button onClick={flip} className="h-11 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90">
          {flipped ? "Next" : "Show answer"}
        </button>
        {settings.mode === "auto" && (
          <div className="ml-auto flex gap-1" role="group" aria-label="Speed">
            {SPEEDS.map((s) => (
              <button
                key={s.id}
                onClick={() => update({ speed: s.id })}
                aria-pressed={settings.speed === s.id}
                className={`h-9 rounded-lg border px-3 text-sm transition-colors ${
                  settings.speed === s.id ? "border-[var(--accent)] bg-[var(--accent)] text-black" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[var(--muted)]">{label}</p>
      {children}
    </div>
  );
}

function Toggle<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className={`h-10 rounded-lg border px-4 text-sm font-medium transition-colors ${
            value === id ? "border-[var(--accent)] bg-[var(--accent)] text-black" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
      <span>{label}</span>
    </label>
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
