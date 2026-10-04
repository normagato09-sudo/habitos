import { describe, expect, it } from "vitest";
import { done, makeHabit } from "@/lib/test/fixtures";
import { buildDayPlan } from "./day-plan";
import type { Habit } from "./types";

const habit = (id: string, extra: Partial<Habit>): Habit => ({
  ...makeHabit({ type: "daily" }, "2026-09-01"),
  id,
  name: id,
  ...extra,
});

describe("buildDayPlan", () => {
  const dientes = habit("dientes", { timeOfDay: "manana" });
  const ducha = habit("ducha", {
    timeOfDay: "noche",
    frequency: { type: "weekdays", days: [2, 4, 7] },
  });
  const fregar = habit("fregar", { timeOfDay: "noche", group: "casa" });
  const leer = habit("leer", { timeOfDay: "cualquiera", frequency: { type: "weekly", times: 2 } });
  const all = [fregar, ducha, leer, dientes];

  it("agrupa por momento del día en orden y, dentro, Personal antes que Casa", () => {
    // Jueves 1 de octubre: tocan todos.
    const plan = buildDayPlan(all, new Map(), "2026-10-01");
    expect(plan.sections.map((s) => s.timeOfDay)).toEqual(["manana", "noche", "cualquiera"]);
    expect(plan.sections[1].groups.map((g) => g.label)).toEqual(["Personal", "Casa"]);
    expect(plan.total).toBe(4);
  });

  it("omite lo que no toca ese día", () => {
    // Miércoles 30: no hay ducha.
    const plan = buildDayPlan(all, new Map(), "2026-09-30");
    const ids = plan.sections.flatMap((s) => s.groups.flatMap((g) => g.items.map((i) => i.habit.id)));
    expect(ids).toEqual(["dientes", "fregar", "leer"]);
  });

  it("cuenta lo hecho y el progreso semanal", () => {
    const byHabit = new Map([
      ["dientes", done("2026-10-01")],
      ["leer", done("2026-09-29", "2026-10-01")],
    ]);
    const plan = buildDayPlan(all, byHabit, "2026-10-01");
    expect(plan.completed).toBe(2);
    expect(plan.sections[0]).toMatchObject({ total: 1, completed: 1 });
    const leerItem = plan.sections[2].groups[0].items[0];
    expect(leerItem).toMatchObject({ done: true, weekly: { done: 2, times: 2 } });
  });

  it("un día sin hábitos queda vacío", () => {
    const plan = buildDayPlan([ducha], new Map(), "2026-09-30");
    expect(plan).toMatchObject({ sections: [], total: 0, completed: 0 });
  });
});
