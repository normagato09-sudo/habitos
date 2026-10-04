import { weekDays, weekdayOf } from "./dates";
import type { DateKey, Habit } from "./types";

/** Conjunto de fechas completadas de un hábito. */
export type DoneSet = ReadonlySet<DateKey>;

/** ¿Tiene sentido este hábito ese día? (ya existe y su frecuencia lo incluye) */
export function isScheduledOn(habit: Habit, date: DateKey): boolean {
  if (date < habit.startDate) return false;
  const { frequency } = habit;
  switch (frequency.type) {
    case "daily":
      return true;
    case "weekdays":
      return frequency.days.includes(weekdayOf(date));
    case "weekly":
      // Sin día fijo: cualquier día de la semana vale.
      return true;
  }
}

/** Veces completado en la semana (lunes a domingo) que contiene la fecha. */
export function doneInWeek(done: DoneSet, date: DateKey): number {
  return weekDays(date).filter((d) => done.has(d)).length;
}

/**
 * ¿Aparece el hábito en la lista de ese día?
 * Los de "X veces por semana" desaparecen cuando se cumple el objetivo
 * de la semana, salvo el día en que se marcaron (para poder desmarcarlos).
 */
export function isDueOn(habit: Habit, done: DoneSet, date: DateKey): boolean {
  if (!isScheduledOn(habit, date)) return false;
  if (habit.frequency.type !== "weekly") return true;
  if (done.has(date)) return true;
  return doneInWeek(done, date) < habit.frequency.times;
}

