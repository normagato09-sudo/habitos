import type { HabitInput } from "@/lib/domain/types";

/** Hábitos de ejemplo que se crean la primera vez que se abre la app. */
export const SEED_HABITS: HabitInput[] = [
  {
    name: "Lavarme los dientes",
    emoji: "🪥",
    frequency: { type: "daily" },
    timeOfDay: "manana",
    group: "personal",
    reminder: null,
  },
  {
    name: "Ducharme",
    emoji: "🚿",
    frequency: { type: "weekdays", days: [2, 4, 7] },
    timeOfDay: "noche",
    group: "personal",
    reminder: null,
  },
];
