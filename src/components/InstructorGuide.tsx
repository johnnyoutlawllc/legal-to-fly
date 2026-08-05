"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useInstructor } from "@/lib/instructor";
import {
  instructorById,
  pageTips,
  voiceTip,
  type InstructorId,
} from "@/lib/instructors";
import InstructorAvatar from "./InstructorAvatar";

type Target = {
  el: Element;
  tip: string;
  myth?: string;
};

/** Fixed guide + spotlight for [data-ltf-hl] targets. Falls back to
 *  path-based tips when a page has no marked nodes yet. */

export default function InstructorGuide() {
  const { instructor, ready } = useInstructor();
  const pathname = usePathname();
  const [targets, setTargets] = useState<Target[]>([]);
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [phase, setPhase] = useState<"line" | "correcting">("line");
  const [dismissed, setDismissed] = useState(false);

  const scan = useCallback(() => {
    const nodes = Array.from(document.querySelectorAll("[data-ltf-hl]"));
    if (nodes.length) {
      setTargets(
        nodes.map((el) => ({
          el,
          tip: el.getAttribute("data-ltf-tip") || "Worth a careful look.",
          myth: el.getAttribute("data-ltf-myth") || undefined,
        }))
      );
    } else {
      setTargets(
        pageTips(pathname).map((t) => ({
          el: document.body,
          tip: t.tip,
          myth: t.myth,
        }))
      );
    }
    setIdx(0);
    setPhase("line");
  }, [pathname]);

  useEffect(() => {
    if (!instructor) return;
    setDismissed(false);
    const t = window.setTimeout(scan, 80);
    return () => clearTimeout(t);
  }, [instructor, pathname, scan]);

  useEffect(() => {
    if (!instructor || !targets.length) {
      setRect(null);
      return;
    }
    const target = targets[idx % targets.length];
    const update = () => {
      if (target.el === document.body) {
        setRect(null);
        return;
      }
      setRect(target.el.getBoundingClientRect());
    };
    update();
    target.el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [instructor, targets, idx]);

  // Uncle auto-correct after a beat
  useEffect(() => {
    if (!instructor || instructor !== "uncle" || phase !== "line") return;
    const t = targets[idx % targets.length];
    if (!t?.myth) return;
    const id = window.setTimeout(() => setPhase("correcting"), 3200);
    return () => clearTimeout(id);
  }, [instructor, targets, idx, phase]);

  useEffect(() => {
    if (!instructor) {
      document.body.classList.remove("ltf-has-guide");
      return;
    }
    document.body.classList.add("ltf-has-guide");
    return () => document.body.classList.remove("ltf-has-guide");
  }, [instructor]);

  if (!ready || !instructor || dismissed) return null;

  const meta = instructorById(instructor);
  if (!meta) return null;

  const target = targets[idx % Math.max(targets.length, 1)];
  const voiced = target
    ? voiceTip(instructor, target.tip, target.myth)
    : { line: "…" };
  const line =
    phase === "correcting" && voiced.correcting
      ? `Alright, alright. ${voiced.correcting}`
      : voiced.line;

  const next = () => {
    setPhase("line");
    setIdx((i) => i + 1);
  };

  return (
    <>
      {rect && rect.width > 0 && (
        <div
          className="ltf-hl-ring pointer-events-none fixed z-[45] rounded-xl border-2"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            borderColor: meta.accent,
            boxShadow: `0 0 24px ${meta.accent}55`,
          }}
        />
      )}

      <div className="fixed bottom-4 left-4 z-50 flex max-w-[min(100vw-2rem,22rem)] items-end gap-3">
        <button
          type="button"
          onClick={next}
          className="shrink-0 rounded-[18px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          title="Next tip"
          aria-label={`${meta.name}: next tip`}
        >
          <InstructorAvatar id={instructor} className="h-16 w-16 drop-shadow-lg" />
        </button>
        <div className="relative mb-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-3.5 py-2.5 shadow-lg shadow-black/40 backdrop-blur">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: meta.accent }}>
              {meta.name}
            </p>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)]"
              title="Hide guide on this page"
            >
              Hide
            </button>
          </div>
          <p className="mt-1 text-sm leading-5 text-[var(--text)]">
            {instructor === "cat" ? <CatGesture id={instructor} /> : line}
          </p>
          {instructor === "uncle" && phase === "line" && target?.myth && (
            <button
              type="button"
              onClick={() => setPhase("correcting")}
              className="mt-2 text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Challenge uncle
            </button>
          )}
          <button
            type="button"
            onClick={next}
            className="mt-2 text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)]"
          >
            Next tip · {targets.length ? (idx % targets.length) + 1 : 1}/{Math.max(targets.length, 1)}
          </button>
        </div>
      </div>
    </>
  );
}

function CatGesture({ id }: { id: InstructorId }) {
  void id;
  return (
    <span className="inline-flex items-center gap-2 text-[var(--muted)]">
      <span className="ltf-cat-paw">🐾</span>
      <span>points with a paw. Tap the glowing bit.</span>
    </span>
  );
}
