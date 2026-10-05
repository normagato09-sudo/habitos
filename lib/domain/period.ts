import { addDays, endOfMonth, minKey, startOfMonth, startOfWeek } from "./dates";
import { habitRate, overallRate, type Rate } from "./stats";
import type { DoneSet } from "./schedule";
import type { DateKey, Habit } from "./types";

export type PeriodKind = "semana" | "mes" | "ano";

/** Un periodo de calendario: una semana (lunes a domingo), un mes o un año. */
export type Period = { kind: PeriodKind; from: DateKey; to: DateKey };

/** Un tramo del gráfico: un día (semana y mes) o un mes (año). */
export type Bucket = { from: DateKey; to: DateKey; rate: Rate };

const EMPTY: DoneSet = new Set();

export function periodContaining(kind: PeriodKind, date: DateKey): Period {
  switch (kind) {
    case "semana": {
      const from = startOfWeek(date);
      return { kind, from, to: addDays(from, 6) };
    }
    case "mes":
      return { kind, from: startOfMonth(date), to: endOfMonth(date) };
    case "ano": {
      const year = date.slice(0, 4);
      return { kind, from: `${year}-01-01`, to: `${year}-12-31` };
    }
  }
}

/** El periodo anterior (-1) o siguiente (1) del mismo tipo. */
export function shiftPeriod(period: Period, direction: -1 | 1): Period {
  const date = direction < 0 ? addDays(period.from, -1) : addDays(period.to, 1);
  return periodContaining(period.kind, date);
}

export function periodIncludes(period: Period, date: DateKey): boolean {
  return period.from <= date && date <= period.to;
}

/**
 * Cumplimiento de un solo día.
 *
 * Los hábitos de "X veces por semana" no tienen día fijo, así que no
 * pueden fallar un día concreto: solo suman cuando se hicieron ese día.
 */
export function dayRate(
  habits: Habit[],
  doneByHabit: ReadonlyMap<string, DoneSet>,
  date: DateKey,
  today: DateKey,
): Rate {
  let done = 0;
  let expected = 0;
  for (const habit of habits) {
    const set = doneByHabit.get(habit.id) ?? EMPTY;
    if (habit.frequency.type === "weekly") {
      if (date <= today && set.has(date)) {
        done++;
        expected++;
      }
      continue;
    }
    const r = habitRate(habit, set, date, date, today);
    done += r.done;
    expected += r.expected;
  }
  return { done, expected, rate: expected > 0 ? done / expected : null };
}

/** Tramos del gráfico de un periodo: días para semana y mes, meses para el año. */
export function periodBuckets(
  period: Period,
  habits: Habit[],
  doneByHabit: ReadonlyMap<string, DoneSet>,
  today: DateKey,
): Bucket[] {
  const buckets: Bucket[] = [];
  if (period.kind === "ano") {
    for (let m = period.from; m <= period.to; m = addDays(endOfMonth(m), 1)) {
      const to = endOfMonth(m);
      buckets.push({ from: m, to, rate: overallRate(habits, doneByHabit, m, to, today) });
    }
  } else {
    for (let d = period.from; d <= period.to; d = addDays(d, 1)) {
      buckets.push({ from: d, to: d, rate: dayRate(habits, doneByHabit, d, today) });
    }
  }
  return buckets;
}

/** Primer día con algún hábito: antes no hay nada que mirar. */
export function firstStartDate(habits: Habit[]): DateKey | null {
  return habits.reduce<DateKey | null>(
    (first, h) => (first === null ? h.startDate : minKey(first, h.startDate)),
    null,
  );
}
