"use client";

import type { HourlyPoint, Level } from "@/lib/flycheck/types";

export const LEVEL_COLOR: Record<Level, string> = {
  go: "#34d399",
  caution: "#fbbf24",
  stop: "#f87171",
  info: "#60a5fa",
};

/* ── Verdict ring ─────────────────────────────────────────────────────────── */

export function VerdictRing({ level, word, label }: { level: Level; word: string; label: string }) {
  const c = LEVEL_COLOR[level];
  const pct = level === "go" ? 100 : level === "caution" ? 62 : level === "stop" ? 28 : 50;
  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center sm:h-40 sm:w-40">
      <div
        className="fc-ring absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${c} ${pct * 3.6}deg, rgba(255,255,255,0.06) 0)`,
          boxShadow: `0 0 60px -10px ${c}`,
        }}
      />
      <div className="absolute inset-[7px] rounded-full bg-[#0d0d0d]" />
      <div className="relative text-center">
        <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--muted)] sm:text-[10px]">{label}</div>
        <div className="mt-1 text-xl font-bold tracking-tight sm:text-3xl" style={{ color: c }}>
          {word}
        </div>
      </div>
    </div>
  );
}

/* ── Wind dial ────────────────────────────────────────────────────────────── */

export function WindDial({
  dir,
  variable,
  speed,
  gust,
  limit,
  unit,
}: {
  dir: number | null;
  variable: boolean;
  speed: number;
  gust: number | null;
  limit: number;
  unit: string;
}) {
  const r = 70;
  const frac = Math.min(1, (gust ?? speed) / limit);
  const sustainedFrac = Math.min(1, speed / limit);
  const arc = (f: number) => {
    const a = -225 + f * 270;
    const rad = (a * Math.PI) / 180;
    return { x: 90 + r * Math.cos(rad), y: 90 + r * Math.sin(rad), large: f * 270 > 180 ? 1 : 0 };
  };
  const start = arc(0);
  const color = (gust ?? speed) >= limit ? LEVEL_COLOR.stop : speed >= limit * 0.75 || (gust ?? 0) >= limit * 0.85 ? LEVEL_COLOR.caution : LEVEL_COLOR.go;
  const g = arc(frac);
  const s = arc(sustainedFrac);
  return (
    <svg viewBox="0 0 180 180" className="h-44 w-44" role="img" aria-label={`Wind ${speed} ${unit}`}>
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${arc(1).x} ${arc(1).y}`}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      {gust !== null && (
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${g.large} 1 ${g.x} ${g.y}`}
          stroke={color}
          strokeOpacity="0.35"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {speed > 0 && (
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${s.large} 1 ${s.x} ${s.y}`}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          className="fc-draw"
        />
      )}
      {["N", "E", "S", "W"].map((l, i) => {
        const a = ((i * 90 - 90) * Math.PI) / 180;
        return (
          <text key={l} x={90 + 56 * Math.cos(a)} y={93 + 56 * Math.sin(a)} textAnchor="middle" fontSize="9" fill="#666">
            {l}
          </text>
        );
      })}
      {dir !== null && speed > 0 && (
        <g transform={`rotate(${dir} 90 90)`} className="fc-spin-in">
          {/* Arrow flies in from the direction the wind comes from. */}
          <line x1="90" y1="30" x2="90" y2="50" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <path d="M 85 46 L 90 56 L 95 46 Z" fill={color} />
        </g>
      )}
      <text x="90" y="92" textAnchor="middle" fontSize="28" fontWeight="700" fill="#f5f5f5">
        {speed === 0 ? "Calm" : speed}
      </text>
      <text x="90" y="110" textAnchor="middle" fontSize="10" fill="#9a9a9a">
        {speed === 0 ? "" : unit}
        {gust ? ` · gusts ${gust}` : ""}
        {variable ? " · variable" : ""}
      </text>
      <text x="90" y="160" textAnchor="middle" fontSize="9" fill="#666">
        your limit {limit} {unit}
      </text>
    </svg>
  );
}

/* ── Sun arc ──────────────────────────────────────────────────────────────── */

export function SunArc({
  dawn,
  sunrise,
  sunset,
  dusk,
  now,
}: {
  dawn: Date;
  sunrise: Date;
  sunset: Date;
  dusk: Date;
  now: Date;
}) {
  const t0 = dawn.getTime();
  const t1 = dusk.getTime();
  const pos = (d: Date) => Math.min(1, Math.max(0, (d.getTime() - t0) / (t1 - t0)));
  const pt = (f: number) => {
    const a = Math.PI * (1 - f);
    return { x: 150 + 120 * Math.cos(a), y: 130 - 100 * Math.sin(a) };
  };
  const path = (a: number, b: number) => {
    const p = pt(a);
    const q = pt(b);
    return `M ${p.x} ${p.y} A 120 100 0 0 1 ${q.x} ${q.y}`;
  };
  const up = pos(sunrise);
  const down = pos(sunset);
  const n = pos(now);
  const sun = pt(n);
  const outside = now < dawn || now > dusk;
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <svg viewBox="0 0 300 160" className="w-full max-w-sm" role="img" aria-label="Daylight today">
      <defs>
        <linearGradient id="fcDay" x1="0" x2="1">
          <stop offset="0" stopColor="#ff6b35" />
          <stop offset="0.5" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#ff6b35" />
        </linearGradient>
      </defs>
      <line x1="20" y1="130" x2="280" y2="130" stroke="#2a2a2a" />
      <path d={path(0, up)} stroke="#a855f7" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d={path(up, down)} stroke="url(#fcDay)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d={path(down, 1)} stroke="#a855f7" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
      {!outside && (
        <>
          <circle cx={sun.x} cy={sun.y} r="14" fill="#fbbf24" opacity="0.18" className="fc-pulse-soft" />
          <circle cx={sun.x} cy={sun.y} r="7" fill="#fbbf24" />
        </>
      )}
      <text x="22" y="148" fontSize="9" fill="#a855f7">dawn {fmt(dawn)}</text>
      <text x="278" y="148" fontSize="9" fill="#a855f7" textAnchor="end">dusk {fmt(dusk)}</text>
      <text x={pt(up).x} y={pt(up).y - 10} fontSize="9" fill="#9a9a9a" textAnchor="middle">↑ {fmt(sunrise)}</text>
      <text x={pt(down).x} y={pt(down).y - 10} fontSize="9" fill="#9a9a9a" textAnchor="middle">↓ {fmt(sunset)}</text>
      {outside && (
        <text x="150" y="105" fontSize="13" fill="#9a9a9a" textAnchor="middle">
          Night now
        </text>
      )}
    </svg>
  );
}

/* ── Kp gauge ─────────────────────────────────────────────────────────────── */

export function KpGauge({ kp }: { kp: number }) {
  return (
    <div className="flex items-end gap-1" role="img" aria-label={`Kp ${kp}`}>
      {Array.from({ length: 9 }, (_, i) => {
        const on = i < Math.round(kp);
        const c = i >= 6 ? "#f87171" : i >= 4 ? "#fbbf24" : "#34d399";
        return (
          <div
            key={i}
            className="w-3 rounded-sm transition-all"
            style={{ height: 10 + i * 4, background: on ? c : "rgba(255,255,255,0.07)" }}
          />
        );
      })}
    </div>
  );
}

/* ── 12 hour wind strip ───────────────────────────────────────────────────── */

export function ForecastStrip({ hours, limit }: { hours: HourlyPoint[]; limit: number }) {
  const max = Math.max(limit * 1.3, ...hours.map((h) => h.windMph));
  const H = 110;
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[#f87171]/60" style={{ top: H - (limit / max) * H }}>
        <span className="absolute -top-4 right-0 text-[10px] text-[#f87171]/80">limit {limit} mph</span>
      </div>
      <div className="grid grid-cols-12 gap-1.5">
        {hours.map((h, i) => {
          const c = h.windMph >= limit ? LEVEL_COLOR.stop : h.windMph >= limit * 0.75 ? LEVEL_COLOR.caution : LEVEL_COLOR.go;
          const time = new Date(h.time);
          return (
            <div key={h.time} className="flex flex-col items-center" title={`${h.short}, wind ${h.windDir} ${h.windMph} mph`}>
              <div className="flex w-full items-end" style={{ height: H }}>
                <div
                  className="fc-grow w-full rounded-t-md"
                  style={{
                    height: Math.max(4, (h.windMph / max) * H),
                    background: `linear-gradient(to top, ${c}33, ${c})`,
                    animationDelay: `${i * 40}ms`,
                  }}
                />
              </div>
              <div className="mt-1 text-[11px] font-semibold tabular-nums">{h.windMph}</div>
              <div className="text-[10px] text-[var(--muted)]">{h.windDir}</div>
              <div className="mt-1 text-[10px] tabular-nums text-[var(--muted)]">
                {time.toLocaleTimeString([], { hour: "numeric" }).replace(" ", "").toLowerCase()}
              </div>
              <div className="text-[10px] tabular-nums text-sky-400/80">
                {h.precipPct ? `${h.precipPct}%` : ""}
              </div>
              <div className="text-[10px]">{h.isDaytime ? "☀" : "☾"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
