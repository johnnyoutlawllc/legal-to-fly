import { supabase } from "@/lib/supabase";

const KEY = "ltf_test_attempts_v1";

export type TestAttempt = {
  id: string;
  kind: "practice" | "mock";
  completedAt: string;
  area: string | null;
  correct: number;
  total: number;
  pct: number;
  byArea: Record<string, { right: number; total: number }>;
  missedCodes: { code: string; count: number }[];
  elapsedSeconds: number | null;
};

type RemoteAttempt = {
  id: string;
  kind: TestAttempt["kind"];
  completed_at: string;
  area_code: string | null;
  correct_count: number;
  question_count: number;
  pct: number;
  by_area: TestAttempt["byArea"];
  missed_codes: TestAttempt["missedCodes"];
  elapsed_seconds: number | null;
};

export function loadTestAttempts(): TestAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? (value as TestAttempt[]) : [];
  } catch {
    return [];
  }
}

function mergeAttempts(...groups: TestAttempt[][]): TestAttempt[] {
  const byId = new Map<string, TestAttempt>();
  for (const group of groups) for (const attempt of group) byId.set(attempt.id, attempt);
  return [...byId.values()].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

/** The id is created when a session starts, so repeat completion effects cannot duplicate it. */
export function saveTestAttempt(attempt: TestAttempt): TestAttempt[] {
  const attempts = mergeAttempts(loadTestAttempts(), [attempt]);
  localStorage.setItem(KEY, JSON.stringify(attempts));
  return attempts;
}

function toRemote(attempt: TestAttempt, userId: string) {
  return {
    id: attempt.id,
    user_id: userId,
    kind: attempt.kind,
    completed_at: attempt.completedAt,
    area_code: attempt.area,
    correct_count: attempt.correct,
    question_count: attempt.total,
    pct: attempt.pct,
    by_area: attempt.byArea,
    missed_codes: attempt.missedCodes,
    elapsed_seconds: attempt.elapsedSeconds,
  };
}

function fromRemote(row: RemoteAttempt): TestAttempt {
  return {
    id: row.id,
    kind: row.kind,
    completedAt: row.completed_at,
    area: row.area_code,
    correct: row.correct_count,
    total: row.question_count,
    pct: row.pct,
    byArea: row.by_area,
    missedCodes: row.missed_codes,
    elapsedSeconds: row.elapsed_seconds,
  };
}

/** Merge this browser's attempts with the signed-in account, then upload missing local attempts. */
export async function syncTestAttempts(userId: string): Promise<TestAttempt[]> {
  const { data, error } = await supabase
    .from("test_attempts")
    .select("id, kind, completed_at, area_code, correct_count, question_count, pct, by_area, missed_codes, elapsed_seconds")
    .order("completed_at", { ascending: false });
  if (error) throw error;
  const remote = (data as RemoteAttempt[]).map(fromRemote);
  const local = loadTestAttempts();
  const remoteIds = new Set(remote.map((attempt) => attempt.id));
  const missing = local.filter((attempt) => !remoteIds.has(attempt.id));
  if (missing.length) {
    const { error: writeError } = await supabase
      .from("test_attempts")
      .upsert(missing.map((attempt) => toRemote(attempt, userId)), { onConflict: "id" });
    if (writeError) throw writeError;
  }
  const merged = mergeAttempts(local, remote);
  localStorage.setItem(KEY, JSON.stringify(merged));
  return merged;
}
