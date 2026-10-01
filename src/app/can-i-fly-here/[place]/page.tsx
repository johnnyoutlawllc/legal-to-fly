import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlyCheck } from "@/components/flycheck/FlyCheck";
import { Faq, FlyFooter, FlyHeader, HowItWorks, PlacesGrid } from "@/components/flycheck/PageBits";
import { placeBySlug, placeLabel } from "@/content/places";
import { buildReport } from "@/lib/flycheck/report";
import { summarize } from "@/lib/flycheck/summary";
import { compass } from "@/lib/flycheck/geo";

/** "Can I fly a drone in Rockwall, TX?" — one page per place. The answer and
 *  facts are rendered on the server from live FAA data so search engines and
 *  AI answer engines can read them; the live check below re-runs in the
 *  browser for up-to-the-minute TFRs and weather.
 *
 *  Rendered on first visit and refreshed every half hour, never at build:
 *  building ~30 pages at once would spend the FAA's shared ArcGIS quota. */

export const dynamic = "force-static";
export const revalidate = 1800;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/can-i-fly-here/[place]">): Promise<Metadata> {
  const p = placeBySlug((await params).place);
  if (!p) return {};
  const title = `Can I Fly a Drone in ${placeLabel(p)}? Airspace, No-Fly Zones & Rules`;
  const description = `Drone rules for ${p.name}, ${p.stateName}: FAA airspace, LAANC limits, nearby airports, no-fly zones and temporary flight restrictions, plus a free live check for any address.`;
  return {
    title: `${title} | Legal to Fly`,
    description,
    alternates: { canonical: `/can-i-fly-here/${p.slug}` },
    openGraph: { title, description, url: `/can-i-fly-here/${p.slug}`, siteName: "Legal to Fly", type: "article" },
  };
}

const TONE = {
  yes: { color: "#34d399", word: "Yes" },
  "with-authorization": { color: "#fbbf24", word: "With authorization" },
  no: { color: "#f87171", word: "Not without permission" },
  "not-now": { color: "#fbbf24", word: "Not right now" },
  unverified: { color: "#9a9a9a", word: "Check live" },
} as const;

export default async function PlacePage({ params }: PageProps<"/can-i-fly-here/[place]">) {
  const p = placeBySlug((await params).place);
  if (!p) notFound();
  const where = placeLabel(p);

  const report = await buildReport(p.lat, p.lng);
  const s = summarize(report, where);
  const tone = TONE[s.answer];
  const asOf = new Date(report.generatedAt).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const airports = report.airports.data ?? [];

  const faq = [
    { q: `Can I fly a drone in ${where}?`, a: s.short },
    {
      q: `Do I need LAANC authorization to fly a drone in ${p.name}?`,
      a: report.airspace.data?.grid
        ? `In central ${p.name}, yes: it is inside an FAA UAS Facility Map grid with a ${report.airspace.data.grid.ceilingFt} ft ceiling, so you need LAANC or DroneZone authorization. Other parts of the city may differ; check the exact address above.`
        : report.airspace.data
          ? `Not in central ${p.name}, which is Class G airspace. Parts of the city closer to an airport may be controlled; check the exact address above.`
          : `Check the exact address with the live tool above; the FAA data did not load when this page was built.`,
    },
    {
      q: `Are there airports or heliports near ${p.name}?`,
      a: airports.length
        ? `Within 5 NM of the city center: ${airports.slice(0, 5).map((a) => `${a.name} (${a.typeLabel.toLowerCase()}, ${a.distanceNm} NM ${compass(a.bearing)})`).join("; ")}.`
        : `None within 5 NM of the city center.`,
    },
    {
      q: `Do I need a license to fly a drone in ${p.stateName}?`,
      a: `For fun, you need the free FAA TRUST certificate and to register drones over 250 g. For any business use, you need an FAA Part 107 Remote Pilot Certificate. Local parks may add their own rules.`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Can I fly here?", item: "https://legaltofly.com/can-i-fly-here" },
        { "@type": "ListItem", position: 2, name: where, item: `https://legaltofly.com/can-i-fly-here/${p.slug}` },
      ],
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FlyHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="fc-grid pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-6xl px-6 pb-8 pt-12 sm:pt-16">
            <nav className="text-xs text-[var(--muted)]">
              <Link href="/can-i-fly-here" className="hover:text-[var(--text)]">Can I fly here?</Link> / {where}
            </nav>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Can I fly a drone in <span className="fc-gradient-text">{where}?</span>
            </h1>

            <div
              className="mt-8 max-w-4xl rounded-2xl border p-6"
              style={{ borderColor: `${tone.color}55`, background: `linear-gradient(135deg, ${tone.color}14, transparent 60%)` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: tone.color }}>
                Short answer · {tone.word}
              </p>
              <p className="mt-3 text-lg leading-8">{s.short}</p>
              <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                {s.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{f.label}</dt>
                    <dd className="mt-0.5">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-xs text-[var(--muted)]">
                For the center of {p.name}, from FAA data as of {asOf}. Airspace changes block by block; check your exact
                address below, and check for temporary flight restrictions before every flight.
              </p>
            </div>

            <h2 className="mt-12 text-xl font-semibold tracking-tight">Check an exact address in {p.name}</h2>
          </div>
        </section>

        <FlyCheck hero={false} initial={{ lat: p.lat, lng: p.lng, label: where }} />

        <div className="mx-auto max-w-6xl px-6 pb-16">
          <Faq items={faq} />
          <div className="mt-12">
            <PlacesGrid exclude={p.slug} />
          </div>
          <HowItWorks />
        </div>
      </main>
      <FlyFooter />
    </div>
  );
}
