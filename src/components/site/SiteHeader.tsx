"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/site/Logo";
import { LEARN, STUDY, type NavItem } from "@/components/site/nav";
import { IconBook, IconCards, IconChevron, IconCode, IconDrill, IconExam, IconFaa, IconPractice } from "@/components/site/Icons";

const ICONS: Record<string, (p: { className?: string }) => React.ReactNode> = {
  "/drill": IconDrill,
  "/practice": IconPractice,
  "/exam": IconExam,
  "/flashcards": IconCards,
  "/faa-sample": IconFaa,
  "/learn": IconBook,
  "/basics": IconBook,
  "/acs": IconCode,
};

type Menu = "study" | "learn" | null;

export function SiteHeader() {
  const pathname = usePathname();
  const [menu, setMenu] = useState<Menu>(null);
  const [mobile, setMobile] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Close everything on navigation.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(null);
    setMobile(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setMenu(null), setMobile(false));
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setMenu(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const inGroup = (items: NavItem[]) => items.some((i) => active(i.href));

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div ref={wrap} className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 text-sm lg:flex" aria-label="Main">
          <Dropdown label="Study" open={menu === "study"} current={inGroup(STUDY)} onToggle={(o) => setMenu(o ? "study" : null)} items={STUDY} active={active} />
          <Dropdown label="Learn" open={menu === "learn"} current={inGroup(LEARN)} onToggle={(o) => setMenu(o ? "learn" : null)} items={LEARN} active={active} />
          <NavLink href="/results" current={active("/results")}>
            Results
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/can-i-fly-here"
            className={`hidden items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors sm:inline-flex ${
              active("/can-i-fly-here") ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--accent)]/40 bg-[var(--accent)]/10 hover:border-[var(--accent)]"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            Can I fly here?
          </Link>
          <span className="hidden xl:inline-flex">
            <AuthButton />
          </span>
          <Link href="/drill" className="hidden h-9 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-black transition-opacity hover:opacity-90 sm:inline-flex">
            Start studying
          </Link>
          <button
            onClick={() => setMobile((m) => !m)}
            aria-expanded={mobile}
            aria-label={mobile ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] lg:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
              {mobile ? <path d="m5 5 10 10M15 5 5 15" /> : <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />}
            </svg>
          </button>
        </div>
      </div>

      {mobile && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-[var(--border)] bg-[var(--bg)] lg:hidden">
          <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
            <MobileGroup title="Study" items={STUDY} active={active} />
            <MobileGroup title="Learn" items={LEARN} active={active} />
            <MobileGroup
              title="Tools"
              items={[
                { href: "/can-i-fly-here", label: "Can I fly here?", blurb: "Airspace, TFRs and weather for any spot" },
                { href: "/results", label: "Your results", blurb: "Scores and progress over time" },
              ]}
              active={active}
            />
            <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-5">
              <AuthButton />
              <Link href="/drill" className="inline-flex h-9 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-black">
                Start studying
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`rounded-lg px-3 py-2 transition-colors ${current ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}>
      {children}
    </Link>
  );
}

function Dropdown({
  label,
  open,
  current,
  onToggle,
  items,
  active,
}: {
  label: string;
  open: boolean;
  current: boolean;
  onToggle: (open: boolean) => void;
  items: NavItem[];
  active: (href: string) => boolean;
}) {
  return (
    <div className="relative" onMouseEnter={() => onToggle(true)} onMouseLeave={() => onToggle(false)}>
      <button
        onClick={() => onToggle(!open)}
        aria-expanded={open}
        className={`flex items-center gap-1 rounded-lg px-3 py-2 transition-colors ${current || open ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
      >
        {label}
        <IconChevron className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2">
          <div className="w-80 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl shadow-black/60">
            {items.map((item) => {
              const Icon = ICONS[item.href];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--surface-2)] ${active(item.href) ? "bg-[var(--surface-2)]" : ""}`}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/12 text-[var(--accent)]">
                    {Icon && <Icon className="h-[18px] w-[18px]" />}
                  </span>
                  <span>
                    <span className="block font-medium text-[var(--text)]">{item.label}</span>
                    <span className="block text-xs leading-5 text-[var(--muted)]">{item.blurb}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileGroup({ title, items, active }: { title: string; items: NavItem[]; active: (href: string) => boolean }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[var(--muted)]">{title}</p>
      <div className="grid gap-1 sm:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={`rounded-lg px-3 py-2.5 ${active(item.href) ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface)]"}`}>
            <span className="block font-medium">{item.label}</span>
            <span className="block text-xs text-[var(--muted)]">{item.blurb}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
