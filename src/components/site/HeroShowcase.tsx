"use client";

import { useEffect, useState } from "react";
import { BadgeIcon } from "@/components/Badges";
import { BADGES } from "@/lib/badges";
import { IconCards, IconExam, IconMap } from "@/components/site/Icons";

/** Static pictures of the product, one at a time, rotating. Illustrative, not
 *  live data. Hovering or picking a tab stops the rotation. */

const SLIDES = [
  { id: "cards", label: "Flash cards" },
  { id: "fly", label: "Can I fly here?" },
  { id: "progress", label: "Progress" },
  { id: "badges", label: "Badges" },
  { id: "report", label: "Mock exam" },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

const ROTATE_MS = 5000;

export function HeroShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % SLIDES.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [active, paused]);

  return (
    <div
      className="relative mx-auto w-full max-w-md lg:max-w-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Product previews">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => {
              setActive(i);
              setPaused(true);
            }}
            className={`relative overflow-hidden rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              i === active
                ? "border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--text)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid" aria-hidden>
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`col-start-1 row-start-1 transition-all duration-500 ${
              i === active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            <Frame>
              <Slide id={s.id} />
            </Frame>
          </div>
        ))}
      </div>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_40px_120px_-40px_rgba(255,107,53,0.35)]">
      {children}
    </div>
  );
}

function Slide({ id }: { id: SlideId }) {
  switch (id) {
    case "cards":
      return <CardsSlide />;
    case "fly":
      return <FlySlide />;
    case "progress":
      return <ProgressSlide />;
    case "badges":
      return <BadgesSlide />;
    case "report":
      return <ReportSlide />;
  }
}

function Head({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-xs text-[var(--muted)]">
      <span className="flex items-center gap-2">
        {icon} {title}
      </span>
      {right}
    </div>
  );
}

function CardsSlide() {
  const choices = [
    { body: "25 foot-pounds", out: true },
    { body: "11 foot-pounds", right: true },
    { body: "15 foot-pounds", out: true },
  ];
  return (
    <>
      <Head
        icon={<IconCards className="h-4 w-4 text-[var(--accent)]" />}
        title="Flash cards"
        right={<span className="font-mono text-[var(--accent)]">UA.I.E.K3b</span>}
      />
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="h-full w-[88%] bg-[var(--accent)]" />
      </div>
      <p className="mt-5 text-lg leading-7">What is the kinetic energy limit that defines eligibility for Category 2 operations?</p>
      <ul className="mt-5 space-y-2 text-sm">
        {choices.map((c, i) => (
          <li
            key={c.body}
            className={`flex gap-3 rounded-lg border px-4 py-2.5 ${
              c.right ? "border-[var(--correct)] bg-[var(--correct)]/10" : "border-transparent text-[var(--muted)] line-through opacity-30"
            }`}
          >
            <span className="font-mono text-[var(--muted)]">{"ABC"[i]}</span>
            {c.body}
          </li>
        ))}
      </ul>
      <p className="mt-4 font-mono text-[11px] text-[var(--muted)]">14 CFR 107.120</p>
    </>
  );
}

function FlySlide() {
  const rows: [string, string][] = [
    ["Airspace", "Class G at the surface"],
    ["TFRs", "None active nearby"],
    ["Nearest airport", "6.2 NM NE, heliport 3.1 NM"],
    ["METAR", "Wind 180° at 8 kt · 10 SM · clear"],
    ["Daylight", "Sunset 6:58 PM · civil twilight 7:22"],
    ["Kp index", "2 · quiet"],
  ];
  return (
    <>
      <Head icon={<IconMap className="h-4 w-4 text-[var(--accent)]" />} title="Can I fly here?" />
      <div className="relative mt-4 h-24 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
        <div aria-hidden className="fc-grid absolute inset-0 opacity-70" />
        <div className="absolute left-[18%] top-[-30%] h-40 w-40 rounded-full border-2 border-dashed border-sky-400/50" />
        <div className="absolute right-[12%] top-[20%] h-20 w-28 rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/10" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="block h-3 w-3 rounded-full bg-[var(--accent)] shadow-[0_0_14px_var(--accent)]" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--correct)] bg-[var(--correct)]/10 px-3 py-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-[var(--correct)]" />
        Class G at the surface: no ATC authorization needed
      </div>
      <dl className="mt-3 divide-y divide-[var(--border)] text-xs">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-1.5">
            <dt className="text-[var(--muted)]">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function ProgressSlide() {
  const areas: [string, string, number, number][] = [
    ["I", "Regulations", 59, 81],
    ["II", "Airspace", 18, 32],
    ["III", "Weather", 20, 35],
    ["IV", "Loading & Performance", 17, 17],
    ["V", "Operations", 62, 83],
  ];
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">Your flight path</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Turn every bar orange and you are ready.</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-center">
          <p className="text-lg font-semibold leading-6">71%</p>
          <p className="text-[10px] text-[var(--muted)]">mastered</p>
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {areas.map(([n, name, got, of]) => {
          const done = got === of;
          return (
            <li key={n}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-7 items-center justify-center rounded font-mono text-[10px] ${
                      done ? "bg-[var(--accent)] text-black" : "bg-[var(--surface-2)] text-[var(--accent)]"
                    }`}
                  >
                    {n}
                  </span>
                  {name}
                </span>
                <span className={done ? "text-[var(--accent)]" : "text-[var(--muted)]"}>
                  {done ? "Mastered ✓" : `${got}/${of}`}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(got / of) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

const EARNED = new Set(["basics", "preflight", "area-IV", "solo", "checkride"]);

function BadgesSlide() {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Badges</p>
        <p className="text-xs text-[var(--muted)]">
          {EARNED.size} of {BADGES.length} earned
        </p>
      </div>
      <div className="mt-5 grid grid-cols-5 gap-x-2 gap-y-3">
        {BADGES.map((b) => {
          const on = EARNED.has(b.id);
          return (
            <div key={b.id} className="flex flex-col items-center text-center">
              <BadgeIcon badge={b} earned={on} className="h-10 w-10" />
              <span className={`mt-1 text-[9px] leading-tight ${on ? "text-[var(--text)]" : "text-[var(--muted)]"}`}>{b.name}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ReportSlide() {
  const areas: [string, number][] = [
    ["Regulations", 92],
    ["Airspace", 70],
    ["Weather", 75],
    ["Loading", 100],
    ["Operations", 85],
  ];
  return (
    <>
      <Head
        icon={<IconExam className="h-4 w-4 text-[var(--accent)]" />}
        title="Mock exam · results"
        right={<span className="rounded bg-[var(--correct)]/15 px-1.5 py-0.5 text-[var(--correct)]">Pass</span>}
      />
      <div className="mt-4 flex items-end gap-3">
        <p className="text-5xl font-semibold tracking-tight">85%</p>
        <p className="pb-1.5 text-sm text-[var(--muted)]">51 of 60 · 1h 12m</p>
      </div>
      <div className="mt-5 flex items-end gap-3">
        {areas.map(([name, pct]) => (
          <div key={name} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-20 w-full items-end rounded bg-[var(--surface-2)]">
              <div className={`w-full rounded ${pct >= 70 ? "bg-[var(--accent)]" : "bg-[var(--muted)]"}`} style={{ height: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-[var(--muted)]">{name}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[11px] uppercase tracking-widest text-[var(--muted)]">ACS codes missed</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {["UA.II.A.K2", "UA.III.B.K1c", "UA.V.B.K6a ×2", "UA.I.B.K21b"].map((c) => (
          <span key={c} className="rounded border border-[var(--border)] bg-[var(--bg)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--accent)]">
            {c}
          </span>
        ))}
      </div>
    </>
  );
}
