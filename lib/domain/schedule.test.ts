import { describe, expect, it } from "vitest";
import { done, makeHabit } from "@/lib/test/fixtures";
import { doneInWeek, isDueOn, isScheduledOn } from "./schedule";

describe("isScheduledOn", () => {
  it("los diarios tocan todos los días desde su inicio", () => {
    const h = makeHabit({ type: "daily" }, "2026-10-01");
    expect(isScheduledOn(h, "2026-09-30")).toBe(false);
    expect(isScheduledOn(h, "2026-10-01")).toBe(true);
    expect(isScheduledOn(h, "2026-10-04")).toBe(true);
  });

  it("ducharme: martes, jueves y domingo", () => {
    const h = makeHabit({ type: "weekdays", days: [2, 4, 7] });
    expect(isScheduledOn(h, "2026-09-28")).toBe(false); // lunes
    expect(isScheduledOn(h, "2026-09-29")).toBe(true); // martes
    expect(isScheduledOn(h, "2026-09-30")).toBe(false); // miércoles
    expect(isScheduledOn(h, "2026-10-01")).toBe(true); // jueves
    expect(isScheduledOn(h, "2026-10-04")).toBe(true); // domingo
  });
});

describe("isDueOn con X veces por semana", () => {
  const h = makeHabit({ type: "weekly", times: 2 });

  it("aparece mientras no se cumpla el objetivo de la semana", () => {
    expect(isDueOn(h, done(), "2026-09-28")).toBe(true);
    expect(isDueOn(h, done("2026-09-28"), "2026-09-30")).toBe(true);
  });

  it("desaparece al cumplirlo, salvo los días en que se marcó", () => {
    const d = done("2026-09-28", "2026-09-30");
    expect(isDueOn(h, d, "2026-10-01")).toBe(false);
    expect(isDueOn(h, d, "2026-09-30")).toBe(true);
    expect(doneInWeek(d, "2026-10-04")).toBe(2);
  });

  it("vuelve a aparecer la semana siguiente", () => {
    expect(isDueOn(h, done("2026-09-28", "2026-09-30"), "2026-10-05")).toBe(true);
  });
});
