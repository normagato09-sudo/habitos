import { describe, expect, it } from "vitest";
import { makeHabit } from "@/lib/test/fixtures";
import { draftFromHabit, validateDraft, type HabitDraft } from "./habit-draft";

const base: HabitDraft = { ...draftFromHabit(), name: "Leer", emoji: "📚" };

describe("draftFromHabit", () => {
  it("rellena el formulario con un hábito existente", () => {
    const habit = { ...makeHabit({ type: "weekdays", days: [2, 4, 7] }), name: "Ducharme" };
    expect(draftFromHabit(habit)).toMatchObject({
      name: "Ducharme",
      frequencyType: "weekdays",
      days: [2, 4, 7],
      times: 3,
    });
  });
});

describe("validateDraft", () => {
  it("exige nombre, icono y al menos un día", () => {
    const result = validateDraft({ ...base, name: "  ", emoji: "", frequencyType: "weekdays" });
    expect(result).toEqual({
      ok: false,
      errors: {
        name: "Ponle un nombre al hábito.",
        emoji: "Elige un icono.",
        days: "Elige al menos un día.",
      },
    });
  });

  it("limita la longitud del nombre", () => {
    const result = validateDraft({ ...base, name: "a".repeat(61) });
    expect(result.ok).toBe(false);
  });

  it("recorta el nombre y ordena los días", () => {
    const result = validateDraft({ ...base, name: " Leer ", frequencyType: "weekdays", days: [7, 2, 4, 2] });
    expect(result).toMatchObject({
      ok: true,
      input: { name: "Leer", frequency: { type: "weekdays", days: [2, 4, 7] } },
    });
  });

  it("los 7 días se guardan como «cada día»", () => {
    const result = validateDraft({ ...base, frequencyType: "weekdays", days: [1, 2, 3, 4, 5, 6, 7] });
    expect(result).toMatchObject({ ok: true, input: { frequency: { type: "daily" } } });
  });

  it("ignora los días si la frecuencia es semanal", () => {
    const result = validateDraft({ ...base, frequencyType: "weekly", days: [1], times: 9 });
    expect(result).toMatchObject({ ok: true, input: { frequency: { type: "weekly", times: 6 } } });
  });
});
