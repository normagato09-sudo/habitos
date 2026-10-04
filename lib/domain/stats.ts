import { addDays, maxKey, minKey, startOfWeek, weekDays } from "./dates";
import { isScheduledOn, type DoneSet } from "./schedule";
import type { DateKey, Habit } from "./types";

export type Rate = {
  done: number;
  expected: number;
  /** done / expected, o null si no había nada que hacer. */
  rate: number | null;
};

function toRate(done: number, expected: number): Rate {
  return { done, expected, rate: expected > 0 ? done / expected : null };
}

/**
 * Cumplimiento de un hábito entre `from` y `to` (ambos incluidos), a fecha `today`.
 *
 * Lo que aún se puede hacer no cuenta como fallo: hoy sin marcar no resta,
 * ni la semana en curso de un hábito semanal. Las fechas futuras se ignoran.
 *
 * Los hábitos semanales se cuentan por semanas completas: cada semana
 * pertenece al periodo que contiene su jueves (criterio ISO), para que
 * una semana partida entre dos meses no cuente dos veces.
 */
export function habitRate(
  habit: Habit,
  done: DoneSet,
  from: DateKey,
  to: DateKey,
  today: DateKey,
): Rate {
  const end = minKey(to, today);
  if (habit.frequency.type === "weekly") {
    return weeklyRate(habit, habit.frequency.times, done, from, to, end, today);
  }

  let doneCount = 0;
  let expected = 0;
  for (let d = maxKey(from, habit.startDate); d <= end; d = addDays(d, 1)) {
    if (!isScheduledOn(habit, d)) continue;
    if (done.has(d)) {
      doneCount++;
      expected++;
    } else if (d !== today) {
      expected++;
    }
  }
  return toRate(doneCount, expected);
}

function weeklyRate(
  habit: Habit,
  times: number,
  done: DoneSet,
  from: DateKey,
  to: DateKey,
  end: DateKey,
  today: DateKey,
): Rate {
  const currentWeek = startOfWeek(today);
  const firstWeek = startOfWeek(habit.startDate);
  let doneCount = 0;
  let expected = 0;
  for (let w = startOfWeek(from); w <= end; w = addDays(w, 7)) {
    const thursday = addDays(w, 3);
    if (thursday < from || thursday > to || w < firstWeek) continue;
    const count = Math.min(
      weekDays(w).filter((d) => d <= today && done.has(d)).length,
      times,
    );
    doneCount += count;
    // La semana en curso solo suma lo ya hecho.
    expected += w === currentWeek ? count : times;
  }
  return toRate(doneCount, expected);
}

/** Cumplimiento conjunto de varios hábitos en el mismo periodo. */
export function overallRate(
  habits: Habit[],
  doneByHabit: ReadonlyMap<string, DoneSet>,
  from: DateKey,
  to: DateKey,
  today: DateKey,
): Rate {
  let done = 0;
  let expected = 0;
  for (const habit of habits) {
    const r = habitRate(habit, doneByHabit.get(habit.id) ?? new Set(), from, to, today);
    done += r.done;
    expected += r.expected;
  }
  return toRate(done, expected);
}
