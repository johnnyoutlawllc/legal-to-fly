import type { Metadata } from "next";
import Link from "next/link";
import {
  ACS_GUIDES,
  ACS_SOURCE,
  ACS_SOURCE_UPDATED,
  ACS_STANDARDS,
  ACS_TOP_TASKS,
  standardUrl,
} from "@/content/acs-resources";

export const metadata: Metadata = {
  title: "FAA Airman Certification Standards | Legal to Fly",
  description:
    "The FAA Airman Certification Standards index: official standards, companion guides, publication dates, effective status, and testing links.",
};

function FaaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-4 hover:decoration-[var(--accent)]"
    >
      {children}
      <span className="sr-only"> (opens on an external site)</span>
    </a>
  );
}

export default function AcsPage() {
  const remotePilot = ACS_STANDARDS.find((item) => item.file === "uas_acs.pdf")!;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Legal<span className="text-[var(--accent)]">to</span>Fly
          </Link>
          <Link href="/learn" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            Ground school
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:py-14">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
          Official FAA resources
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Airman Certification Standards
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
          The complete document list from the FAA&apos;s ACS index, with direct
          links to the official files. This page reflects the FAA index last
          updated {ACS_SOURCE_UPDATED}; check the{" "}
          <FaaLink href={ACS_SOURCE}>FAA source page</FaaLink> for later changes.
        </p>

        <section className="mt-10 rounded-xl border border-[var(--accent)]/50 bg-[var(--surface)] p-6">
          <p className="text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
            For this site&apos;s Part 107 course
          </p>
          <h2 className="mt-2 text-xl font-semibold">Remote Pilot — Small UAS</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            FAA-S-ACS-10B is the official standard behind the ACS codes in your
            study questions and knowledge test report. Published {remotePilot.published}; {remotePilot.status.toLowerCase()}.
          </p>
          <p className="mt-4">
            <FaaLink href={standardUrl(remotePilot.file)}>Open the FAA Remote Pilot ACS (PDF)</FaaLink>
          </p>
        </section>

        <section className="mt-14" aria-labelledby="guides-heading">
          <h2 id="guides-heading" className="text-2xl font-semibold tracking-tight">
            Briefing and companion documents
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {ACS_GUIDES.map((guide) => (
              <li key={guide.url} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 leading-6">
                <FaaLink href={guide.url}>{guide.title}</FaaLink>
                <span className="ml-2 text-xs text-[var(--muted)]">PDF</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="standards-heading">
          <h2 id="standards-heading" className="text-2xl font-semibold tracking-tight">
            ACS list
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            All {ACS_STANDARDS.length} entries are shown in the same order as the FAA index.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
                <tr>
                  <th scope="col" className="w-1/2 px-4 py-3 font-semibold">Title</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Publication date</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Change date</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {ACS_STANDARDS.map((item) => (
                  <tr key={item.file} className="border-t border-[var(--border)] align-top">
                    <th scope="row" className="px-4 py-4 font-normal leading-6">
                      <FaaLink href={standardUrl(item.file)}>{item.title}</FaaLink>
                    </th>
                    <td className="whitespace-nowrap px-4 py-4 text-[var(--muted)]">{item.published}</td>
                    <td className="px-4 py-4 text-[var(--muted)]">{item.change}</td>
                    <td className="min-w-40 px-4 py-4 text-[var(--muted)]">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14 border-t border-[var(--border)] pt-10" aria-labelledby="tasks-heading">
          <h2 id="tasks-heading" className="text-2xl font-semibold tracking-tight">FAA top tasks</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {ACS_TOP_TASKS.map((task) => (
              <li key={task.url} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <FaaLink href={task.url}>{task.title}</FaaLink>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
