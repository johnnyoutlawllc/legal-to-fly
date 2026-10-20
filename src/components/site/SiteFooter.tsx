import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { LEARN, STUDY, TOOLS, type NavItem } from "@/components/site/nav";

const OFFICIAL: { href: string; label: string }[] = [
  { href: "https://faa.psiexams.com", label: "Book the test (PSI)" },
  { href: "https://iacra.faa.gov", label: "IACRA (FTN and certificate)" },
  { href: "https://www.faa.gov/training_testing/testing/supplements/media/sport_rec_private_akts.pdf", label: "FAA testing supplement" },
  { href: "https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-107", label: "14 CFR Part 107" },
  { href: "https://www.faasafety.gov", label: "Recurrent training" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <Logo size="sm" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--muted)]">
              Study for the FAA Part 107 Remote Pilot test with questions mapped to the FAA&apos;s own ACS codes and
              answers that cite the regulation.
            </p>
          </div>
          <Column title="Study" items={STUDY} />
          <Column title="Learn" items={LEARN} />
          <Column title="Tools" items={TOOLS} />
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">The real test</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {OFFICIAL.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[var(--text)]/80 transition-colors hover:text-[var(--accent)]">
                    {l.label} <span className="text-[var(--muted)]">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-xs leading-5 text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl">
            Legal to Fly is independent study material and is not affiliated with or endorsed by the Federal Aviation
            Administration. Always confirm against the current 14 CFR Part 107.
          </p>
          <p className="shrink-0">
            A{" "}
            <a href="https://dataday.studio" className="underline underline-offset-2 hover:text-[var(--text)]">
              DataDay.Studio
            </a>{" "}
            project
          </p>
        </div>
      </div>
    </footer>
  );
}

function Column({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="text-[var(--text)]/80 transition-colors hover:text-[var(--accent)]">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
