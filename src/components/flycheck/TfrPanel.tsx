"use client";

import { useState } from "react";
import type { TfrDetail } from "@/lib/flycheck/types";

/** The real NOTAM behind a TFR finding, in the reader's own time zone. */

const day = (d: Date) => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400_000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
};
const time = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const zone = (d: Date) =>
  new Intl.DateTimeFormat([], { timeZoneName: "short" }).formatToParts(d).find((p) => p.type === "timeZoneName")?.value ?? "";

function span(from: string | null, to: string | null) {
  if (!from) return "Times not published";
  const a = new Date(from);
  const b = to ? new Date(to) : null;
  if (!b) return `${day(a)} from ${time(a)} ${zone(a)}`;
  return a.toDateString() === b.toDateString()
    ? `${day(a)}, ${time(a)} to ${time(b)} ${zone(b)}`
    : `${day(a)} ${time(a)} to ${day(b)} ${time(b)} ${zone(b)}`;
}

function countdown(ms: number) {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h} hr ${m % 60} min` : `${Math.round(h / 24)} days`;
}

export function TfrPanel({ d, href }: { d: TfrDetail; href?: string }) {
  const [now] = useState(() => Date.now());
  const active = d.status === "active";
  const pill = active
    ? { text: d.to ? `Active now · ends in ${countdown(Date.parse(d.to) - now)}` : "Active now", color: "#f87171" }
    : d.status === "upcoming" && d.from
      ? { text: `Starts in ${countdown(Date.parse(d.from) - now)}`, color: "#fbbf24" }
      : { text: "Check times", color: "#9a9a9a" };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07] bg-black/30">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3.5 py-2.5">
        <span
          className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ color: pill.color, background: `${pill.color}1a`, boxShadow: `inset 0 0 0 1px ${pill.color}40` }}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${active ? "fc-dot" : ""}`} style={{ background: pill.color }} />
          {pill.text}
        </span>
        <span className="text-sm font-medium tabular-nums">{span(d.from, d.to)}</span>
      </div>

      {d.dronesBanned && (
        <p className="border-b border-white/[0.06] bg-[#f87171]/[0.06] px-3.5 py-2.5 text-sm font-medium text-[#fca5a5]">
          This NOTAM bars drones while it is active. Read the full restrictions for any exceptions.
        </p>
      )}

      {d.areas.length > 0 && (
        <ul className="divide-y divide-white/[0.05] text-sm">
          {d.areas.map((a, i) => {
            const ended = !!a.to && Date.parse(a.to) < now;
            const live = !ended && !!a.from && Date.parse(a.from) <= now;
            return (
              <li
                key={i}
                className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-3.5 py-2 ${ended ? "opacity-40" : ""}`}
              >
                <span>
                  <span className="font-medium">{a.name}</span>
                  <span className="text-[var(--muted)]">
                    {a.radiusNm ? ` · ${a.radiusNm} NM radius` : ""} · {a.floor} to {a.ceiling}
                  </span>
                </span>
                <span className="text-xs tabular-nums text-[var(--muted)]">
                  {live && <span className="mr-2 font-semibold text-[#f87171]">active</span>}
                  {ended && <span className="mr-2">ended</span>}
                  {a.from ? `${time(new Date(a.from))} to ${a.to ? time(new Date(a.to)) : "?"}` : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {(d.rules.length > 0 || href) && (
        <details className="group border-t border-white/[0.06]">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-2.5 text-xs text-[var(--muted)] hover:text-[var(--text)]">
            <span>
              <span className="mr-1.5 inline-block transition-transform group-open:rotate-90">›</span>
              Full restrictions from the NOTAM
            </span>
            {href && (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline" onClick={(e) => e.stopPropagation()}>
                faa.gov ↗
              </a>
            )}
          </summary>
          <ol className="space-y-2 px-3.5 pb-3.5 text-[13px] leading-6 text-[var(--muted)]">
            {d.rules.map((r, i) => (
              <li key={i} className={/UAS|drone|model aircraft/i.test(r) ? "text-[var(--text)]" : ""}>
                {r}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
