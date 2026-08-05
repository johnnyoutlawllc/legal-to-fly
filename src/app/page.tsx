import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { Mark } from "@/components/Mark";
import { FlightPath } from "@/components/FlightPath";

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
        In person at a PSI testing center. Book a seat for the Unmanned
        Aircraft General (UAG) exam at{" "}
        <Ext href="https://faa.psiexams.com">faa.psiexams.com</Ext>. It costs
        $175, and you bring a government photo ID. Many centers have seats
        within a week or two.
      </>
    ),
  },
  {
    q: "What do I need before I can book?",
    a: (
      <>
        An FAA Tracking Number (FTN). Create a free account at{" "}
        <Ext href="https://iacra.faa.gov">iacra.faa.gov</Ext> and it assigns
        you one in a few minutes. PSI asks for it when you register.
      </>
    ),
  },
  {
    q: "What score do I need?",
    a: (
      <>
        70%, which is 42 of 60 questions. Unanswered questions count as wrong,
        so answer everything. Our mock exam scores exactly the same way.
      </>
    ),
  },
  {
    q: "What happens after I pass?",
    a: (
      <>
        Apply for the certificate on{" "}
        <Ext href="https://iacra.faa.gov">IACRA</Ext> using FAA Form 8710-13.
        TSA runs a background check, a temporary certificate arrives by email
        usually within a couple of weeks, and the permanent card comes in the
        mail. You can fly paid work on the temporary one.
      </>
    ),
  },
  {
    q: "What if I fail?",
    a: (
      <>
        You wait 14 calendar days and pay the fee again. The FAA hands you a
        report listing the ACS codes you missed, and every question on this
        site carries those same codes, so you can study exactly what got you.
      </>
    ),
  },
  {
    q: "I only fly for fun. Do I still need this?",
    a: (
      <>
        No. Purely recreational flying needs the free online{" "}
        <Ext href="https://www.faa.gov/uas/recreational_flyers">TRUST test</Ext>{" "}
        instead. But the moment a flight benefits a business, yours or anyone
        else&apos;s, even unpaid, you are under Part 107 and need the
        certificate.
      </>
    ),
  },
  {
    q: "Do I have to register my drone?",
    a: (
      <>
        Yes. Under Part 107 every aircraft is registered, regardless of
        weight. It is $5 for three years at{" "}
        <Ext href="https://faadronezone-access.faa.gov">FAA DroneZone</Ext>,
        and the registration number goes on the outside of the aircraft.
      </>
    ),
  },
  {
    q: "Does the certificate expire?",
    a: (
      <>
        The card itself never expires, but you must complete free online
        recurrent training every 24 calendar months at{" "}
        <Ext href="https://www.faasafety.gov">faasafety.gov</Ext> to keep
        flying under it.
      </>
    ),
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
          <span className="flex items-center gap-2.5">
            <Mark className="h-9 w-9" />
            <span className="text-lg font-semibold tracking-tight">
              Legal<span className="text-[var(--accent)]">to</span>Fly
            </span>
          </span>
          <span className="flex items-center gap-3">
            <AuthButton />
            <Link
              href="/drill"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Today&apos;s drill
            </Link>
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        <section className="py-20 sm:py-24">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
            FAA Part 107 · Remote Pilot Certificate
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            You already know how to fly. Now make it official.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            The Part 107 test is the only thing between your drone and getting
            paid to fly it. We turned studying for it into a game: five areas
            to clear, progress bars that only go up, badges for the shelf,
            and a daily ten-question drill that does the remembering for you.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/drill"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
            >
              Start today&apos;s drill
            </Link>
            <Link
              href="/learn"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface)]"
            >
              Read the ground school
            </Link>
            <Link
              href="#path"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface)]"
            >
              See your flight path
            </Link>
            <Link
              href="/exam"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface)]"
            >
              Take a mock exam
            </Link>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Free, no account needed. Ten questions a day is the whole strategy.
            The drill brings back what you miss right before you&apos;d forget it.
          </p>
        </section>

        <FlightPath />

        <section
          id="how"
          className="grid gap-5 border-t border-[var(--border)] py-16 sm:grid-cols-3"
        >
          {[
            {
              h: "The real test, not a lookalike",
              p: "Three answer choices, 60 questions, two hours on the mock. That is the exact shape of the real UAG exam. No four-option questions training the wrong instincts.",
            },
            {
              h: "Every answer shows its receipts",
              p: "Miss one and you get the why, the rule it comes from (14 CFR 107.51(b), not 'some forum said 400 feet'), and the FAA's own ACS code for the topic.",
            },
            {
              h: "Weak spots in the FAA's language",
              p: "Fail the real test and the FAA hands you a report of ACS codes. Our mock exam hands you the same list first, so nothing on test day is a surprise.",
            },
          ].map((c) => (
            <div
              key={c.h}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <h3 className="font-semibold leading-snug">{c.h}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{c.p}</p>
            </div>
          ))}
        </section>

        <section id="faq" className="border-t border-[var(--border)] py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Taking the real thing
          </h2>
          <p className="mt-2 text-[var(--muted)]">
            Straight answers about the actual test, with the links you need to
            book it.
          </p>
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
              >
                <summary className="cursor-pointer list-none font-medium marker:content-none">
                  <span className="mr-3 inline-block text-[var(--accent)] transition-transform group-open:rotate-90">
                    ›
                  </span>
                  {f.q}
                </summary>
                <div className="mt-3 pl-6 text-sm leading-6 text-[var(--muted)]">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto w-full max-w-5xl px-6 text-sm text-[var(--muted)]">
          Legal to Fly is independent study material and is not affiliated with
          or endorsed by the Federal Aviation Administration. Always confirm
          against the current 14 CFR Part 107.
        </div>
      </footer>
    </div>
  );
}
