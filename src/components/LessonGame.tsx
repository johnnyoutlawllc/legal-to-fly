"use client";

import { useLearningStyle } from "@/lib/style";
import DroneGame, { GameVariant } from "./DroneGame";

/** Renders a lesson mini-game, but only in playful mode — serious readers
 *  never see it. Referenced from lesson bodies with `::game <name> | intro`. */

const GAMES: Record<string, GameVariant> = {
  "zone-dodger": "zones",
  "storm-chaser": "storms",
};

export default function LessonGame({ name, intro }: { name: string; intro?: string }) {
  const { style } = useLearningStyle();
  const variant = GAMES[name];
  if (style !== "playful" || !variant) return null;
  return (
    <div className="rounded-xl border border-[var(--accent)]/40 bg-[var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
        🎮 Mini game
      </p>
      {intro && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{intro}</p>}
      <div className="mt-4">
        <DroneGame variant={variant} />
      </div>
    </div>
  );
}
