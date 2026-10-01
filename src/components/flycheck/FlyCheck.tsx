"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import * as SunCalc from "suncalc";
import type { FlyReport, Finding, GeoResult, Level, Metar } from "@/lib/flycheck/types";
import { CATEGORY, ktToMph, wxPlain } from "@/lib/flycheck/decode";
import { compass } from "@/lib/flycheck/geo";
import { ForecastStrip, KpGauge, LEVEL_COLOR, SunArc, VerdictRing, WindDial } from "./Widgets";
import { OVERLAYS, STYLES, type MapStyle, type OverlayKey } from "./FlyMap";
import { Decoder } from "./Decoder";
import { TfrPanel } from "./TfrPanel";

const FlyMap = dynamic(() => import("./FlyMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[var(--surface-2)]" />,
});

/* ── Preferences ──────────────────────────────────────────────────────────── */

type SectionId = "map" | "airspace" | "weather" | "forecast" | "daylight" | "airports" | "space" | "rules";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "map", label: "Map" },
  { id: "airspace", label: "Airspace" },
  { id: "weather", label: "Weather now" },
  { id: "forecast", label: "Forecast" },
  { id: "daylight", label: "Daylight" },
  { id: "airports", label: "Airports" },
  { id: "space", label: "GPS / Kp" },
  { id: "rules", label: "Rules" },
];

const WIND_PRESETS = [
  { mph: 15, label: "15 mph", hint: "Mini class, sub-250 g" },
  { mph: 20, label: "20 mph", hint: "Mid-size folding drones" },
  { mph: 25, label: "25 mph", hint: "Mavic / Air class" },
  { mph: 30, label: "30 mph", hint: "Heavy enterprise frames" },
];

interface Prefs {
  style: MapStyle;
  view: "plain" | "pilot";
  hidden: SectionId[];
  windLimitMph: number;
  overlays: Record<OverlayKey, boolean>;
}

const DEFAULT_PREFS: Prefs = {
  style: "sectional",
  view: "plain",
  hidden: [],
  windLimitMph: 20,
  overlays: { grid: true, airspace: true, tfr: true, sua: true, airports: true },
};

const PREFS_KEY = "ltf.flycheck.prefs";

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Prefs>;
      return { ...DEFAULT_PREFS, ...p, overlays: { ...DEFAULT_PREFS.overlays, ...(p.overlays ?? {}) } };
    }
  } catch {}
  return DEFAULT_PREFS;
}

/* ── Conditions verdict (client side: it depends on the wind limit) ──────── */

function category(visSm: number | null, ceil: number | null) {
  const v = visSm ?? 10;
  const c = ceil ?? 99999;
  if (c < 500 || v < 1) return "LIFR";
  if (c < 1000 || v < 3) return "IFR";
  if (c <= 3000 || v <= 5) return "MVFR";
  return "VFR";
}

function conditions(m: Metar | null, kp: number | null, limit: number, light: "day" | "twilight" | "night") {
  const f: Finding[] = [];
  if (m) {
    const wind = ktToMph(m.windKt);
    const gust = m.gustKt ? ktToMph(m.gustKt) : null;
    if (m.visibilitySm < 3)
      f.push({
        level: "stop",
        title: `Visibility ${m.visibilitySm} SM at ${m.station.id}`,
        detail: "Part 107 needs at least 3 statute miles of flight visibility from your control station.",
        cite: "14 CFR 107.51(c)",
        learn: "weather",
      });
    if (m.ceilingFt !== null) {
      const top = m.ceilingFt - 500;
      if (top <= 0)
        f.push({
          level: "stop",
          title: `Ceiling ${m.ceilingFt} ft: too low to fly`,
          detail: "You must stay 500 ft below the clouds, which leaves no room at all.",
          cite: "14 CFR 107.51(d)",
          learn: "weather",
        });
      else if (top < 400)
        f.push({
          level: "caution",
          title: `Ceiling ${m.ceilingFt} ft: max altitude about ${top} ft AGL`,
          detail: "Staying 500 ft below the cloud base caps you under the usual 400 ft.",
          cite: "14 CFR 107.51(d)",
          learn: "weather",
        });
    }
    if (m.wx && /TS/.test(m.wx))
      f.push({
        level: "stop",
        title: /VCTS/.test(m.wx) ? "Thunderstorm in the vicinity" : "Thunderstorm at the station",
        detail: /VCTS/.test(m.wx)
          ? "A storm within 5 to 10 miles of the station. Lightning and outflow gusts reach well beyond the rain; wait for it to pass."
          : "Lightning, outflow gusts and hail. Land and wait it out; storms can throw gusts miles ahead of the rain.",
        learn: "weather",
      });
    else if (m.wx && /(RA|SN|DZ|PL|GR|GS)/.test(m.wx))
      f.push({
        level: "caution",
        title: `Precipitation: ${wxPlain(m.wx)}`,
        detail: "Most consumer drones are not sealed against water. Check your aircraft's rating.",
        learn: "weather",
      });
    if (wind >= limit)
      f.push({
        level: "stop",
        title: `Wind ${wind} mph is at or over your ${limit} mph limit`,
        detail: "Winds at 400 ft usually run stronger than the surface report.",
        learn: "weather",
      });
    else if ((gust ?? 0) >= limit || wind >= limit * 0.75)
      f.push({
        level: "caution",
        title: gust ? `Gusts to ${gust} mph` : `Wind ${wind} mph, close to your limit`,
        detail: "Expect a hard fight upwind on the way home. Keep the battery margin wide.",
        learn: "weather",
      });
    if (m.tempC !== null && m.dewC !== null && m.tempC - m.dewC <= 2)
      f.push({
        level: "caution",
        title: `Temperature/dew point spread ${Math.round((m.tempC - m.dewC) * 10) / 10}°C`,
        detail: "Air this close to saturation can turn to fog or mist quickly.",
        learn: "weather",
      });
    if (m.densityAltFt !== null && m.densityAltFt > m.station.elevFt + 2000)
      f.push({
        level: "info",
        title: `Density altitude ${m.densityAltFt.toLocaleString()} ft`,
        detail: "Thin, hot air: less lift, harder-working motors, shorter flights.",
        learn: "loading-performance",
      });
  }
  if (light !== "day")
    f.push({
      level: "caution",
      title: light === "night" ? "Night" : "Civil twilight",
      detail: "Allowed, but you need anti-collision lighting visible for 3 statute miles. Night also needs the updated knowledge test or recurrent training.",
      cite: "14 CFR 107.29",
    });
  if (kp !== null && kp >= 5)
    f.push({
      level: "caution",
      title: `Geomagnetic storm (Kp ${kp})`,
      detail: "GPS accuracy can degrade. Be ready to fly in attitude mode.",
    });
  const rank = { info: 0, go: 1, caution: 2, stop: 3 } as const;
  const level = f.reduce<Level>((a, x) => (rank[x.level] > rank[a] ? x.level : a), "go");
  if (!f.some((x) => x.level !== "info") && m)
    f.unshift({ level: "go", title: "Weather is within limits", detail: "Visibility, clouds and wind all leave room for a normal flight.", learn: "weather" });
  return { level, findings: f.sort((a, b) => rank[b.level] - rank[a.level]) };
}

/* ── Small presentational pieces ──────────────────────────────────────────── */

function Card({ id, title, eyebrow, children, learn, delay = 0, className = "" }: {
  id: string;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  learn?: { slug: string; label: string };
  delay?: number;
  className?: string;
}) {
  return (
    <section
      id={`fc-${id}`}
      className={`fc-card fc-rise rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.01] p-5 backdrop-blur sm:p-6 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          {eyebrow && <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--accent)]">{eyebrow}</p>}
          <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        {learn && (
          <Link
            href={`/learn/${learn.slug}`}
            className="shrink-0 pt-1 text-[11px] text-[#6b6b6b] transition-colors hover:text-[var(--muted)]"
            title={`Part 107 lesson: ${learn.label}`}
          >
            {learn.label} explained
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

function FindingRow({ f, pilot }: { f: Finding; pilot: boolean }) {
  const c = LEVEL_COLOR[f.level];
  return (
    <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{f.title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{f.detail}</p>
        {f.tfr && <TfrPanel d={f.tfr} href={f.link?.href} />}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {f.cite && pilot && (
            <span className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] text-[var(--muted)]">{f.cite}</span>
          )}
          {f.link && (
            <a
              href={f.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-[var(--accent)]/15 px-2 py-0.5 text-[11px] font-medium text-[var(--accent)] hover:bg-[var(--accent)]/25"
            >
              {f.link.label} ↗
            </a>
          )}
          {f.learn && pilot && (
            <Link href={`/learn/${f.learn}`} className="text-[11px] text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]">
              lesson
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

function Stat({ label, value, sub, color }: { label: string; value: React.ReactNode; sub?: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight" style={color ? { color } : undefined}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-[var(--muted)]">{sub}</p>}
    </div>
  );
}

function Unavailable({ what }: { what: string }) {
  return <p className="text-sm text-[var(--muted)]">{what} is unavailable right now. The source did not answer; try again in a minute.</p>;
}

const LOADING_LINES = [
  "Unfolding the sectional…",
  "Asking the FAA about airspace…",
  "Scanning for TFRs…",
  "Pulling the latest METAR…",
  "Reading the TAF…",
  "Checking where the sun is…",
];

/* ── Main ─────────────────────────────────────────────────────────────────── */

/** hero=false renders just the search bar, for pages that bring their own
 *  heading (the place pages). initial runs a check on load when the URL
 *  does not already carry one. */
export function FlyCheck({ initial, hero = true }: { initial?: GeoResult; hero?: boolean } = {}) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState<GeoResult | null>(null);
  const [report, setReport] = useState<FlyReport | null>(null);
  const [busy, setBusy] = useState<"" | "geocode" | "locate" | "check">("");
  const [err, setErr] = useState("");
  const [line, setLine] = useState(0);
  const [now, setNow] = useState(() => new Date());
  // Airport hover is shared by the list and the map; "from" says which side
  // started it so only the other side scrolls or pans.
  const [hoverApt, setHoverApt] = useState<{ id: string; from: "map" | "list" } | null>(null);
  const [focusApt, setFocusApt] = useState<{ lat: number; lng: number; key: number } | null>(null);
  const onMapHover = useCallback((id: string | null) => setHoverApt(id ? { id, from: "map" } : null), []);

  useEffect(() => {
    if (hoverApt?.from !== "map") return;
    const row = document.querySelector<HTMLElement>(`[data-apt="${CSS.escape(hoverApt.id)}"]`);
    const list = row?.parentElement;
    if (row && list && list.scrollHeight > list.clientHeight)
      list.scrollTo({ top: row.offsetTop - list.clientHeight / 2 + row.clientHeight / 2, behavior: "smooth" });
  }, [hoverApt]);

  // localStorage only exists in the browser, so prefs load after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setPrefs(loadPrefs()), []);
  const update = useCallback((p: Partial<Prefs>) => {
    setPrefs((cur) => {
      const next = { ...cur, ...p };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (busy !== "check") return;
    const t = setInterval(() => setLine((l) => (l + 1) % LOADING_LINES.length), 900);
    return () => clearInterval(t);
  }, [busy]);

  const check = useCallback(async (g: GeoResult) => {
    setLoc(g);
    setErr("");
    setBusy("check");
    setLine(0);
    try {
      const r = await fetch(`/api/fly-check?lat=${g.lat.toFixed(4)}&lng=${g.lng.toFixed(4)}`);
      if (!r.ok) throw new Error("check failed");
      const data = (await r.json()) as FlyReport;
      setReport(data);
      const u = new URL(window.location.href);
      u.searchParams.set("lat", g.lat.toFixed(4));
      u.searchParams.set("lng", g.lng.toFixed(4));
      u.searchParams.set("place", g.label);
      window.history.replaceState(null, "", u);
      requestAnimationFrame(() =>
        document.getElementById("fc-results")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch {
      setErr("Something went wrong pulling the briefing. Try again in a moment.");
    } finally {
      setBusy("");
    }
  }, []);

  // Deep links: /can-i-fly-here?lat=..&lng=..&place=..
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const lat = Number(sp.get("lat"));
    const lng = Number(sp.get("lng"));
    if (sp.get("lat") && Number.isFinite(lat) && Number.isFinite(lng)) {
      const label = sp.get("place") || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      // Restoring a shared link is a one-time sync from the URL into state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQ(label);
      check({ lat, lng, label });
    } else if (initial) {
      setQ(initial.label);
      check(initial);
    }
    // initial is a fixed prop per page; running once is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check]);

  const search = async (text: string) => {
    const s = text.trim();
    if (!s) return;
    setBusy("geocode");
    setErr("");
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(s)}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setQ(d.label);
      await check(d as GeoResult);
    } catch (e) {
      setErr(e instanceof Error && e.message ? e.message : "We couldn't find that place.");
      setBusy("");
    }
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setErr("This browser can't share its location. Type an address instead.");
      return;
    }
    setBusy("locate");
    setErr("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const g = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: "Your location" };
        setQ("Your location");
        check(g);
        try {
          const r = await fetch(`/api/geocode?lat=${g.lat.toFixed(5)}&lng=${g.lng.toFixed(5)}`);
          const d = (await r.json()) as GeoResult;
          if (d.label) {
            setQ(d.label);
            setLoc((cur) => (cur && cur.lat === g.lat ? { ...cur, label: d.label } : cur));
          }
        } catch {}
      },
      () => {
        setBusy("");
        setErr("Location permission was denied. Type an address, city or ZIP instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const pick = useCallback(
    (lat: number, lng: number) => {
      const g = { lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
      setQ(g.label);
      check(g);
      fetch(`/api/geocode?lat=${lat.toFixed(5)}&lng=${lng.toFixed(5)}`)
        .then((r) => r.json())
        .then((d: GeoResult) => {
          if (!d.label) return;
          setQ(d.label);
          setLoc((cur) => (cur && cur.lat === lat ? { ...cur, label: d.label } : cur));
        })
        .catch(() => {});
    },
    [check],
  );

  /* Derived */
  const sun = useMemo(() => {
    if (!report) return null;
    const t = SunCalc.getTimes(now, report.point.lat, report.point.lng);
    // Polar day or night: SunCalc returns invalid dates and there is no arc to draw.
    if (!t.sunrise || !t.sunset || !t.dawn || !t.dusk || isNaN(t.sunrise.getTime())) return null;
    const light: "day" | "twilight" | "night" =
      now >= t.sunrise && now <= t.sunset ? "day" : now >= t.dawn && now <= t.dusk ? "twilight" : "night";
    return { dawn: t.dawn, sunrise: t.sunrise, sunset: t.sunset, dusk: t.dusk, light };
  }, [report, now]);

  const cond = useMemo(
    () =>
      report
        ? conditions(report.metar.data, report.space.data?.kp ?? null, prefs.windLimitMph, sun?.light ?? "day")
        : null,
    [report, prefs.windLimitMph, sun],
  );

  const show = (id: SectionId) => !prefs.hidden.includes(id);
  const pilot = prefs.view === "pilot";
  const av = report?.airspaceVerdict;
  const m = report?.metar.data ?? null;

  const AIR_WORD: Record<Level, string> = { go: "GO", caution: "AUTH", stop: "NO-FLY", info: "INFO" };
  const WX_WORD: Record<Level, string> = { go: "GOOD", caution: "LIMITS", stop: "GROUNDED", info: "OK" };
  const WX_HEAD: Record<Level, string> = {
    go: "Good flying weather",
    caution: "Flyable, with limits",
    stop: "Grounded by conditions",
    info: "Conditions",
  };

  return (
    <div>
      {/* ── Search hero ── */}
      <section className="relative overflow-hidden">
        <div className="fc-grid pointer-events-none absolute inset-0" />
        <div className="fc-glow pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full" />
        <div className={`relative mx-auto max-w-6xl px-6 ${hero ? "pb-14 pt-16 sm:pt-24" : "pb-8 pt-2"}`}>
          {hero && (
          <>
          <p className="fc-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[var(--muted)]">
            <span className="fc-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Free · live FAA data · any U.S. address
          </p>
          <h1 className="fc-rise mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl" style={{ animationDelay: "60ms" }}>
            Can I fly my drone <span className="fc-gradient-text">here?</span>
          </h1>
          <p className="fc-rise mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]" style={{ animationDelay: "120ms" }}>
            Type an address or use your location. We check FAA airspace, no-fly zones, temporary flight
            restrictions, nearby airports and the weather, and tell you in plain English whether you can fly
            there right now.
          </p>
          </>
          )}

          <form
            className={`fc-rise flex max-w-3xl flex-col gap-3 sm:flex-row ${hero ? "mt-9" : ""}`}
            style={{ animationDelay: "180ms" }}
            onSubmit={(e) => {
              e.preventDefault();
              search(q);
            }}
          >
            <div className="group relative flex-1">
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-[var(--accent)]/50 via-fuchsia-500/30 to-sky-500/40 opacity-40 blur transition-opacity group-focus-within:opacity-90" />
              <div className="relative flex items-center rounded-2xl border border-white/10 bg-[#111]/90">
                <svg className="ml-4 h-5 w-5 shrink-0 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Address, city, ZIP, landmark or lat, lng"
                  aria-label="Where do you want to fly?"
                  className="h-14 w-full bg-transparent px-3 text-base outline-none placeholder:text-[#666]"
                  autoComplete="street-address"
                />
                <button
                  type="submit"
                  disabled={!!busy}
                  className="mr-1.5 h-11 shrink-0 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
                >
                  {busy === "geocode" || busy === "check" ? "Checking…" : "Check"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={locate}
              disabled={!!busy}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium transition hover:border-white/25 hover:bg-white/[0.06] disabled:opacity-60"
            >
              <svg className={`h-5 w-5 ${busy === "locate" ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                <circle cx="12" cy="12" r="8" opacity="0.4" />
              </svg>
              {busy === "locate" ? "Finding you…" : "Use my location"}
            </button>
          </form>

          <div className={`fc-rise mt-4 flex-wrap items-center gap-2 text-sm ${hero ? "flex" : "hidden"}`} style={{ animationDelay: "240ms" }}>
            <span className="text-[var(--muted)]">Try</span>
            {["Rockwall, TX", "Grand Canyon Village, AZ", "Dallas Love Field", "Central Park, New York"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQ(s);
                  search(s);
                }}
                className="rounded-full border border-white/10 px-3 py-1 text-[var(--muted)] transition hover:border-[var(--accent)]/60 hover:text-[var(--text)]"
              >
                {s}
              </button>
            ))}
          </div>

          {err && <p className="mt-5 text-sm text-[var(--wrong)]">{err}</p>}
        </div>
      </section>

      {/* ── Loading radar ── */}
      {busy === "check" && (
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-16">
          <div className="fc-radar relative h-44 w-44 rounded-full border border-[var(--accent)]/30">
            <div className="absolute inset-6 rounded-full border border-[var(--accent)]/20" />
            <div className="absolute inset-14 rounded-full border border-[var(--accent)]/15" />
            <div className="fc-sweep absolute inset-0 rounded-full" />
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]" />
          </div>
          <p className="mt-6 text-sm text-[var(--muted)]">{LOADING_LINES[line]}</p>
        </div>
      )}

      {/* ── Results ── */}
      {report && av && cond && busy !== "check" && (
        <div id="fc-results" className="mx-auto max-w-6xl scroll-mt-4 px-6 pb-20">
          {/* Verdict */}
          <section className="fc-rise relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-white/[0.015] to-transparent p-6 sm:p-8">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
              style={{ background: LEVEL_COLOR[av.level] }}
            />
            <p className="relative text-sm text-[var(--muted)]">
              {loc?.label ?? "This spot"} · {report.point.lat.toFixed(4)}, {report.point.lng.toFixed(4)}
              {report.point.elevationFt !== null && ` · ground ${report.point.elevationFt.toLocaleString()} ft MSL`}
            </p>
            <div className="relative mt-6 grid gap-8 md:grid-cols-2">
              <div className="flex items-center gap-5">
                <VerdictRing
                  level={av.level}
                  word={
                    av.incomplete && av.level !== "stop"
                      ? "CHECK"
                      : av.level === "caution" && !av.findings.some((f) => f.cite === "14 CFR 107.41" && f.level === "caution")
                        ? "CAUTION"
                        : AIR_WORD[av.level]
                  }
                  label="Airspace"
                />
                <div>
                  <p className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{av.headline}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{av.findings[0]?.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <VerdictRing level={cond.level} word={WX_WORD[cond.level]} label="Conditions" />
                <div>
                  <p className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{WX_HEAD[cond.level]}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {cond.findings[0]?.title ?? "No current observation nearby"}
                  </p>
                </div>
              </div>
            </div>
            <p className="relative mt-6 text-xs leading-5 text-[var(--muted)]">
              A briefing, not an authorization. You are the remote pilot in command (14 CFR 107.19). NOTAMs are
              not checked here; review them and request any LAANC authorization through an FAA-approved provider
              before you fly. Data as of {new Date(report.generatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.
            </p>
          </section>

          {/* Controls */}
          <div className="z-[500] -mx-6 mt-6 sm:sticky sm:top-0 border-y border-white/[0.06] bg-[#0a0a0a]/85 px-6 py-3 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-full border border-white/10 p-0.5 text-xs">
                {(["plain", "pilot"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => update({ view: v })}
                    className={`rounded-full px-3 py-1.5 font-medium transition ${prefs.view === v ? "bg-[var(--text)] text-black" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
                  >
                    {v === "plain" ? "Plain English" : "Pilot view"}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[var(--muted)]">
                Wind limit
                <select
                  value={prefs.windLimitMph}
                  onChange={(e) => update({ windLimitMph: Number(e.target.value) })}
                  className="bg-transparent font-medium text-[var(--text)] outline-none"
                >
                  {WIND_PRESETS.map((w) => (
                    <option key={w.mph} value={w.mph} className="bg-[#111]">
                      {w.label}: {w.hint}
                    </option>
                  ))}
                </select>
              </label>
              <span className="mx-1 hidden h-5 w-px bg-white/10 sm:block" />
              <div className="flex flex-wrap gap-1.5">
                {SECTIONS.map((s) => {
                  const on = show(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() =>
                        update({ hidden: on ? [...prefs.hidden, s.id] : prefs.hidden.filter((h) => h !== s.id) })
                      }
                      aria-pressed={on}
                      className={`rounded-full border px-2.5 py-1 text-xs transition ${on ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--text)]" : "border-white/10 text-[#666] line-through decoration-white/20 hover:text-[var(--muted)]"}`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12 [&>*]:min-w-0">
            {/* Map */}
            {show("map") && (
              <section
                className={`fc-rise relative overflow-hidden rounded-2xl border border-white/[0.07] ${show("airports") ? "lg:col-span-8" : "lg:col-span-12"}`}
                style={{ animationDelay: "60ms" }}
              >
                <div className="h-[460px] sm:h-[540px]">
                  <FlyMap
                    lat={report.point.lat}
                    lng={report.point.lng}
                    overlays={report.overlays}
                    airports={report.airports.data ?? []}
                    style={prefs.style}
                    visible={prefs.overlays}
                    onPick={pick}
                    highlight={hoverApt?.id ?? null}
                    onHoverAirport={onMapHover}
                    focus={focusApt}
                  />
                </div>
                <div className="pointer-events-none absolute inset-x-3 top-3 z-[400] flex flex-wrap items-start justify-between gap-2">
                  <div className="pointer-events-auto flex flex-wrap gap-1 rounded-xl border border-white/10 bg-black/70 p-1 backdrop-blur-md">
                    {(Object.keys(STYLES) as MapStyle[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => update({ style: s })}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${prefs.style === s ? "bg-[var(--accent)] text-black" : "text-[var(--muted)] hover:text-white"}`}
                      >
                        {STYLES[s].label}
                      </button>
                    ))}
                  </div>
                  <div className="pointer-events-auto flex flex-wrap gap-1 rounded-xl border border-white/10 bg-black/70 p-1 backdrop-blur-md">
                    {(Object.keys(OVERLAYS) as OverlayKey[]).map((k) => {
                      const on = prefs.overlays[k];
                      return (
                        <button
                          key={k}
                          onClick={() => update({ overlays: { ...prefs.overlays, [k]: !on } })}
                          aria-pressed={on}
                          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition ${on ? "text-white" : "text-[#666]"}`}
                        >
                          <span className="h-2 w-2 rounded-full" style={{ background: on ? OVERLAYS[k].swatch : "#333" }} />
                          {OVERLAYS[k].label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-lg bg-black/70 px-2.5 py-1 text-[11px] text-[var(--muted)] backdrop-blur-md">
                  Click the map to check another spot · click in to zoom with the wheel
                </p>
              </section>
            )}

            {/* Airports, beside the map */}
            {show("airports") && (
              <Card
                id="airports"
                eyebrow="Within 5 NM"
                title="Airports & heliports"
                learn={{ slug: "airport-operations", label: "Airport ops" }}
                className="flex flex-col lg:col-span-4 lg:h-[540px]"
                delay={100}
              >
                {!report.airports.ok ? (
                  <Unavailable what="The FAA airport list" />
                ) : !report.airports.data?.length ? (
                  <p className="text-sm text-[var(--muted)]">No airports, heliports or seaplane bases within 5 NM.</p>
                ) : (
                  <ul className="relative -mx-2 min-h-0 flex-1 space-y-1 overflow-y-auto px-2">
                    {report.airports.data.map((a) => {
                      const lit = hoverApt?.id === a.ident;
                      const heli = a.type === "HP";
                      return (
                        <li
                          key={a.ident}
                          data-apt={a.ident}
                          onMouseEnter={() => setHoverApt({ id: a.ident, from: "list" })}
                          onMouseLeave={() => setHoverApt(null)}
                          onClick={() => setFocusApt({ lat: a.lat, lng: a.lng, key: Date.now() })}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-2.5 py-2.5 transition-all duration-150 ${
                            lit
                              ? "border-[var(--accent)]/60 bg-[var(--accent)]/10 shadow-[0_0_24px_-6px_rgba(255,107,53,0.6)]"
                              : "border-transparent hover:bg-white/[0.03]"
                          }`}
                        >
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold transition-transform ${lit ? "scale-110" : ""} ${heli ? "bg-fuchsia-500/15 text-fuchsia-300" : "bg-sky-500/15 text-sky-300"}`}
                          >
                            {heli ? "H" : a.type === "SP" ? "S" : "✈"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium leading-5">{a.name}</p>
                            <p className="text-xs text-[var(--muted)]">
                              {a.typeLabel}
                              {a.privateUse ? " · private" : ""} · {a.ident}
                            </p>
                          </div>
                          <span className="text-right text-sm tabular-nums">
                            {a.distanceNm} NM
                            <span className="block text-xs text-[var(--muted)]">{compass(a.bearing)}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <p className="mt-3 text-[11px] text-[var(--muted)]">Hover to find it on the map · click to fly there</p>
              </Card>
            )}

            {/* Airspace */}
            {show("airspace") && (
              <Card id="airspace" eyebrow="Airspace & restrictions" title={av.headline} learn={{ slug: "airspace", label: "Airspace" }} className="lg:col-span-7" delay={120}>
                {!report.airspace.ok && <Unavailable what="FAA airspace data" />}
                <ul className="space-y-2.5">
                  {av.findings.map((f, i) => (
                    <FindingRow key={i} f={f} pilot={pilot} />
                  ))}
                </ul>
                {report.airspace.data?.grid && (
                  <div className="mt-4 grid grid-cols-3 gap-2.5">
                    <Stat
                      label="LAANC ceiling"
                      value={`${report.airspace.data.grid.ceilingFt} ft`}
                      color={report.airspace.data.grid.ceilingFt === 0 ? LEVEL_COLOR.stop : LEVEL_COLOR.caution}
                      sub="AGL, auto-approval max"
                    />
                    <Stat label="Airspace" value={report.airspace.data.grid.airspace.map((a) => `Class ${a}`).join(", ") || "n/a"} />
                    <Stat label="Facility" value={report.airspace.data.grid.airports.map((a) => a.id).join(", ")} sub={report.airspace.data.grid.effective && `map eff. ${report.airspace.data.grid.effective}`} />
                  </div>
                )}
                {pilot && report.airspace.data && report.airspace.data.overhead.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Overhead</p>
                    <ul className="mt-2 space-y-1 font-mono text-xs text-[var(--muted)]">
                      {report.airspace.data.overhead.map((v, i) => (
                        <li key={i}>
                          {v.cls === "E" ? "Class E" : `Class ${v.cls}`} · floor {v.lowerFt.toLocaleString()} ft {v.lowerRef}
                          {v.upperFt ? ` · top ${v.upperFt.toLocaleString()} ft` : ""} · {v.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}

            {/* Rules */}
            {show("rules") && (
              <Card id="rules" eyebrow="Every flight" title="The rules that always apply" learn={{ slug: "exam-day", label: "Under-taught topics" }} className="lg:col-span-5" delay={160}>
                <ul className="space-y-2.5 text-sm">
                  {[
                    ["400 ft AGL max", "Higher only within 400 ft of a structure, and no higher than 400 ft above its top.", "107.51(b)"],
                    ["Keep it in sight", "Visual line of sight, yours or a visual observer's, with no binoculars doing the work.", "107.31"],
                    ["Give way to everyone", "Every crewed aircraft has the right of way, always.", "107.37"],
                    ["100 mph groundspeed max", "87 knots.", "107.51(a)"],
                    ["People and moving vehicles", "Over people only within the Subpart D categories. Never from a moving vehicle unless over sparse areas.", "107.39, 107.25"],
                    ["Remote ID on", "Standard Remote ID or a broadcast module, unless at a FRIA.", "Part 89"],
                    ["Stadiums", "A standing restriction keeps drones 3 NM from stadiums of 30,000+ seats from 1 hour before to 1 hour after major events.", "standing FDC NOTAM"],
                    ["Check NOTAMs", "This page does not read them. Look before every flight.", "107.49(a)"],
                  ].map(([h, d, c]) => (
                    <li key={h} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <div>
                        <span className="font-medium">{h}.</span> <span className="text-[var(--muted)]">{d}</span>
                        {pilot && <span className="ml-1.5 font-mono text-[11px] text-[#666]">{c}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Weather now */}
            {show("weather") && (
              <Card
                id="weather"
                eyebrow="Weather now"
                title={m ? `${m.station.id} · ${m.station.name}` : "Current conditions"}
                learn={{ slug: pilot ? "metar-taf" : "weather", label: pilot ? "METARs & TAFs" : "Weather" }}
                className="lg:col-span-12"
                delay={200}
              >
                {!m ? (
                  <Unavailable what="A nearby METAR" />
                ) : (
                  <>
                    <p className="-mt-2 mb-4 text-xs text-[var(--muted)]">
                      {m.station.distanceNm} NM {compass(m.station.bearing)} of you · observed{" "}
                      {new Date(m.observed).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </p>
                    <div className="grid gap-6 md:grid-cols-[auto_1fr]">
                      <div className="flex justify-center">
                        <WindDial
                          dir={m.windDir}
                          variable={m.windVariable}
                          speed={pilot ? m.windKt : ktToMph(m.windKt)}
                          gust={m.gustKt ? (pilot ? m.gustKt : ktToMph(m.gustKt)) : null}
                          limit={pilot ? Math.round(prefs.windLimitMph / 1.15078) : prefs.windLimitMph}
                          unit={pilot ? "kt" : "mph"}
                        />
                      </div>
                      <div>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                          {(() => {
                            const cat = CATEGORY[m.category ?? category(m.visibilitySm, m.ceilingFt)];
                            return <Stat label="Category" value={cat?.label ?? "n/a"} color={cat?.color} sub={pilot ? cat?.meaning : undefined} />;
                          })()}
                          <Stat
                            label="Visibility"
                            value={`${m.visibilitySm}${m.visibilityPlus ? "+" : ""} SM`}
                            color={m.visibilitySm < 3 ? LEVEL_COLOR.stop : undefined}
                            sub="3 SM minimum"
                          />
                          <Stat
                            label="Ceiling"
                            value={m.ceilingFt !== null ? `${m.ceilingFt.toLocaleString()} ft` : "None"}
                            color={m.ceilingFt !== null && m.ceilingFt < 900 ? LEVEL_COLOR.caution : undefined}
                            sub={m.ceilingFt !== null ? `fly ≤ ${Math.max(0, Math.min(400, m.ceilingFt - 500))} ft AGL` : "no broken or overcast layer"}
                          />
                          <Stat
                            label="Temp / dew"
                            value={m.tempC !== null ? `${Math.round(pilot ? m.tempC : (m.tempC * 9) / 5 + 32)}°${pilot ? "C" : "F"}` : "n/a"}
                            sub={m.dewC !== null ? `dew ${Math.round(pilot ? m.dewC : (m.dewC * 9) / 5 + 32)}°` : undefined}
                          />
                          {pilot && <Stat label="Altimeter" value={m.altimInHg ? `${m.altimInHg.toFixed(2)}"` : "n/a"} sub="inHg" />}
                          {pilot && (
                            <Stat
                              label="Density alt."
                              value={m.densityAltFt !== null ? `${m.densityAltFt.toLocaleString()} ft` : "n/a"}
                              sub={`field ${m.station.elevFt.toLocaleString()} ft`}
                            />
                          )}
                          {m.wx && <Stat label="Weather" value={<span className="text-base">{wxPlain(m.wx)}</span>} color={LEVEL_COLOR.caution} />}
                          {!pilot && m.clouds.length > 0 && (
                            <Stat
                              label="Clouds"
                              value={<span className="text-base">{m.clouds.map((c) => `${c.cover} ${c.baseFt?.toLocaleString() ?? ""}`).join(" · ")}</span>}
                            />
                          )}
                        </div>
                        <ul className="mt-4 space-y-2.5">
                          {cond.findings.map((f, i) => (
                            <FindingRow key={i} f={f} pilot={pilot} />
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Decoder raw={m.raw} title={`METAR ${m.station.id}, decoded · hover any group`} />
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* Forecast */}
            {show("forecast") && (
              <Card id="forecast" eyebrow="Next 12 hours" title="Will it hold?" learn={{ slug: "metar-taf", label: "TAFs" }} className="lg:col-span-12" delay={240}>
                {report.hourly.data?.length ? (
                  <div className="-mx-1 overflow-x-auto px-1 pt-4">
                    <div className="min-w-[540px]">
                      <ForecastStrip hours={report.hourly.data} limit={prefs.windLimitMph} />
                    </div>
                  </div>
                ) : (
                  <Unavailable what="The National Weather Service hourly forecast" />
                )}
                <p className="mt-3 text-xs text-[var(--muted)]">
                  Surface wind from the National Weather Service hourly forecast for this exact point. Bars turn amber at 75% of your
                  limit and red past it.
                </p>

                {report.taf.data && (
                  <div className="mt-6 border-t border-white/[0.06] pt-5">
                    <p className="text-sm font-medium">
                      TAF {report.taf.data.station.id}{" "}
                      <span className="font-normal text-[var(--muted)]">
                        · {report.taf.data.station.name} · {report.taf.data.station.distanceNm} NM {compass(report.taf.data.station.bearing)}
                      </span>
                    </p>
                    <ol className="mt-3 space-y-1.5">
                      {report.taf.data.periods.map((p, i) => {
                        const ceil = p.clouds.find((c) => ["BKN", "OVC", "VV"].includes(c.cover))?.baseFt ?? null;
                        const cat = CATEGORY[category(p.visibilitySm, ceil)];
                        const t = (s: string) =>
                          new Date(s).toLocaleString([], { weekday: "short", hour: "numeric" }).replace(" ", " ");
                        return (
                          <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-black/20 px-3 py-2 text-sm">
                            <span className="w-36 shrink-0 tabular-nums text-[var(--muted)]">
                              {t(p.from)} → {t(p.to)}
                            </span>
                            {p.change && (
                              <span className="rounded bg-[var(--accent)]/15 px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                                {p.change === "PROB" ? `${p.probability}% chance` : p.change === "TEMPO" ? "temporarily" : p.change === "BECMG" ? "becoming" : "from"}
                              </span>
                            )}
                            <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ color: cat.color, background: `${cat.color}1a` }}>
                              {cat.label}
                            </span>
                            <span className="text-[var(--muted)]">
                              {[
                                p.windKt !== null && (p.windKt === 0 ? "calm" : `wind ${pilot ? `${p.windKt} kt` : `${ktToMph(p.windKt)} mph`}${p.gustKt ? ` gusting ${pilot ? p.gustKt : ktToMph(p.gustKt)}` : ""}`),
                                p.visibilitySm !== null && `${p.visibilitySm}${p.visibilityPlus ? "+" : ""} SM`,
                                ceil !== null && `ceiling ${ceil.toLocaleString()} ft`,
                                p.wx && wxPlain(p.wx),
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                    <div className="mt-5">
                      <Decoder raw={report.taf.data.raw} title={`TAF ${report.taf.data.station.id}, decoded · one band per change`} />
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Daylight */}
            {show("daylight") && sun && (
              <Card id="daylight" eyebrow="Daylight" title={sun.light === "day" ? "Daytime" : sun.light === "twilight" ? "Civil twilight" : "Night"} className="lg:col-span-6" delay={280}>
                <div className="flex justify-center">
                  <SunArc dawn={sun.dawn} sunrise={sun.sunrise} sunset={sun.sunset} dusk={sun.dusk} now={now} />
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {sun.light === "day"
                    ? `Sunset in ${Math.max(0, Math.round((sun.sunset.getTime() - now.getTime()) / 60000 / 6) / 10)} hours. After that, civil twilight runs until ${sun.dusk.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`
                    : "Twilight and night flight are legal with anti-collision lighting visible for 3 statute miles."}
                </p>
                {pilot && <p className="mt-2 font-mono text-[11px] text-[#666]">14 CFR 107.29 · times shown in your device&apos;s time zone</p>}
              </Card>
            )}

            {/* Space weather */}
            {show("space") && (
              <Card id="space" eyebrow="Space weather" title="GPS outlook" className="lg:col-span-6" delay={360}>
                {report.space.data ? (
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-4xl font-semibold tabular-nums">Kp {report.space.data.kp.toFixed(1)}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {report.space.data.kp >= 5
                          ? "Geomagnetic storm. GPS may wander."
                          : report.space.data.kp >= 4
                            ? "Unsettled. Watch your satellite count."
                            : "Quiet. GPS should be solid."}
                      </p>
                    </div>
                    <KpGauge kp={report.space.data.kp} />
                  </div>
                ) : (
                  <Unavailable what="The NOAA Kp index" />
                )}
                <p className="mt-3 text-xs text-[var(--muted)]">Planetary K index from NOAA&apos;s Space Weather Prediction Center.</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
