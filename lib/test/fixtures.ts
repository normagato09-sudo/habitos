import type { Frequency, Habit } from "@/lib/domain/types";

export function makeHabit(frequency: Frequency, startDate = "2026-09-01"): Habit {
  return {
    id: "h1",
    name: "Prueba",
    emoji: "✅",
    frequency,
    timeOfDay: "cualquiera",
    group: "personal",
    startDate,
    order: 0,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  };
}

export const done = (...dates: string[]) => new Set(dates);
