/** Ground-school read tracking. localStorage-only for now, like mastery and
 *  badges were before sync; when LTF-01 gets fixed, ride the same sync. */

const KEY = "ltf_lessons_v1";

type ReadMap = Record<string, string>; // slug -> ISO date first read

function load(): ReadMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as ReadMap;
  } catch {
    return {};
  }
}

export function readLessons(): Set<string> {
  return new Set(Object.keys(load()));
}

export function markLessonRead(slug: string): void {
  const map = load();
  if (!map[slug]) {
    map[slug] = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(map));
  }
}

export function isLessonRead(slug: string): boolean {
  return slug in load();
}
