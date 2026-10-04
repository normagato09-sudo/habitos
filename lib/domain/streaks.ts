import { addDays, startOfWeek } from "./dates";
import { doneInWeek, isScheduledOn, type DoneSet } from "./schedule";
import type { DateKey, Habit } from "./types";

export type Streak = {
  current: number;
  best: number;
  /** Los hábitos semanales cuentan semanas seguidas; el resto, días. */
  unit: "dias" | "semanas";
};

/**
 * Racha de un hábito a fecha `today`.
 *
 * - Diarios y de días concretos: días programados seguidos completados.
 *   Los días que no tocan no rompen la racha.
 * - "X veces por semana": semanas seguidas en las que se llegó al objetivo.
 * - Lo que aún se puede hacer (hoy, o la semana en curso) no rompe la racha.
 */
export function computeStreak(habit: Habit, done: DoneSet, today: DateKey): Streak {
  return habit.frequency.type === "weekly"
    ? weeklyStreak(habit, habit.frequency.times, done, today)
    : dailyStreak(habit, done, today);
}

function dailyStreak(habit: Habit, done: DoneSet, today: DateKey): Streak {
  let best = 0;
  let run = 0;
  for (let d = habit.startDate; d <= today; d = addDays(d, 1)) {
    if (!isScheduledOn(habit, d)) continue;
    if (done.has(d)) {
      run++;
      best = Math.max(best, run);
    } else if (d !== today) {
      run = 0;
    }
  }
  return { current: run, best, unit: "dias" };
}

function weeklyStreak(habit: Habit, times: number, done: DoneSet, today: DateKey): Streak {
  const currentWeek = startOfWeek(today);
  let best = 0;
  let run = 0;
  for (let w = startOfWeek(habit.startDate); w <= currentWeek; w = addDays(w, 7)) {
    if (doneInWeek(done, w) >= times) {
      run++;
      best = Math.max(best, run);
    } else if (w !== currentWeek) {
      run = 0;
    }
  }
  return { current: run, best, unit: "semanas" };
}
