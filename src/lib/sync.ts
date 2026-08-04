import { supabase } from "@/lib/supabase";
import { type Question } from "@/lib/types";
import {
  type SrsItem,
  type SrsMap,
  type Streak,
  addDays,
  loadStreak,
  saveStreak,
  today,
} from "@/lib/srs";

/*
 * The drill's schedule lives in localStorage (keyed by slug) and, once the
 * user signs in, in `ltf.srs_state` (keyed by question UUID). The loaded
 * question pool is the map between the two. RLS scopes every query to the
 * signed-in user, so no user_id filters are needed on reads.
 *
 * Merge rule when both sides know a question: the later due date wins. A
 * review always pushes `due` forward from the review date, so the side with
 * the later due date is the side that reviewed more recently.
 */

type RemoteRow = {
  question_id: string;
  ease: number;
  interval_days: number;
  repetitions: number;
  due_at: string;
};

export async function pullAndMergeSrs(local: SrsMap, pool: Question[]): Promise<SrsMap> {
  const { data, error } = await supabase
    .from("srs_state")
    .select("question_id, ease, interval_days, repetitions, due_at");
  if (error || !data) return local;

  const slugById = new Map(pool.map((q) => [q.id, q.slug]));
  const merged: SrsMap = { ...local };

  for (const row of data as RemoteRow[]) {
    const slug = slugById.get(row.question_id);
    if (!slug) continue;
    const remote: SrsItem = {
      ease: Number(row.ease),
      interval: row.interval_days,
      reps: row.repetitions,
      due: row.due_at.slice(0, 10),
      // seen/lapses are local-only colour; approximate when adopting.
      seen: local[slug]?.seen ?? Math.max(1, row.repetitions),
      lapses: local[slug]?.lapses ?? 0,
    };
    const mine = merged[slug];
    if (!mine || remote.due > mine.due) merged[slug] = remote;
  }
  return merged;
}

export async function pushAllSrs(map: SrsMap, pool: Question[], userId: string): Promise<void> {
  const idBySlug = new Map(pool.map((q) => [q.slug, q.id]));
  const rows = Object.entries(map)
    .filter(([slug]) => idBySlug.has(slug))
    .map(([slug, s]) => ({
      user_id: userId,
      question_id: idBySlug.get(slug)!,
      ease: s.ease,
      interval_days: s.interval,
      repetitions: s.reps,
      due_at: s.due,
      last_reviewed_at: new Date().toISOString(),
    }));
  if (rows.length === 0) return;
  await supabase.from("srs_state").upsert(rows, { onConflict: "user_id,question_id" });
}

export async function pushSrsItem(
  userId: string,
  questionId: string,
  item: SrsItem
): Promise<void> {
  await supabase.from("srs_state").upsert(
    {
      user_id: userId,
      question_id: questionId,
      ease: item.ease,
      interval_days: item.interval,
      repetitions: item.reps,
      due_at: item.due,
      last_reviewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,question_id" }
  );
}

export async function recordDrillDayRemote(userId: string): Promise<void> {
  await supabase
    .from("drill_days")
    .upsert({ user_id: userId, day: today() }, { onConflict: "user_id,day", ignoreDuplicates: true });
}

/** Rebuild the streak from the synced day list, keeping whatever local
 *  history is better (anonymous days never made it to the server). */
export async function pullStreak(): Promise<Streak | null> {
  const { data, error } = await supabase.from("drill_days").select("day");
  if (error || !data) return null;
  const days = [...new Set((data as { day: string }[]).map((d) => d.day.slice(0, 10)))].sort();
  if (days.length === 0) return null;

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === addDays(days[i - 1], 1) ? run + 1 : 1;
    if (run > best) best = run;
  }
  const last = days[days.length - 1];
  const t = today();
  const current = last === t || last === addDays(t, -1) ? run : 0;

  const local = loadStreak();
  const merged: Streak = {
    last: last > local.last ? last : local.last,
    current: Math.max(current, local.last >= addDays(t, -1) ? local.current : 0),
    best: Math.max(best, local.best),
    total: Math.max(days.length, local.total),
  };
  saveStreak(merged);
  return merged;
}
