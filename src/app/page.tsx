import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { Mark } from "@/components/Mark";

const AREAS = [
  { code: "I", title: "Regulations", weight: "15–25%" },
  { code: "II", title: "Airspace & Operating Requirements", weight: "15–25%" },
  { code: "III", title: "Weather", weight: "11–16%" },
  { code: "IV", title: "Loading & Performance", weight: "7–11%" },
  { code: "V", title: "Operations", weight: "35–45%" },
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
              href="/practice"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Start practicing
            </Link>
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        <section className="py-20 sm:py-28">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
            FAA Part 107 · Remote Pilot
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Stop worrying about the rules. Start charging for the footage.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            The Part 107 knowledge test is 60 questions, two hours, and 70% to
            pass. It is not hard. It is just unfamiliar. We drill you on the
            parts that actually get asked, and we tell you exactly which rule
            you got wrong and why.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/drill"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
            >
              Do today&apos;s drill
            </Link>
            <Link
              href="/practice"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface)]"
            >
              Start practicing free
            </Link>
            <Link
              href="/exam"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface)]"
            >
              Take a timed mock exam
            </Link>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            The daily drill is ten questions in five minutes. It remembers what
            you miss and brings it back right before you&apos;d forget it, so
            showing up every day is the whole strategy.
          </p>
        </section>

        <section
          id="how"
          className="grid gap-5 border-t border-[var(--border)] py-16 sm:grid-cols-3"
        >
          {[
            {
              h: "Written from the regulation, not a forum post",
              p: "Every answer cites the section it comes from — 14 CFR 107.51(b), not 'I think it's 400 feet.' When the FAA amends a rule, the citation is how we find what to fix.",
            },
            {
              h: "Mapped to the FAA's own ACS codes",
              p: "Fail the real test and the FAA hands you a report listing codes like UA.I.B.K21b. Every question here carries that same code, so your weak spots are already in the format the FAA speaks.",
            },
            {
              h: "Three choices, and a clock that doesn't stop",
              p: "The actual UAG exam gives three options, not four, and the mock runs the real 60 questions in two hours. Practising against four-option questions with no timer trains the wrong instincts.",
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

        <section className="border-t border-[var(--border)] py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            What the test covers
          </h2>
          <p className="mt-2 text-[var(--muted)]">
            Five areas of operation, weighted exactly as the FAA weights them.
          </p>
          <ul className="mt-8 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
            {AREAS.map((a) => (
              <li
                key={a.code}
                className="flex items-center justify-between bg-[var(--surface)] px-5 py-4"
              >
                <span className="flex items-center gap-4">
                  <span className="w-8 font-mono text-sm text-[var(--accent)]">
                    {a.code}
                  </span>
                  <span className="font-medium">{a.title}</span>
                </span>
                <span className="text-sm text-[var(--muted)]">{a.weight}</span>
              </li>
            ))}
          </ul>
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
