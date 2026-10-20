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
import { loadLevel, present, type Level } from "@/lib/difficulty";
import { Logo } from "@/components/site/Logo";

type Phase = "loading" | "ready" | "running" | "error";
type Mode = "auto" | "manual";
type Deck = "all" | "faa" | "charts" | "I" | "II" | "III" | "IV" | "V";

/** Two sliders: seconds on the question side and seconds on the answer side.
 *  Chart cards get extra question time to find the spot on the figure. */
const QUESTION_RANGE: [number, number] = [5, 30];
const ANSWER_RANGE: [number, number] = [3, 30];
const FIGURE_BONUS = 4;

/** Elimination waits until the question and all three choices could be read
 *  (at least half the question time), then knocks the wrong answers out
 *  evenly up to 85% of it, so the right one stands alone at the end. */
const READ_SECONDS_PER_WORD = 0.3;
const ELIM_START_MIN = 0.5;
const ELIM_START_MAX = 0.75;
const ELIM_END = 0.85;

const clamp = (v: unknown, [lo, hi]: [number, number], fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
};

/** A card is a question with its choices shuffled and a random order in
 *  which to knock out the wrong ones. */
type Card = Question & { elim: string[] };

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

/** `seconds` is the question time (its key predates the answer slider). */
type Settings = { deck: Deck; mode: Mode; seconds: number; answerSeconds: number; showChoices: boolean; eliminate: boolean; showWhy: boolean };
const DEFAULTS: Settings = { deck: "all", mode: "auto", seconds: 15, answerSeconds: 10, showChoices: false, eliminate: false, showWhy: true };

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const s = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") };
    return {
      ...s,
      seconds: clamp(s.seconds, QUESTION_RANGE, DEFAULTS.seconds),
      answerSeconds: clamp(s.answerSeconds, ANSWER_RANGE, DEFAULTS.answerSeconds),
    };
  } catch {
    return DEFAULTS;
  }
}

/** Same three choices practice would show at the saved difficulty level
 *  (some questions store extra wrong answers for Difficult), shuffled. */
function toCard(q: Question, level: Level): Card {
  const shown = present(q, level);
  return { ...shown, elim: shuffle(shown.choices.filter((c) => !c.is_correct)).map((c) => c.id) };
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
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [manualElim, setManualElim] = useState(0);
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

  const card = cards[index];
  const showChoices = settings.showChoices || settings.eliminate;
  const duration = useMemo(() => {
    if (!card) return 0;
    return flipped ? settings.answerSeconds : settings.seconds + (card.figure ? FIGURE_BONUS : 0);
  }, [card, flipped, settings.seconds, settings.answerSeconds]);

  // Elimination: in automatic mode the wrong answers fade out on a schedule
  // (see ELIM_* above), so only the right one is left when the timer runs
  // out. In manual mode each tap knocks one out.
  const wrongCount = card?.elim.length ?? 0;
  const elimTimes = useMemo(() => {
    if (!card || !duration) return [];
    const words = [card.stem, ...card.choices.map((c) => c.body)].join(" ").split(/\s+/).length;
    const startAt = Math.min(ELIM_START_MAX, Math.max(ELIM_START_MIN, (words * READ_SECONDS_PER_WORD) / duration));
    return card.elim.map((_, i) =>
      duration * (card.elim.length === 1 ? startAt : startAt + ((ELIM_END - startAt) * i) / (card.elim.length - 1)),
    );
  }, [card, duration]);
  const eliminated =
    !settings.eliminate || !card
      ? 0
      : flipped
        ? wrongCount
        : settings.mode === "manual"
          ? manualElim
          : elimTimes.filter((t) => elapsed >= t).length;
  const gone = new Set(card?.elim.slice(0, eliminated));

  const go = useCallback(
    (to: number) => {
      setIndex(((to % cards.length) + cards.length) % cards.length);
      setFlipped(false);
      setManualElim(0);
      elapsedRef.current = 0;
      setElapsed(0);
    },
    [cards.length],
  );

  const stepping = settings.mode === "manual" && settings.eliminate && !flipped && manualElim < wrongCount;
  const flip = useCallback(() => {
    if (stepping) {
      setManualElim((n) => n + 1);
      return;
    }
    elapsedRef.current = 0;
    setElapsed(0);
    if (flipped) go(index + 1);
    else setFlipped(true);
  }, [stepping, flipped, go, index]);

  const start = () => {
    const level = loadLevel();
    setCards(shuffle(deckOf(settings.deck, bank)).map((q) => toCard(q, level)));
    setIndex(0);
    setFlipped(false);
    setManualElim(0);
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
            <Setting label="Timers">
              <TimerSliders settings={settings} update={update} />
              <p className="mt-2 text-sm text-[var(--muted)]">Chart cards get {FIGURE_BONUS} extra seconds on the question.</p>
            </Setting>
          )}

          <div className="mt-6 space-y-3 text-sm">
            <Check
              checked={settings.eliminate}
              onChange={(v) => update({ eliminate: v })}
              label={
                settings.mode === "auto"
                  ? "Eliminate wrong answers one at a time, so only the right one is left when time runs out"
                  : "Eliminate wrong answers one at a time: each tap knocks one out"
              }
            />
            {!settings.eliminate && (
              <Check checked={settings.showChoices} onChange={(v) => update({ showChoices: v })} label="Show the answer choices on the question side" />
            )}
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

        {showChoices && !flipped && (
          <ul className="mt-5 space-y-2">
            {card.choices.map((c) => {
              const out = gone.has(c.id);
              const last = settings.eliminate && eliminated === wrongCount && c.is_correct;
              return (
                <li
                  key={c.id}
                  className={`flex gap-3 rounded-lg border px-4 py-2.5 transition-all duration-700 ${
                    out
                      ? "border-transparent text-[var(--muted)] line-through opacity-25"
                      : last
                        ? "border-[var(--correct)] bg-[var(--correct)]/10"
                        : "border-[var(--border)]"
                  }`}
                >
                  <span className="font-mono text-sm text-[var(--muted)]">{c.label}</span>
                  <span className="flex-1">{c.body}</span>
                </li>
              );
            })}
          </ul>
        )}

        {flipped && (
          <>
            <p className="mt-5 rounded-lg border border-[var(--correct)]/60 bg-[var(--correct)]/10 px-4 py-3 text-lg font-medium">{correct?.body}</p>
            {settings.showWhy && <p className="mt-4 leading-7 text-[var(--muted)]">{card.explanation}</p>}
            {card.citation && <p className="mt-3 font-mono text-xs text-[var(--muted)]">{card.citation}</p>}
          </>
        )}

        {settings.mode === "manual" && (
          <p className="mt-6 text-xs text-[var(--muted)]">
            {flipped ? "Tap for the next card" : stepping ? "Tap to knock out a wrong answer" : "Tap to see the answer"}
          </p>
        )}
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
          {flipped ? "Next" : stepping ? "Eliminate one" : "Show answer"}
        </button>
        {settings.mode === "auto" && (
          <div className="w-full sm:ml-auto sm:w-72">
            <TimerSliders settings={settings} update={update} />
          </div>
        )}
      </div>
    </Shell>
  );
}

function TimerSliders({ settings, update }: { settings: Settings; update: (patch: Partial<Settings>) => void }) {
  return (
    <div className="space-y-2">
      <SecondsSlider label="Question" range={QUESTION_RANGE} value={settings.seconds} onChange={(seconds) => update({ seconds })} />
      <SecondsSlider label="Answer" range={ANSWER_RANGE} value={settings.answerSeconds} onChange={(answerSeconds) => update({ answerSeconds })} />
    </div>
  );
}

function SecondsSlider({ label, range: [min, max], value, onChange }: { label: string; range: [number, number]; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-xs text-[var(--muted)]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} seconds`}
        className="h-2 w-full cursor-pointer accent-[var(--accent)]"
      />
      <span className="w-9 shrink-0 text-right font-mono tabular-nums text-[var(--accent)]">{value}s</span>
    </label>
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
          <Logo size="sm" />
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            Exit
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
