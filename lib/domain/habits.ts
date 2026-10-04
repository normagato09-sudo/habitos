import { todayKey } from "./dates";
import type { Habit, HabitInput } from "./types";

/** Crea un hábito nuevo a partir de lo que rellena el usuario. */
export function buildHabit(input: HabitInput, order: number, now: Date = new Date()): Habit {
  const timestamp = now.toISOString();
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    emoji: input.emoji,
    frequency: input.frequency,
    timeOfDay: input.timeOfDay,
    group: input.group,
    startDate: input.startDate ?? todayKey(now),
    order,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Aplica cambios a un hábito existente sin tocar su identidad. */
export function applyHabitChanges(
  habit: Habit,
  changes: Partial<HabitInput>,
  now: Date = new Date(),
): Habit {
  return {
    ...habit,
    ...changes,
    name: (changes.name ?? habit.name).trim(),
    id: habit.id,
    createdAt: habit.createdAt,
    updatedAt: now.toISOString(),
  };
}
