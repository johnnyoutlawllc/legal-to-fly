"use client";

import { useEffect, useMemo, useState } from "react";
import { annotate, type Token } from "@/lib/flycheck/decode";

/** The raw report, color coded by section, with the plain-English meaning of
 *  every group underneath in the same color. Hover either side and its twin
 *  lights up. A TAF is split into one band per change group (FM, TEMPO,
 *  BECMG, PROB) so the forecast reads as a timeline. */

export const KIND: Record<Token["kind"], { label: string; color: string }> = {
  id: { label: "Report", color: "#94a3b8" },
  time: { label: "Time", color: "#cbd5e1" },
  wind: { label: "Wind", color: "#38bdf8" },
  vis: { label: "Visibility", color: "#34d399" },
  wx: { label: "Weather", color: "#fbbf24" },
  cloud: { label: "Clouds", color: "#e879f9" },
  temp: { label: "Temp / dew", color: "#fb923c" },
  alt: { label: "Pressure", color: "#a78bfa" },
  change: { label: "Change", color: "#ff6b35" },
  rmk: { label: "Remarks", color: "#64748b" },
  other: { label: "Other", color: "#d4d4d4" },
};

type Indexed = Token & { i: number };

function segments(tokens: Indexed[], taf: boolean): Indexed[][] {
  if (!taf) return [tokens];
  const out: Indexed[][] = [[]];
  tokens.forEach((t, k) => {
    const starts = /^(FM\d{6}|TEMPO|BECMG|PROB\d{2})$/.test(t.t);
    // "PROB30 TEMPO" is one change group, not two.
    const continues = t.t === "TEMPO" && /^PROB\d{2}$/.test(tokens[k - 1]?.t ?? "");
    if (starts && !continues && out[out.length - 1].length) out.push([]);
    out[out.length - 1].push(t);
  });
  return out;
}

export function Decoder({ raw, title }: { raw: string; title: string }) {
  const [local, setLocal] = useState(false);
  useEffect(() => setLocal(true), []);
  const tokens = useMemo(() => annotate(raw, local).map((t, i) => ({ ...t, i })), [raw, local]);
  const taf = raw.trim().startsWith("TAF");
  const segs = useMemo(() => segments(tokens, taf), [tokens, taf]);
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState(true);
  const kinds = [...new Set(tokens.filter((t) => t.m).map((t) => t.kind))];

  const on = (i: number) => () => setHover(i);
  const off = () => setHover(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-black/50 to-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">{title}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {open &&
            kinds.map((k) => (
            <span key={k} className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span className="h-2 w-2 rounded-full" style={{ background: KIND[k].color, boxShadow: `0 0 8px ${KIND[k].color}` }} />
              {KIND[k].label}
            </span>
          ))}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="rounded-md border border-white/10 px-2.5 py-1 text-[11px] font-medium text-[var(--muted)] transition-colors hover:border-white/25 hover:text-white"
          >
            {open ? "Hide Code Details" : "Show Code Details"}
          </button>
        </div>
      </div>

      {open && segs.map((seg, si) => (
        <div key={si} className={`px-4 py-4 ${si ? "border-t border-dashed border-white/[0.06]" : ""}`}>
          {/* Raw, color coded */}
          <p className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-[15px] leading-7 sm:text-base">
            {seg.map((t) => {
              const c = KIND[t.kind].color;
              const lit = hover === t.i;
              return (
                <span
                  key={t.i}
                  onMouseEnter={on(t.i)}
                  onMouseLeave={off}
                  className="cursor-help rounded-md px-1 font-semibold transition-all duration-150"
                  style={{
                    color: c,
                    opacity: t.kind === "rmk" && !t.m ? 0.55 : hover === null || lit ? 1 : 0.35,
                    background: lit ? `${c}22` : undefined,
                    boxShadow: lit ? `0 0 0 1px ${c}66, 0 0 18px ${c}55` : undefined,
                    textShadow: lit ? `0 0 12px ${c}` : undefined,
                  }}
                >
                  {t.t}
                </span>
              );
            })}
          </p>

          {/* Meaning, same colors */}
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {seg
              .filter((t) => t.m)
              .map((t) => {
                const c = KIND[t.kind].color;
                const lit = hover === t.i;
                return (
                  <li
                    key={t.i}
                    onMouseEnter={on(t.i)}
                    onMouseLeave={off}
                    className="flex items-start gap-2.5 rounded-lg border-l-2 py-1.5 pl-2.5 pr-2 transition-all duration-150"
                    style={{
                      borderColor: c,
                      background: lit ? `${c}1f` : `${c}0a`,
                      opacity: hover === null || lit ? 1 : 0.45,
                    }}
                  >
                    <code className="shrink-0 pt-px font-mono text-xs font-semibold" style={{ color: c }}>
                      {t.t}
                    </code>
                    <span className="text-sm leading-5 transition-colors" style={{ color: lit ? "#fff" : c }}>
                      {t.m}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </div>
  );
}
