import Link from "next/link";
import { Mark } from "@/components/Mark";
import { AuthButton } from "@/components/AuthButton";
import { PLACES, placeLabel } from "@/content/places";

/** Server-rendered chrome shared by /can-i-fly-here and its place pages. */

export function FlyHeader() {
  return (
    <header className="relative z-10 border-b border-[var(--border)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">
            Legal<span className="text-[var(--accent)]">to</span>Fly
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/can-i-fly-here" className="whitespace-nowrap font-medium text-[var(--text)]">
            Can I fly here?
          </Link>
          <Link href="/learn" className="hidden text-[var(--muted)] hover:text-[var(--text)] sm:inline">
            Part 107 prep
          </Link>
          <span className="hidden sm:inline-flex">
            <AuthButton />
          </span>
        </nav>
      </div>
    </header>
  );
}

export function PlacesGrid({ exclude }: { exclude?: string }) {
  return (
    <section className="border-t border-[var(--border)] pt-12">
      <h2 className="text-xl font-semibold tracking-tight">Can I fly a drone in…</h2>
      <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
        {PLACES.filter((p) => p.slug !== exclude).map((p) => (
          <li key={p.slug}>
            <Link href={`/can-i-fly-here/${p.slug}`} className="text-[var(--muted)] hover:text-[var(--accent)]">
              {placeLabel(p)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="border-t border-[var(--border)] pt-12">
      <h2 className="text-xl font-semibold tracking-tight">Common questions</h2>
      <div className="mt-5 space-y-2.5">
        {items.map((f) => (
          <details key={f.q} className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
            <summary className="cursor-pointer list-none font-medium marker:content-none">
              <span className="mr-3 inline-block text-[var(--accent)] transition-transform group-open:rotate-90">›</span>
              {f.q}
            </summary>
            <p className="mt-3 pl-6 text-sm leading-6 text-[var(--muted)]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const SOURCES = [
  ["Airspace & special use airspace", "FAA ADDS"],
  ["LAANC ceilings", "FAA UAS Facility Maps"],
  ["Temporary flight restrictions", "FAA TFR feed and NOTAM records"],
  ["Airports & heliports", "FAA NASR"],
  ["METAR & TAF", "NOAA Aviation Weather Center"],
  ["Hourly forecast", "National Weather Service"],
  ["Park boundaries", "National Park Service"],
  ["Elevation", "USGS 3DEP"],
  ["Kp index", "NOAA SWPC"],
  ["Charts", "FAA VFR Sectional & Terminal"],
];

/** Method and sources, deliberately small: it is there for the curious and
 *  for crawlers, not the first thing a visitor reads. */
export function HowItWorks() {
  return (
    <section className="mt-12 grid gap-8 border-t border-[var(--border)] pt-8 text-xs leading-5 text-[#7a7a7a] md:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">How the check works</h2>
        <p className="mt-2">
          We look up the airspace over your point at ground level. Class G is uncontrolled and needs no authorization
          below 400 ft. Class B, C, D and Class E surface areas around airports are controlled, and flying there needs
          FAA authorization, usually through LAANC (14 CFR 107.41). Temporary flight restrictions, prohibited and
          restricted areas, and National Park Service land each change the answer. Weather comes from the nearest
          airport report and the National Weather Service forecast for the exact point, compared with the Part 107
          minimums and your drone&apos;s wind limit.
        </p>
        <p className="mt-2">
          Recreational flyers follow the same airspace rules and also need the free{" "}
          <a href="https://www.faa.gov/uas/recreational_flyers" className="underline underline-offset-2 hover:text-[var(--muted)]" target="_blank" rel="noopener noreferrer">
            TRUST certificate
          </a>
          . Flying for any business needs a Part 107 certificate.{" "}
          <Link href="/learn" className="underline underline-offset-2 hover:text-[var(--muted)]">
            Free Part 107 study guide
          </Link>
          .
        </p>
      </div>
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Data sources</h2>
        <ul className="mt-2 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          {SOURCES.map(([what, who]) => (
            <li key={what}>
              {what}: <span className="text-[#5f5f5f]">{who}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2">All public sources, read live. Not affiliated with the FAA and not an approved LAANC provider.</p>
      </div>
    </section>
  );
}

export function FlyFooter() {
  return (
    <footer className="border-t border-[var(--border)] py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 text-xs text-[#6b6b6b] sm:flex-row sm:items-center sm:justify-between">
        <p>A briefing, not an authorization. You are responsible for your flight. Always check NOTAMs before you fly.</p>
        <p className="flex gap-4">
          <Link href="/learn" className="hover:text-[var(--muted)]">Part 107 study guide</Link>
          <Link href="/exam" className="hover:text-[var(--muted)]">Practice test</Link>
          <Link href="/" className="hover:text-[var(--muted)]">Legal to Fly</Link>
          <a href="https://dataday.studio" className="hover:text-[var(--muted)]">A DataDay.Studio project</a>
        </p>
      </div>
    </footer>
  );
}
