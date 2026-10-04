import type { GroupId, Habit, HabitInput, TimeOfDay, Weekday } from "./types";

export const NAME_MAX = 60;
export const TIMES_MIN = 1;
export const TIMES_MAX = 6;

/** Estado del formulario: guarda todos los campos aunque no se usen. */
export type HabitDraft = {
  name: string;
  emoji: string;
  frequencyType: "daily" | "weekdays" | "weekly";
  days: Weekday[];
  times: number;
  timeOfDay: TimeOfDay;
  group: GroupId;
};

export type DraftErrors = Partial<Record<"name" | "emoji" | "days", string>>;

export function draftFromHabit(habit?: Habit): HabitDraft {
  const draft: HabitDraft = {
    name: "",
    emoji: "✨",
    frequencyType: "daily",
    days: [],
    times: 3,
    timeOfDay: "cualquiera",
    group: "personal",
  };
  if (!habit) return draft;

  const { frequency } = habit;
  return {
    ...draft,
    name: habit.name,
    emoji: habit.emoji,
    frequencyType: frequency.type,
    days: frequency.type === "weekdays" ? [...frequency.days] : [],
    times: frequency.type === "weekly" ? frequency.times : draft.times,
    timeOfDay: habit.timeOfDay,
    group: habit.group,
  };
}

/** Comprueba el borrador y, si es válido, lo convierte en datos del hábito. */
export function validateDraft(
  draft: HabitDraft,
): { ok: true; input: HabitInput } | { ok: false; errors: DraftErrors } {
  const errors: DraftErrors = {};
  const name = draft.name.trim();

  if (!name) errors.name = "Ponle un nombre al hábito.";
  else if (name.length > NAME_MAX) errors.name = `Máximo ${NAME_MAX} caracteres.`;
  if (!draft.emoji.trim()) errors.emoji = "Elige un icono.";
  if (draft.frequencyType === "weekdays" && draft.days.length === 0) {
    errors.days = "Elige al menos un día.";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const days = [...new Set(draft.days)].sort((a, b) => a - b);
  const frequency: HabitInput["frequency"] =
    draft.frequencyType === "daily" || (draft.frequencyType === "weekdays" && days.length === 7)
      ? { type: "daily" }
      : draft.frequencyType === "weekdays"
        ? { type: "weekdays", days }
        : { type: "weekly", times: Math.min(TIMES_MAX, Math.max(TIMES_MIN, draft.times)) };

  return {
    ok: true,
    input: {
      name,
      emoji: draft.emoji.trim(),
      frequency,
      timeOfDay: draft.timeOfDay,
      group: draft.group,
    },
  };
}
