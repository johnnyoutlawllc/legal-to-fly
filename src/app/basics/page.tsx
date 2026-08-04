"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  BADGES,
  type BadgeDef,
  basicsRead,
  claimNewBadges,
  markBasicsRead,
} from "@/lib/badges";
import { BadgeIcon, NewBadges } from "@/components/Badges";

/** The reading unit at the head of the trail: what the certificate is, why a
 *  hobbyist needs one, and the actual mechanics of getting it. Finish the
 *  read, claim the 107 Basics badge. Facts here are the stable ones (fees,
 *  ages, pass mark); the FAQ on the home page carries the booking links. */

type PoolRow = { slug: string; acs_element_code: string };

const basicsBadge = BADGES.find((b) => b.id === "basics")!;

export default function BasicsPage() {
  const [pool, setPool] = useState<PoolRow[]>([]);
  const [read, setRead] = useState(false);
  const [newBadges, setNewBadges] = useState<BadgeDef[]>([]);

  useEffect(() => {
    setRead(basicsRead());
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("questions")
        .select("slug, acs_element_code")
        .eq("is_active", true);
      if (!cancelled && data) setPool(data as PoolRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const claim = () => {
    markBasicsRead();
    setRead(true);
    setNewBadges(claimNewBadges(pool));
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Legal<span className="text-[var(--accent)]">to</span>Fly
          </Link>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            Exit
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="flex items-center gap-4">
          <BadgeIcon badge={basicsBadge} earned={read} className="h-14 w-14" />
          <div>
            <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
              Start here
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">107 Basics</h1>
          </div>
        </div>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          Five minutes of reading before the first question. What the
          certificate is, why your drone hobby needs it, and exactly what
          getting it involves.
        </p>

        <div className="mt-10 space-y-8">
          <Section title="What Part 107 is">
            <p>
              Part 107 is the section of the federal aviation regulations (14
              CFR Part 107) that covers small drones, meaning anything under 55
              pounds. The Remote Pilot Certificate, which everyone calls the
              Part 107, is the FAA saying you know those rules well enough to
              fly for money.
            </p>
          </Section>

          <Section title="Why you need one">
            <p>
              The line is simple: flying purely for fun is recreational, and
              anything else is not. The moment a flight helps a business, yours
              or anyone else&apos;s, you need the certificate. Selling photos,
              shooting a roof for a realtor, inspecting a cell tower, posting
              monetized footage. Even flying for free counts if the footage
              benefits a business.
            </p>
            <p className="mt-3">
              Fly without it where it&apos;s required and the FAA can fine you
              per flight. With it, you are the legal option that clients can
              actually hire, and most real gigs (and their insurers) will ask
              to see the card.
            </p>
          </Section>

          <Section title="What you need to qualify">
            <ul className="list-disc space-y-2 pl-5">
              <li>Be at least 16 to hold the certificate (you can sit the test at 14).</li>
              <li>Read, write, speak, and understand English.</li>
              <li>Be in a physical and mental condition to fly a drone safely.</li>
              <li>
                Pass the Unmanned Aircraft General knowledge test: 60 questions,
                2 hours, 70% to pass, taken in person at a PSI testing center
                for $175.
              </li>
            </ul>
            <p className="mt-3">
              No flight hours, no checkride, no medical certificate. The
              written test is the whole gate, which is why studying works.
            </p>
          </Section>

          <Section title="How getting it actually goes">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Get an FAA Tracking Number (FTN) by creating an account on
                IACRA, the FAA&apos;s application site.
              </li>
              <li>Book the test at a PSI testing center near you and pay the $175.</li>
              <li>Pass with 70% or better. Fail and you wait 14 days to retake (and pay again).</li>
              <li>
                Apply for the certificate on IACRA with FAA Form 8710-13. TSA
                runs a background check, you get a temporary certificate by
                email, and the plastic card shows up in the mail.
              </li>
              <li>
                Register your drone for $5 on FAA DroneZone and label it with
                the registration number. Under Part 107 every aircraft gets
                registered, even the tiny ones.
              </li>
            </ol>
            <p className="mt-3">
              The certificate never expires, but you retake a free online
              recurrent training every 24 calendar months to keep it current.
            </p>
          </Section>

          <Section title="What the test covers">
            <p>
              Five areas of operation, and that is exactly how this site is
              organized: Regulations, Airspace, Weather, Loading and
              Performance, and Operations. The flight path on the home page
              tracks your mastery of each one, and the mock exam mirrors the
              real thing question for question in format.
            </p>
          </Section>
        </div>

        <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          {read ? (
            <p className="font-medium text-[var(--accent)]">
              107 Basics badge earned. That is the easy one done.
            </p>
          ) : (
            <p className="font-medium">Read it all? Then this one is free.</p>
          )}
          <NewBadges badges={newBadges} />
          <div className="mt-5 flex flex-wrap gap-3">
            {!read && (
              <button
                onClick={claim}
                className="h-11 rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
              >
                Claim the badge
              </button>
            )}
            <Link
              href="/#path"
              className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface-2)]"
            >
              Back to your flight path
            </Link>
            <Link
              href="/drill"
              className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-6 font-medium transition-colors hover:bg-[var(--surface-2)]"
            >
              Start today&apos;s drill
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-[var(--muted)]">{children}</div>
    </section>
  );
}
