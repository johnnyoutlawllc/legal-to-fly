import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { AuthButton } from "@/components/AuthButton";
import { FlyCheck } from "@/components/flycheck/FlyCheck";

const TITLE = "Can I Fly My Drone Here? Free Airspace, TFR & Weather Check";
const DESCRIPTION =
  "Enter an address or use your location to see FAA airspace, the LAANC ceiling, temporary flight restrictions, nearby airports and heliports, and the latest METAR and TAF, decoded into plain English for Part 107 drone pilots.";

export const metadata: Metadata = {
  title: `${TITLE} | Legal to Fly`,
  description: DESCRIPTION,
  alternates: { canonical: "/can-i-fly-here" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/can-i-fly-here",
    siteName: "Legal to Fly",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  keywords: [
    "can I fly my drone here",
    "drone airspace map",
    "LAANC map",
    "drone no fly zone",
    "TFR drone",
    "Part 107 weather",
    "METAR decoder",
    "B4UFLY alternative",
  ],
};

const FAQ = [
  {
    q: "How do I know if I can fly my drone at a specific address?",
    a: "Check three things: the airspace class at the surface, whether a temporary flight restriction (TFR) covers the spot, and any local land rules such as National Park Service property. This page checks all three against live FAA and Park Service data. Class G airspace needs no authorization; Class B, C, D and E surface areas need ATC authorization, usually through LAANC.",
  },
  {
    q: "What is a LAANC ceiling?",
    a: "Near controlled airports the FAA publishes UAS Facility Maps: a grid of squares, each with the highest altitude (0 to 400 ft AGL) that can be approved automatically through LAANC. A 0 ft square means no automatic approval at all; you would need a DroneZone authorization with further coordination.",
  },
  {
    q: "What weather do I need to fly under Part 107?",
    a: "At least 3 statute miles of visibility from your control station, and you must stay at least 500 ft below and 2,000 ft horizontally from clouds (14 CFR 107.51). Wind is not a regulatory limit, but your aircraft has one, so this page compares the reported and forecast wind with the limit you choose.",
  },
  {
    q: "Can I fly my drone at night?",
    a: "Yes. Since April 2021, Part 107 pilots can fly at night and during civil twilight with anti-collision lighting visible for 3 statute miles, after passing the current knowledge test or recurrent training (14 CFR 107.29).",
  },
  {
    q: "Does this replace LAANC or B4UFLY?",
    a: "No. This is a briefing that explains what the data means. If you need authorization, request it through an FAA-approved LAANC provider or FAA DroneZone, and check NOTAMs before every flight. You are the remote pilot in command (14 CFR 107.19).",
  },
  {
    q: "Is this on the Part 107 test?",
    a: "Almost all of it. Reading airspace on a sectional chart, decoding METARs and TAFs, density altitude, and right-of-way rules are core Part 107 knowledge areas. Switch to Pilot view to see every raw report decoded group by group, the same skill the exam tests.",
  },
];

const SOURCES = [
  ["Airspace classes & special use airspace", "FAA Aeronautical Data Delivery Service"],
  ["LAANC ceilings", "FAA UAS Facility Maps"],
  ["Temporary flight restrictions", "FAA TFR feed (tfr.faa.gov)"],
  ["Airports, heliports, seaplane bases", "FAA NASR airport data"],
  ["METAR & TAF", "NOAA Aviation Weather Center"],
  ["Hourly forecast", "National Weather Service"],
  ["Park boundaries", "National Park Service"],
  ["Ground elevation", "USGS 3D Elevation Program"],
  ["Kp index", "NOAA Space Weather Prediction Center"],
  ["Charts", "FAA VFR Sectional & Terminal Area Charts"],
];

export default function CanIFlyHerePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Can I Fly Here? by Legal to Fly",
      url: "https://legaltofly.com/can-i-fly-here",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: DESCRIPTION,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="relative z-10 border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark className="h-9 w-9" />
            <span className="text-lg font-semibold tracking-tight">
              Legal<span className="text-[var(--accent)]">to</span>Fly
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/learn" className="hidden text-[var(--muted)] hover:text-[var(--text)] sm:inline">
              Ground school
            </Link>
            <Link href="/exam" className="hidden text-[var(--muted)] hover:text-[var(--text)] sm:inline">
              Mock exam
            </Link>
            <span className="hidden whitespace-nowrap font-medium text-[var(--text)] sm:inline">Can I fly here?</span>
            <span className="hidden sm:inline-flex">
              <AuthButton />
            </span>
            <Link href="/drill" className="whitespace-nowrap text-[var(--muted)] hover:text-[var(--text)] sm:hidden">
              Drill
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <FlyCheck />

        <div className="mx-auto max-w-6xl px-6 pb-20">
          <section className="grid gap-10 border-t border-[var(--border)] pt-14 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">How the check works</h2>
              <div className="mt-4 space-y-4 leading-7 text-[var(--muted)]">
                <p>
                  <strong className="text-[var(--text)]">Airspace.</strong> We look up which airspace sits over your
                  point at ground level. Class G is uncontrolled and needs no authorization below 400 ft. Class B,
                  C, D and the surface area of Class E around an airport are controlled, and Part 107 requires ATC
                  authorization before you fly there (14 CFR 107.41). Where the FAA publishes a UAS Facility Map,
                  we show the exact LAANC ceiling for your grid square.
                </p>
                <p>
                  <strong className="text-[var(--text)]">Restrictions.</strong> Temporary flight restrictions,
                  prohibited and restricted areas, military operations areas and National Park Service land each
                  change the answer. The map draws them the way a sectional chart does, so the picture you see here
                  is the picture you will see on the exam.
                </p>
                <p>
                  <strong className="text-[var(--text)]">Weather.</strong> The nearest METAR gives visibility,
                  cloud ceiling and wind; the TAF and the National Weather Service hourly forecast show whether it
                  will hold. We compare them with the Part 107 minimums and with your drone&apos;s wind limit.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Where the data comes from</h2>
              <ul className="mt-4 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                {SOURCES.map(([what, who]) => (
                  <li key={what} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                    <span>{what}</span>
                    <span className="text-right text-[var(--muted)]">{who}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                All public, free sources, read live. Legal to Fly is not affiliated with the FAA and is not an
                approved LAANC provider.
              </p>
            </div>
          </section>

          <section className="border-t border-[var(--border)] pt-14 mt-14">
            <h2 className="text-2xl font-semibold tracking-tight">Questions pilots ask</h2>
            <div className="mt-6 space-y-3">
              {FAQ.map((f) => (
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

          <section className="mt-14 flex flex-col items-start justify-between gap-5 rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent)]/10 to-transparent p-8 sm:flex-row sm:items-center">
            <div>
              <p className="text-lg font-semibold">Everything on this page is on the Part 107 test.</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Ten questions a day gets you there. Free, no account needed.</p>
            </div>
            <Link href="/drill" className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black hover:brightness-110">
              Start today&apos;s drill
            </Link>
          </section>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto w-full max-w-6xl px-6 text-sm text-[var(--muted)]">
          Legal to Fly is independent study material and is not affiliated with or endorsed by the Federal Aviation
          Administration. This page is a briefing, not an authorization. Always confirm against current regulations
          and NOTAMs.
        </div>
      </footer>
    </div>
  );
}
