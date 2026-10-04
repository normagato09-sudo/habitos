import type { DoneSet } from "./schedule";
import type { Completion } from "./types";

/** Agrupa las compleciones por hábito para consultarlas rápido. */
export function groupCompletions(completions: Completion[]): Map<string, DoneSet> {
  const map = new Map<string, Set<string>>();
  for (const c of completions) {
    let set = map.get(c.habitId);
    if (!set) {
      set = new Set();
      map.set(c.habitId, set);
    }
    set.add(c.date);
  }
  return map;
}
