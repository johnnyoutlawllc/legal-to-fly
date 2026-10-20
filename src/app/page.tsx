import Link from "next/link";
import { FlightPath } from "@/components/FlightPath";
import { HeroShowcase } from "@/components/site/HeroShowcase";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  IconArrow,
  IconBook,
  IconCards,
  IconCite,
  IconCode,
  IconDrill,
  IconExam,
  IconFaa,
  IconMap,
  IconPractice,
  IconTarget,
} from "@/components/site/Icons";

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-2 hover:decoration-[var(--accent)]"
    >
      {children}
    </a>
  );
}

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "Where do I actually take the test?",
    a: (
      <>
        In person at a PSI testing center. Book a seat for the Unmanned Aircraft General (UAG) exam at{" "}
        <Ext href="https://faa.psiexams.com">faa.psiexams.com</Ext>. It costs $175, and you bring a government photo
        ID. Many centers have seats within a week or two.
      </>
    ),
  },
  {
    q: "What do I need before I can book?",
    a: (
      <>
        An FAA Tracking Number (FTN). Create a free account at <Ext href="https://iacra.faa.gov">iacra.faa.gov</Ext>{" "}
        and it assigns you one in a few minutes. PSI asks for it when you register.
      </>
    ),
  },
  {
    q: "What score do I need?",
    a: (
      <>
        70%, which is 42 of 60 questions. Unanswered questions count as wrong, so answer everything. Our mock exam
        scores exactly the same way.
      </>
    ),
  },
  {
    q: "What happens after I pass?",
    a: (
      <>
        Apply for the certificate on <Ext href="https://iacra.faa.gov">IACRA</Ext> using FAA Form 8710-13. TSA runs a
        background check, a temporary certificate arrives by email usually within a couple of weeks, and the permanent
        card comes in the mail. You can fly paid work on the temporary one.
      </>
    ),
  },
  {
    q: "What if I fail?",
    a: (
      <>
        You wait 14 calendar days and pay the fee again. The FAA hands you a report listing the ACS codes you missed,
        and every question on this site carries those same codes.
      </>
    ),
  },
  {
    q: "I only fly for fun. Do I still need this?",
    a: (
      <>
        No. Purely recreational flying needs the free online{" "}
        <Ext href="https://www.faa.gov/uas/recreational_flyers">TRUST test</Ext> instead. But the moment a flight
        benefits a business, yours or anyone else&apos;s, even unpaid, you are under Part 107 and need the
        certificate.
      </>
    ),
  },
  {
    q: "Do I have to register my drone?",
    a: (
      <>
        Yes. Under Part 107 every aircraft is registered, regardless of weight. It is $5 for three years at{" "}
        <Ext href="https://faadronezone-access.faa.gov">FAA DroneZone</Ext>, and the registration number goes on the
        outside of the aircraft.
      </>
    ),
  },
  {
    q: "Does the certificate expire?",
    a: (
      <>
        The card itself never expires, but you must complete free online recurrent training every 24 calendar months
        at <Ext href="https://www.faasafety.gov">faasafety.gov</Ext> to keep flying under it.
      </>
    ),
  },
];

type Tool = {
  href: string;
  icon: (p: { className?: string }) => React.ReactNode;
  title: string;
  body: string;
  tags: string[];
};

const TOOLS: Tool[] = [
  {
    href: "/drill",
    icon: IconDrill,
    title: "Daily drill",
    body: "Ten questions a day. Missed questions come back on a spaced-repetition schedule.",
    tags: ["Spaced repetition", "Day streaks"],
  },
  {
    href: "/exam",
    icon: IconExam,
    title: "Mock exam",
    body: "Sixty questions, two hours, seventy percent to pass, weighted like the real test. Review ends with the ACS codes you missed.",
    tags: ["Timed", "Flag for review", "ACS report"],
  },
  {
    href: "/flashcards",
    icon: IconCards,
    title: "Flash cards",
    body: "Set the question and answer timers and let the cards run, or flip them yourself.",
    tags: ["Auto or manual", "5 to 30s timers", "Eliminate mode"],
  },
  {
    href: "/faa-sample",
    icon: IconFaa,
    title: "FAA Sample Questions",
    body: "The FAA's own published questions, worded exactly as written, with the chart figures and an explanation for every answer.",
    tags: ["Official wording", "Chart figures", "Answer key checked"],
  },
  {
    href: "/practice",
    icon: IconPractice,
    title: "Practice questions",
    body: "Twenty at a time with instant feedback, the reason each wrong answer is wrong, and a score by area at the end.",
    tags: ["Instant feedback", "Standard or Difficult"],
  },
  {
    href: "/learn",
    icon: IconBook,
    title: "Ground school",
    body: "Short lessons for every area of the test, from airspace and weather to loading, Remote ID and night operations.",
    tags: ["All five areas", "Eleven lessons"],
  },
];

const PLAN: { step: string; title: string; body: string; href: string; cta: string }[] = [
  { step: "1", title: "Learn the rules", body: "Read the ground school once through. An evening or two.", href: "/learn", cta: "Ground school" },
  { step: "2", title: "Drill every day", body: "Ten questions a day until test day.", href: "/drill", cta: "Today's drill" },
  { step: "3", title: "Work the charts", body: "Sectional chart and METAR questions.", href: "/faa-sample", cta: "FAA questions" },
  { step: "4", title: "Pass the mock", body: "Score 85% or better on the mock exam twice in a row.", href: "/exam", cta: "Mock exam" },
  { step: "5", title: "Book the test", body: "Get your FTN on IACRA, then book a seat at a PSI testing center.", href: "https://faa.psiexams.com", cta: "PSI" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="fc-grid pointer-events-none absolute inset-0" />
          <div aria-hidden className="fc-glow pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2" />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--correct)]" />
                FAA Part 107 · Remote Pilot Certificate
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                You already know how to fly.{" "}
                <span className="fc-gradient-text">Now make it official.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
                Everything you need to pass the Part 107 knowledge test: a daily drill, timed mock exams, flash cards
                and the FAA&apos;s own sample questions, all mapped to the codes the FAA prints on your test report.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/drill"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 font-semibold text-black transition-opacity hover:opacity-90"
                >
                  Start today&apos;s drill <IconArrow />
                </Link>
                <Link
                  href="/exam"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 font-medium transition-colors hover:border-[var(--muted)]"
                >
                  Take a mock exam
                </Link>
              </div>
              <p className="mt-5 text-sm text-[var(--muted)]">Free. No account needed. Sign in only to sync across devices.</p>
            </div>

            <HeroShowcase />
          </div>
        </section>

        {/* Study tools */}
        <section id="tools" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <SectionHead eyebrow="Study tools" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <ToolCard key={t.href} tool={t} />
            ))}
          </div>

          <Link
            href="/can-i-fly-here"
            className="group mt-4 flex flex-col gap-5 overflow-hidden rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/12 via-[var(--surface)] to-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)]/70 sm:flex-row sm:items-center sm:p-8"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-black">
              <IconMap className="h-6 w-6" />
            </span>
            <span className="flex-1">
              <span className="block text-xs font-medium uppercase tracking-widest text-[var(--accent)]">After you pass</span>
              <span className="mt-1 block text-xl font-semibold">Can I fly here?</span>
              <span className="mt-1 block max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Type an address and get one briefing: FAA airspace and LAANC ceilings, TFRs, nearby airports, the
                nearest METAR and TAF decoded, wind, daylight and Kp.
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)]">
              Check a location <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>

        {/* What makes it different */}
        <section className="border-t border-[var(--border)] bg-[var(--surface)]/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <SectionHead eyebrow="Every question" />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Feature
                icon={IconCode}
                title="ACS code"
                body="The same code the FAA prints on your test report for any question you miss."
                sample="UA.II.A.K1b"
              />
              <Feature
                icon={IconCite}
                title="Citation"
                body="The regulation or handbook section the answer comes from."
                sample="14 CFR 107.41"
              />
              <Feature
                icon={IconTarget}
                title="Three choices"
                body="Three answer choices, same as the real test. Chart questions use the figures from the FAA testing supplement."
                sample="FAA-CT-8080-2H"
              />
            </div>
          </div>
        </section>

        {/* Study plan */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <SectionHead eyebrow="Study plan" />
          <ol className="mt-6 grid gap-4 md:grid-cols-5">
            {PLAN.map((p) => {
              const external = p.href.startsWith("http");
              const cls =
                "inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline underline-offset-4";
              return (
                <li key={p.step} className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent)]/50 font-mono text-sm text-[var(--accent)]">
                    {p.step}
                  </span>
                  <h3 className="mt-4 font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">{p.body}</p>
                  <p className="mt-4">
                    {external ? (
                      <a href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>
                        {p.cta} ↗
                      </a>
                    ) : (
                      <Link href={p.href} className={cls}>
                        {p.cta} <IconArrow className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <FlightPath />
        </div>

        {/* FAQ */}
        <section id="faq" className="border-t border-[var(--border)]">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">FAQ</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Taking the test</h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">
                Where to book it, what it costs, what to bring, and what happens after.
              </p>
            </div>
            <div className="space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 open:border-[var(--muted)]/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none">
                    {f.q}
                    <span className="text-lg leading-none text-[var(--accent)] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="mt-3 text-sm leading-6 text-[var(--muted)]">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center sm:px-12">
            <div aria-hidden className="fc-glow pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Start today&apos;s drill</h2>
              <p className="mx-auto mt-4 max-w-xl leading-7 text-[var(--muted)]">
                Ten questions, about five minutes. No sign-up.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/drill" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 font-semibold text-black hover:opacity-90">
                  Start today&apos;s drill <IconArrow />
                </Link>
                <Link href="/flashcards" className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-6 font-medium hover:bg-[var(--surface-2)]">
                  Try the flash cards
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionHead({ eyebrow, title, body }: { eyebrow: string; title?: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">{eyebrow}</p>
      {title && <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>}
      {body && <p className="mt-4 text-lg leading-8 text-[var(--muted)]">{body}</p>}
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.href}
      className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:shadow-[0_18px_50px_-24px_rgba(255,107,53,0.45)]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)]/12 text-[var(--accent)]">
        <Icon className="h-[22px] w-[22px]" />
      </span>
      <h3 className="mt-5 text-lg font-semibold">{tool.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{tool.body}</p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {tool.tags.map((t) => (
          <span key={t} className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
            {t}
          </span>
        ))}
      </div>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)]">
        Open <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
  sample,
}: {
  icon: (p: { className?: string }) => React.ReactNode;
  title: string;
  body: string;
  sample: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
      <Icon className="h-6 w-6 text-[var(--accent)]" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
      <span className="mt-5 inline-block rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono text-xs text-[var(--accent)]">
        {sample}
      </span>
    </div>
  );
}
