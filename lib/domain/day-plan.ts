import { doneInWeek, isDueOn, type DoneSet } from "./schedule";
import {
  DEFAULT_GROUPS,
  TIMES_OF_DAY,
  type DateKey,
  type GroupId,
  type Habit,
  type TimeOfDay,
} from "./types";

export type DayItem = {
  habit: Habit;
  done: boolean;
  /** Solo en hábitos de "X veces por semana": progreso de esa semana. */
  weekly?: { done: number; times: number };
};

export type DayGroup = { group: GroupId; label: string; items: DayItem[] };

export type DaySection = {
  timeOfDay: TimeOfDay;
  label: string;
  groups: DayGroup[];
  total: number;
  completed: number;
};

export type DayPlan = {
  date: DateKey;
  sections: DaySection[];
  total: number;
  completed: number;
};

const EMPTY: DoneSet = new Set();

export function groupLabel(id: GroupId): string {
  return DEFAULT_GROUPS.find((g) => g.id === id)?.label ?? id.charAt(0).toUpperCase() + id.slice(1);
}

function groupRank(id: GroupId): number {
  const i = DEFAULT_GROUPS.findIndex((g) => g.id === id);
  return i === -1 ? DEFAULT_GROUPS.length : i;
}

/**
 * Lo que toca un día: hábitos agrupados por momento del día
 * (mañana → tarde → noche → cuando sea) y, dentro, por grupo.
 */
export function buildDayPlan(
  habits: Habit[],
  doneByHabit: ReadonlyMap<string, DoneSet>,
  date: DateKey,
): DayPlan {
  const sections: DaySection[] = [];
  let total = 0;
  let completed = 0;

  for (const { id: timeOfDay, label } of TIMES_OF_DAY) {
    const byGroup = new Map<GroupId, DayItem[]>();

    for (const habit of habits) {
      if (habit.timeOfDay !== timeOfDay) continue;
      const done = doneByHabit.get(habit.id) ?? EMPTY;
      if (!isDueOn(habit, done, date)) continue;

      const item: DayItem = { habit, done: done.has(date) };
      if (habit.frequency.type === "weekly") {
        item.weekly = { done: doneInWeek(done, date), times: habit.frequency.times };
      }
      const items = byGroup.get(habit.group) ?? [];
      items.push(item);
      byGroup.set(habit.group, items);
    }

    if (byGroup.size === 0) continue;

    const groups = [...byGroup.entries()]
      .sort(([a], [b]) => groupRank(a) - groupRank(b) || a.localeCompare(b))
      .map(([group, items]) => ({ group, label: groupLabel(group), items }));
    const sectionTotal = groups.reduce((n, g) => n + g.items.length, 0);
    const sectionDone = groups.reduce((n, g) => n + g.items.filter((i) => i.done).length, 0);

    sections.push({ timeOfDay, label, groups, total: sectionTotal, completed: sectionDone });
    total += sectionTotal;
    completed += sectionDone;
  }

  return { date, sections, total, completed };
}
