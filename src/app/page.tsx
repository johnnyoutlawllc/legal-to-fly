import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { Mark } from "@/components/Mark";
import { FlightPath } from "@/components/FlightPath";

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
            to conquer, progress bars that only go up, badges for the shelf,
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
            Free, no account needed. Ten questions a day is the whole strategy —
            the drill brings back what you miss right before you&apos;d forget it.
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
              p: "Three answer choices, 60 questions, two hours on the mock — the exact shape of the real UAG exam. No four-option questions training the wrong instincts.",
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
