"use client";

import React, { useMemo, useRef, useState } from "react";

/** Interactive simulators for ground-school lessons, referenced from lesson
 *  bodies with `::sim <name> | optional caption`. These are hands-on: sliders,
 *  drags and taps that move real numbers. Like quick checks, nothing here is
 *  graded or recorded — they exist to make the reading stick.
 *  Sectional-chart blue/magenta are literal on purpose, as in LessonFigures. */

const BLUE = "#5b9bd5";
const MAGENTA = "#d95fb0";
const GREEN = "#34d399";
const RED = "#f87171";
const ORANGE = "#ff6b35";
const YELLOW = "#f2d94e";
const INK = "#f5f5f5";
const MUT = "#9a9a9a";
const DIM = "#6e6e6e";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-xs text-[var(--muted)]">
        <span>{label}</span>
        <span className="font-mono text-sm text-[var(--text)]">
          {value}
          <span className="text-[var(--muted)]"> {unit}</span>
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--accent)]"
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Bank angle → load factor                                            */
/* ------------------------------------------------------------------ */

function BankLoadSim() {
  const [bank, setBank] = useState(30);
  const [weight, setWeight] = useState(33);
  const rad = (bank * Math.PI) / 180;
  const lf = 1 / Math.cos(rad);
  const load = weight * lf;
  // curve geometry (mirrors the static bank-load figure)
  const X = (b: number) => 40 + b * 6.9;
  const Y = (g: number) => 190 - (Math.min(g, 3.4) - 1) * 62;
  const pts = useMemo(() => {
    const out: string[] = [];
    for (let b = 0; b <= 74; b += 2) out.push(`${X(b)},${Y(1 / Math.cos((b * Math.PI) / 180))}`);
    return out.join(" ");
  }, []);
  const px = X(bank);
  const py = Y(lf);
  return (
    <div>
      <svg viewBox="0 0 640 250" className="w-full" role="img" aria-label="Interactive load factor curve">
        {[1, 1.5, 2, 2.5, 3].map((g) => (
          <g key={g}>
            <line x1={40} y1={Y(g)} x2={560} y2={Y(g)} stroke="#242424" strokeDasharray="4 5" />
            <text x={34} y={Y(g) + 3.5} textAnchor="end" fontSize={10} fill={MUT}>{g.toFixed(1)}</text>
          </g>
        ))}
        {[0, 15, 30, 45, 60, 75].map((b) => (
          <text key={b} x={X(b)} y={208} textAnchor="middle" fontSize={10} fill={MUT}>{b}°</text>
        ))}
        <polyline points={pts} stroke={ORANGE} strokeWidth={2.5} fill="none" />
        <line x1={px} y1={py} x2={px} y2={190} stroke={BLUE} strokeDasharray="4 4" opacity={0.6} />
        <line x1={40} y1={py} x2={px} y2={py} stroke={BLUE} strokeDasharray="4 4" opacity={0.6} />
        <circle cx={px} cy={py} r={7} fill={BLUE} stroke="#0a0a0a" strokeWidth={2} />
        {/* tilting drone */}
        <g transform={`translate(480 60) rotate(${-bank})`}>
          <circle cx={-22} cy={0} r={6} fill="none" stroke={ORANGE} strokeWidth={2} />
          <circle cx={22} cy={0} r={6} fill="none" stroke={ORANGE} strokeWidth={2} />
          <rect x={-14} y={-4} width={28} height={8} rx={3} fill={ORANGE} />
        </g>
        <line x1={480} y1={92} x2={480} y2={92 + 24 * lf} stroke={RED} strokeWidth={3} />
        <path d={`M474 ${88 + 24 * lf} L480 ${100 + 24 * lf} L486 ${88 + 24 * lf} Z`} fill={RED} />
        <text x={480} y={240} textAnchor="middle" fontSize={10} fill={MUT}>the weight arrow grows with G</text>
        <text x={300} y={240} textAnchor="middle" fontSize={10} fill={MUT}>bank angle</text>
      </svg>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Slider label="Bank angle" value={bank} min={0} max={74} unit="°" onChange={setBank} />
        <Slider label="Aircraft weight" value={weight} min={1} max={55} unit="lb" onChange={setWeight} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-3 font-mono text-sm">
        <span className="text-[var(--muted)]">load factor </span>
        <span className={bank >= 60 ? "font-bold text-[var(--wrong)]" : "font-bold text-[var(--accent)]"}>
          {lf.toFixed(2)} G
        </span>
        <span className="text-[var(--muted)]"> · structure carries </span>
        <span className="font-bold">{load.toFixed(0)} lb</span>
        {bank >= 60 && <span className="text-[var(--wrong)]"> — past 60° it climbs fast</span>}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kinetic energy → operations-over-people category                    */
/* ------------------------------------------------------------------ */

function KeCalcSim() {
  const [weight, setWeight] = useState(2.0); // lb
  const [speed, setSpeed] = useState(30); // mph
  const fps = speed * 1.46667;
  const ke = 0.5 * (weight / 32.174) * fps * fps; // ft·lb
  const cat =
    weight <= 0.55
      ? { name: "Category 1", note: "0.55 lb or less — weight, not energy, defines it", color: GREEN }
      : ke <= 11
      ? { name: "Category 2", note: "at or under 11 ft·lb — sustained flight over people allowed", color: GREEN }
      : ke <= 25
      ? { name: "Category 3", note: "at or under 25 ft·lb — no sustained flight over open-air crowds", color: YELLOW }
      : { name: "Over Category 3", note: "past 25 ft·lb — needs Category 4 (airworthiness certificate) or a waiver", color: RED };
  const barPct = Math.min(ke / 40, 1) * 100;
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Drone weight" value={weight} min={0.25} max={10} step={0.25} unit="lb" onChange={setWeight} />
        <Slider label="Impact speed" value={speed} min={5} max={80} unit="mph" onChange={setSpeed} />
      </div>
      <div className="mt-4">
        <div className="relative h-6 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${barPct}%`, background: cat.color }}
          />
          {/* threshold ticks at 11 and 25 of the 0–40 scale */}
          <div className="absolute top-0 h-full w-px bg-[var(--bg)]" style={{ left: "27.5%" }} />
          <div className="absolute top-0 h-full w-px bg-[var(--bg)]" style={{ left: "62.5%" }} />
        </div>
        <div className="relative mt-1 h-4 text-[10px] text-[var(--muted)]">
          <span className="absolute" style={{ left: "27.5%", transform: "translateX(-50%)" }}>11</span>
          <span className="absolute" style={{ left: "62.5%", transform: "translateX(-50%)" }}>25</span>
          <span className="absolute right-0">ft·lb</span>
        </div>
      </div>
      <p className="mt-2 rounded-lg bg-[var(--surface-2)] px-4 py-3 text-sm leading-6">
        <span className="font-mono font-bold" style={{ color: cat.color }}>
          {ke.toFixed(1)} ft·lb → {cat.name}
        </span>
        <span className="text-[var(--muted)]"> — {cat.note}</span>
      </p>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
        KE = ½ × mass × velocity². Notice how speed dominates: doubling weight doubles the
        energy, doubling speed quadruples it. That is why the categories are energy caps,
        not weight caps.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tap-to-explore airspace profile                                     */
/* ------------------------------------------------------------------ */

type AirspaceInfo = {
  label: string;
  color: string;
  marking: string;
  auth: string;
  trap: string;
};

const AIRSPACE: Record<string, AirspaceInfo> = {
  B: {
    label: "Class B",
    color: BLUE,
    marking: "Solid blue lines — the upside-down wedding cake around the busiest hubs",
    auth: "Authorization required before entering, every time (LAANC or DroneZone)",
    trap: "The surface ring is small; the shelves above may be over you while you sit in G",
  },
  C: {
    label: "Class C",
    color: MAGENTA,
    marking: "Solid magenta lines — two tiers around mid-size towered airports",
    auth: "Authorization required before entering",
    trap: "Same two-tier logic as B: check whether you are under a shelf or inside the core",
  },
  D: {
    label: "Class D",
    color: BLUE,
    marking: "Dashed blue lines, ceiling in a bracket like [25] = 2,500 MSL",
    auth: "Authorization required before entering",
    trap: "The [25] number is MSL, hundreds of feet — not AGL and not thousands",
  },
  Esfc: {
    label: "Class E to the surface",
    color: MAGENTA,
    marking: "Dashed magenta ring around some non-towered airports",
    auth: "Authorization required — it reaches the ground, so you are IN it on takeoff",
    trap: "The one everyone forgets: no tower does not mean no controlled airspace",
  },
  E: {
    label: "Class E aloft",
    color: BLUE,
    marking: "Magenta vignette = floor at 700 AGL; blue vignette or nothing = 1,200 AGL",
    auth: "No authorization below the floor — at 400 ft you are under it, in Class G",
    trap: "E starting at 700 AGL does not touch a 400-ft drone. Know the floor, not the fear",
  },
  G: {
    label: "Class G",
    color: GREEN,
    marking: "Not drawn — it is everything under the E floors",
    auth: "No authorization needed. This is where most Part 107 flying happens",
    trap: "Uncontrolled ≠ unregulated: every 107 rule still applies here",
  },
};

function AirspaceTapSim() {
  const [sel, setSel] = useState<string>("G");
  const info = AIRSPACE[sel];
  const hl = (k: string) => (sel === k ? 1 : 0.45);
  const sw = (k: string) => (sel === k ? 2.5 : 1.5);
  return (
    <div>
      <svg viewBox="0 0 680 300" className="w-full" role="img" aria-label="Tap an airspace class to see its rules">
        <defs>
          <linearGradient id="ats-vg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MAGENTA} stopOpacity={0.5} />
            <stop offset="1" stopColor={MAGENTA} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* E backdrop */}
        <g className="cursor-pointer" onClick={() => setSel("E")} opacity={hl("E")}>
          <rect x={8} y={10} width={664} height={252} fill="rgba(91,155,213,0.06)" stroke={sel === "E" ? BLUE : "none"} strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={650} y={32} textAnchor="end" fontSize={13} fill={BLUE} fontWeight={600}>CLASS E</text>
          <line x1={508} y1={204} x2={672} y2={204} stroke={BLUE} strokeDasharray="4 4" opacity={0.5} />
          <text x={588} y={198} textAnchor="middle" fontSize={8.5} fill={DIM}>1,200 AGL</text>
          <rect x={508} y={224} width={164} height={10} fill="url(#ats-vg)" />
          <line x1={508} y1={224} x2={672} y2={224} stroke={MAGENTA} opacity={0.7} />
          <text x={588} y={219} textAnchor="middle" fontSize={8.5} fill={MUT}>700 AGL</text>
        </g>
        {/* B */}
        <g className="cursor-pointer" onClick={() => setSel("B")} opacity={hl("B")}>
          <rect x={30} y={70} width={180} height={64} fill="rgba(91,155,213,0.12)" stroke={BLUE} strokeWidth={sw("B")} />
          <rect x={60} y={134} width={120} height={64} fill="rgba(91,155,213,0.12)" stroke={BLUE} strokeWidth={sw("B")} />
          <rect x={90} y={198} width={60} height={64} fill="rgba(91,155,213,0.12)" stroke={BLUE} strokeWidth={sw("B")} />
          <text x={120} y={98} textAnchor="middle" fontSize={13} fontWeight={700} fill={BLUE}>B</text>
        </g>
        {/* C */}
        <g className="cursor-pointer" onClick={() => setSel("C")} opacity={hl("C")}>
          <rect x={250} y={186} width={150} height={36} fill="rgba(217,95,176,0.12)" stroke={MAGENTA} strokeWidth={sw("C")} />
          <rect x={290} y={186} width={70} height={76} fill="rgba(217,95,176,0.12)" stroke={MAGENTA} strokeWidth={sw("C")} />
          <text x={325} y={212} textAnchor="middle" fontSize={13} fontWeight={700} fill={MAGENTA}>C</text>
        </g>
        {/* D */}
        <g className="cursor-pointer" onClick={() => setSel("D")} opacity={hl("D")}>
          <rect x={430} y={214} width={64} height={48} fill="rgba(91,155,213,0.10)" stroke={BLUE} strokeWidth={sw("D")} strokeDasharray="5 4" />
          <text x={462} y={236} textAnchor="middle" fontSize={12} fontWeight={700} fill={BLUE}>D</text>
        </g>
        {/* E sfc */}
        <g className="cursor-pointer" onClick={() => setSel("Esfc")} opacity={hl("Esfc")}>
          <rect x={196} y={222} width={44} height={40} fill="rgba(217,95,176,0.08)" stroke={MAGENTA} strokeWidth={sw("Esfc")} strokeDasharray="5 4" />
          <text x={218} y={244} textAnchor="middle" fontSize={9} fontWeight={700} fill={MAGENTA}>E sfc</text>
        </g>
        {/* G strip */}
        <g className="cursor-pointer" onClick={() => setSel("G")} opacity={hl("G")}>
          <rect x={508} y={234} width={164} height={28} fill="rgba(52,211,153,0.10)" stroke={sel === "G" ? GREEN : "none"} strokeWidth={1.5} />
          <text x={590} y={252} textAnchor="middle" fontSize={11} fontWeight={700} fill={GREEN}>G</text>
        </g>
        {/* 400 ft + ground */}
        <line x1={8} y1={246} x2={672} y2={246} stroke={ORANGE} strokeDasharray="3 5" opacity={0.7} />
        <text x={12} y={241} fontSize={9} fill={ORANGE}>400 AGL</text>
        <rect x={8} y={262} width={664} height={28} fill="#141414" />
        <line x1={8} y1={262} x2={672} y2={262} stroke="#3a3a3a" />
        <text x={340} y={281} textAnchor="middle" fontSize={9} fill={DIM} letterSpacing={3}>TAP ANY AIRSPACE</text>
      </svg>
      <div className="mt-3 rounded-lg border px-4 py-3 text-sm leading-6" style={{ borderColor: info.color }}>
        <p className="font-semibold" style={{ color: info.color }}>{info.label}</p>
        <p className="mt-1 text-[var(--muted)]"><span className="text-[var(--text)]">On the chart:</span> {info.marking}</p>
        <p className="text-[var(--muted)]"><span className="text-[var(--text)]">To fly there:</span> {info.auth}</p>
        <p className="text-[var(--muted)]"><span className="text-[var(--text)]">Exam trap:</span> {info.trap}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chart-line flash drill                                              */
/* ------------------------------------------------------------------ */

type LineQ = { key: string; answer: string; draw: React.ReactNode };

const LINE_QS: LineQ[] = [
  { key: "b", answer: "Class B", draw: <line x1={40} y1={40} x2={300} y2={40} stroke={BLUE} strokeWidth={5} /> },
  { key: "c", answer: "Class C", draw: <line x1={40} y1={40} x2={300} y2={40} stroke={MAGENTA} strokeWidth={5} /> },
  { key: "d", answer: "Class D", draw: <line x1={40} y1={40} x2={300} y2={40} stroke={BLUE} strokeWidth={4} strokeDasharray="12 8" /> },
  { key: "esfc", answer: "Class E to the surface", draw: <line x1={40} y1={40} x2={300} y2={40} stroke={MAGENTA} strokeWidth={4} strokeDasharray="12 8" /> },
  {
    key: "e700",
    answer: "Class E floor at 700 AGL",
    draw: (
      <g>
        <line x1={40} y1={34} x2={300} y2={34} stroke={MAGENTA} strokeWidth={2.5} opacity={0.85} />
        <rect x={40} y={34} width={260} height={16} fill="url(#cld-vm)" />
      </g>
    ),
  },
  {
    key: "e1200",
    answer: "Class E floor at 1,200 AGL",
    draw: (
      <g>
        <line x1={40} y1={34} x2={300} y2={34} stroke={BLUE} strokeWidth={2.5} opacity={0.85} />
        <rect x={40} y={34} width={260} height={16} fill="url(#cld-vb)" />
      </g>
    ),
  },
];

const ALL_ANSWERS = LINE_QS.map((q) => q.answer);

function ChartLineDrillSim() {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const q = LINE_QS[qi];

  const [round, setRound] = useState(0);
  const opts = useMemo(() => {
    // deterministic on first render (hydration-safe); reshuffles on each Next
    const others = ALL_ANSWERS.filter((a) => a !== q.answer);
    const wrong = [others[(qi + round) % others.length], others[(qi + round + 2) % others.length]];
    const all = [q.answer, ...wrong];
    const rot = (qi + round) % 3;
    return [...all.slice(rot), ...all.slice(0, rot)];
  }, [q.answer, qi, round]);

  function pick(a: string) {
    if (picked) return;
    setPicked(a);
    if (a === q.answer) {
      const s = streak + 1;
      setStreak(s);
      setBest(Math.max(best, s));
    } else setStreak(0);
  }
  function next() {
    let n = Math.floor(Math.random() * LINE_QS.length);
    if (n === qi) n = (n + 1) % LINE_QS.length;
    setQi(n);
    setRound((r) => r + 1);
    setPicked(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">What airspace does this boundary mark?</p>
        <p className="font-mono text-xs text-[var(--muted)]">
          streak <span className="text-[var(--accent)]">{streak}</span> · best {best}
        </p>
      </div>
      <svg viewBox="0 0 340 70" className="mt-2 w-full max-w-sm" role="img" aria-label="A sectional chart line style">
        <defs>
          <linearGradient id="cld-vm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MAGENTA} stopOpacity={0.5} />
            <stop offset="1" stopColor={MAGENTA} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cld-vb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BLUE} stopOpacity={0.5} />
            <stop offset="1" stopColor={BLUE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={340} height={70} rx={8} fill="#101408" opacity={0.6} />
        {q.draw}
      </svg>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {opts.map((a) => {
          let cls = "border-[var(--border)] hover:bg-[var(--surface-2)] cursor-pointer";
          if (picked) {
            if (a === q.answer) cls = "border-[var(--correct)] bg-[var(--correct)]/10";
            else if (a === picked) cls = "border-[var(--wrong)] bg-[var(--wrong)]/10";
            else cls = "border-[var(--border)] opacity-50";
          }
          return (
            <button key={a} disabled={!!picked} onClick={() => pick(a)} className={`rounded-lg border px-3 py-2 text-sm leading-5 transition-colors ${cls}`}>
              {a}
            </button>
          );
        })}
      </div>
      {picked && (
        <button onClick={next} className="mt-3 cursor-pointer rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black">
          Next line →
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Drag-the-drone cloud clearance                                      */
/* ------------------------------------------------------------------ */

function CloudClearanceSim() {
  // world: 640 x 300. Cloud occupies x 240–420, base at y=90.
  // vertical scale: 1 px = 5 ft. horizontal: 1 px = 12.5 ft.
  const [pos, setPos] = useState({ x: 140, y: 210 });
  const ref = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const CLOUD = { x1: 240, x2: 420, base: 90 };
  const FT_V = 5;
  const FT_H = 12.5;
  const belowFt = pos.y > CLOUD.base ? (pos.y - CLOUD.base) * FT_V : 0;
  const horizFt =
    pos.x < CLOUD.x1 ? (CLOUD.x1 - pos.x) * FT_H : pos.x > CLOUD.x2 ? (pos.x - CLOUD.x2) * FT_H : 0;
  const inCloud = pos.x >= CLOUD.x1 && pos.x <= CLOUD.x2 && pos.y <= CLOUD.base;
  // legal iff 2,000+ ft horizontal from the cloud, or under it with 500+ ft below the base
  const under = pos.x >= CLOUD.x1 && pos.x <= CLOUD.x2;
  const ok = !inCloud && (under ? belowFt >= 500 : horizFt >= 2000 || (belowFt >= 500 && pos.y > CLOUD.base));

  function move(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging.current || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 640;
    const y = ((e.clientY - r.top) / r.height) * 300;
    setPos({ x: Math.max(12, Math.min(628, x)), y: Math.max(16, Math.min(252, y)) });
  }

  const verdict = inCloud
    ? { text: "Inside the cloud. Never legal under Part 107.", color: RED }
    : ok
    ? { text: "Legal — clearances satisfied.", color: GREEN }
    : { text: "Too close: need 500 ft below or 2,000 ft horizontally.", color: RED };

  return (
    <div>
      <svg
        ref={ref}
        viewBox="0 0 640 300"
        className="w-full touch-none select-none"
        role="img"
        aria-label="Drag the drone to test cloud clearance"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          move(e);
        }}
        onPointerMove={move}
        onPointerUp={() => (dragging.current = false)}
      >
        {/* illegal buffer zone */}
        <rect x={CLOUD.x1 - 2000 / FT_H} y={0} width={CLOUD.x2 - CLOUD.x1 + 2 * (2000 / FT_H)} height={CLOUD.base + 500 / FT_V} fill={RED} opacity={0.06} />
        <rect x={CLOUD.x1} y={CLOUD.base} width={CLOUD.x2 - CLOUD.x1} height={500 / FT_V} fill={RED} opacity={0.08} />
        {/* cloud */}
        <g>
          <ellipse cx={330} cy={70} rx={95} ry={26} fill="#262626" stroke="#4a4a4a" />
          <circle cx={280} cy={62} r={28} fill="#262626" stroke="#4a4a4a" />
          <circle cx={340} cy={48} r={32} fill="#262626" stroke="#4a4a4a" />
          <circle cx={390} cy={64} r={24} fill="#262626" stroke="#4a4a4a" />
          <line x1={CLOUD.x1} y1={CLOUD.base} x2={CLOUD.x2} y2={CLOUD.base} stroke="#4a4a4a" strokeDasharray="4 4" />
        </g>
        {/* clearance guides */}
        <line x1={CLOUD.x1} y1={CLOUD.base + 500 / FT_V} x2={CLOUD.x2} y2={CLOUD.base + 500 / FT_V} stroke={GREEN} strokeDasharray="5 5" opacity={0.6} />
        <text x={330} y={CLOUD.base + 500 / FT_V + 14} textAnchor="middle" fontSize={9} fill={GREEN}>500 ft below the base</text>
        <line x1={CLOUD.x1 - 2000 / FT_H} y1={20} x2={CLOUD.x1 - 2000 / FT_H} y2={252} stroke={GREEN} strokeDasharray="5 5" opacity={0.6} />
        <line x1={CLOUD.x2 + 2000 / FT_H} y1={20} x2={CLOUD.x2 + 2000 / FT_H} y2={252} stroke={GREEN} strokeDasharray="5 5" opacity={0.6} />
        <text x={CLOUD.x1 - 2000 / FT_H} y={268} textAnchor="middle" fontSize={9} fill={GREEN}>2,000 ft</text>
        <text x={CLOUD.x2 + 2000 / FT_H} y={268} textAnchor="middle" fontSize={9} fill={GREEN}>2,000 ft</text>
        {/* live distance lines */}
        {under && pos.y > CLOUD.base && (
          <g>
            <line x1={pos.x} y1={CLOUD.base} x2={pos.x} y2={pos.y - 8} stroke={belowFt >= 500 ? GREEN : RED} strokeWidth={1.5} />
            <text x={pos.x + 8} y={(CLOUD.base + pos.y) / 2} fontSize={10} fontFamily={MONO} fill={belowFt >= 500 ? GREEN : RED}>
              {Math.round(belowFt)} ft
            </text>
          </g>
        )}
        {!under && (
          <g>
            <line
              x1={pos.x < CLOUD.x1 ? CLOUD.x1 : CLOUD.x2}
              y1={pos.y}
              x2={pos.x + (pos.x < CLOUD.x1 ? 12 : -12)}
              y2={pos.y}
              stroke={horizFt >= 2000 ? GREEN : RED}
              strokeWidth={1.5}
            />
            <text
              x={(pos.x + (pos.x < CLOUD.x1 ? CLOUD.x1 : CLOUD.x2)) / 2}
              y={pos.y - 8}
              textAnchor="middle"
              fontSize={10}
              fontFamily={MONO}
              fill={horizFt >= 2000 ? GREEN : RED}
            >
              {Math.round(horizFt)} ft
            </text>
          </g>
        )}
        {/* drone */}
        <g transform={`translate(${pos.x} ${pos.y})`} className="cursor-grab">
          <circle r={16} fill={ORANGE} opacity={0.12} />
          <circle cx={-9} cy={0} r={4.5} fill="none" stroke={ORANGE} strokeWidth={2} />
          <circle cx={9} cy={0} r={4.5} fill="none" stroke={ORANGE} strokeWidth={2} />
          <rect x={-6} y={-3} width={12} height={6} rx={2} fill={ORANGE} />
        </g>
        {/* ground */}
        <rect x={0} y={276} width={640} height={24} fill="#141414" />
        <line x1={0} y1={276} x2={640} y2={276} stroke="#3a3a3a" />
        <text x={320} y={292} textAnchor="middle" fontSize={9} fill={DIM} letterSpacing={2}>DRAG THE DRONE</text>
      </svg>
      <p className="mt-3 rounded-lg px-4 py-3 text-sm font-semibold" style={{ background: "var(--surface-2)", color: verdict.color }}>
        {verdict.text}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* METAR decoder with a go / no-go verdict                             */
/* ------------------------------------------------------------------ */

type MetarToken = { text: string; label: string; color: string };
type Metar = { tokens: MetarToken[]; vis: number; legal: boolean; why: string };

const METARS: Metar[] = [
  {
    vis: 10,
    legal: true,
    why: "10 SM visibility beats the 3 SM minimum and the few clouds at 4,500 ft are far above a 400-ft flight. Go fly.",
    tokens: [
      { text: "KDFW", label: "station — Dallas/Fort Worth", color: BLUE },
      { text: "051753Z", label: "5th of the month, 17:53 Zulu", color: YELLOW },
      { text: "14008KT", label: "wind from 140° true at 8 kt", color: ORANGE },
      { text: "10SM", label: "visibility 10 statute miles", color: GREEN },
      { text: "FEW045", label: "few clouds at 4,500 ft AGL", color: MAGENTA },
      { text: "29/14", label: "29°C, dew point 14°C — far apart, dry air", color: "#6fd5cf" },
      { text: "A3001", label: "altimeter 30.01 inHg", color: "#c9c9c9" },
    ],
  },
  {
    vis: 2.5,
    legal: false,
    why: "2½ SM visibility is under the 3 SM minimum in §107.51. No-go without a waiver, no matter how the sky looks.",
    tokens: [
      { text: "KAUS", label: "station — Austin", color: BLUE },
      { text: "051253Z", label: "5th of the month, 12:53 Zulu", color: YELLOW },
      { text: "00000KT", label: "wind calm", color: ORANGE },
      { text: "2 1/2SM", label: "visibility 2½ statute miles — below minimums", color: RED },
      { text: "BR", label: "mist (BR = 'baby rain', vis 5/8 to 6 SM)", color: RED },
      { text: "OVC008", label: "overcast at 800 ft AGL", color: MAGENTA },
      { text: "19/18", label: "19°C, dew point 18°C — 1° apart, fog factory", color: "#6fd5cf" },
    ],
  },
  {
    vis: 6,
    legal: false,
    why: "Visibility passes, but a 400-ft broken ceiling means you cannot stay 500 ft below the clouds and fly at any useful height. The ceiling, not the visibility, kills this one.",
    tokens: [
      { text: "KHOU", label: "station — Houston Hobby", color: BLUE },
      { text: "051453Z", label: "5th of the month, 14:53 Zulu", color: YELLOW },
      { text: "09012G18KT", label: "wind from 090° at 12, gusting 18 kt", color: ORANGE },
      { text: "6SM", label: "visibility 6 statute miles — legal", color: GREEN },
      { text: "BKN004", label: "broken ceiling at 400 ft AGL — the problem", color: RED },
      { text: "22/20", label: "22°C, dew point 20°C", color: "#6fd5cf" },
      { text: "A2988", label: "altimeter 29.88 inHg", color: "#c9c9c9" },
    ],
  },
];

function MetarDecoderSim() {
  const [mi, setMi] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const [verdict, setVerdict] = useState<null | boolean>(null);
  const m = METARS[mi];

  function tap(i: number) {
    setSeen((s) => new Set(s).add(i));
  }
  function nextMetar() {
    setMi((mi + 1) % METARS.length);
    setSeen(new Set());
    setVerdict(null);
  }

  return (
    <div>
      <p className="text-sm text-[var(--muted)]">
        Tap each token to decode it, then call it: legal to launch under §107.51?
      </p>
      <div className="mt-3 flex flex-wrap gap-2 rounded-lg bg-[var(--surface-2)] p-3 font-mono text-sm">
        {m.tokens.map((t, i) => (
          <button
            key={i}
            onClick={() => tap(i)}
            className={`cursor-pointer rounded px-1.5 py-0.5 transition-colors ${
              seen.has(i) ? "" : "hover:bg-[var(--border)]"
            }`}
            style={{ color: t.color, textDecoration: seen.has(i) ? "none" : "underline dotted", textUnderlineOffset: 4 }}
          >
            {t.text}
          </button>
        ))}
      </div>
      <div className="mt-2 min-h-16 space-y-1">
        {m.tokens.map((t, i) =>
          seen.has(i) ? (
            <p key={i} className="text-xs leading-5 text-[var(--muted)]">
              <span className="font-mono" style={{ color: t.color }}>{t.text}</span> — {t.label}
            </p>
          ) : null
        )}
      </div>
      {verdict === null ? (
        <div className="mt-2 flex gap-2">
          <button onClick={() => setVerdict(true)} className="cursor-pointer rounded-lg border border-[var(--correct)] px-4 py-2 text-sm font-semibold text-[var(--correct)] hover:bg-[var(--correct)]/10">
            Legal — launch
          </button>
          <button onClick={() => setVerdict(false)} className="cursor-pointer rounded-lg border border-[var(--wrong)] px-4 py-2 text-sm font-semibold text-[var(--wrong)] hover:bg-[var(--wrong)]/10">
            No-go
          </button>
        </div>
      ) : (
        <div className="mt-2">
          <p className="rounded-lg bg-[var(--surface-2)] px-4 py-3 text-sm leading-6">
            <span className={`font-semibold ${verdict === m.legal ? "text-[var(--correct)]" : "text-[var(--wrong)]"}`}>
              {verdict === m.legal ? "Right call. " : "Wrong call. "}
            </span>
            <span className="text-[var(--muted)]">{m.why}</span>
          </p>
          <button onClick={nextMetar} className="mt-3 cursor-pointer rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black">
            Next METAR →
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const REGISTRY: Record<string, React.ReactNode> = {
  "bank-load-sim": <BankLoadSim />,
  "ke-calc": <KeCalcSim />,
  "airspace-tap": <AirspaceTapSim />,
  "chart-line-drill": <ChartLineDrillSim />,
  "cloud-clearance": <CloudClearanceSim />,
  "metar-decoder": <MetarDecoderSim />,
};

export default function LessonSim({ name, caption }: { name: string; caption?: string }) {
  const sim = REGISTRY[name];
  if (!sim) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
        ✋ Try it
      </p>
      {sim}
      {caption && <p className="mt-3 text-center text-xs leading-5 text-[var(--muted)]">{caption}</p>}
    </div>
  );
}
