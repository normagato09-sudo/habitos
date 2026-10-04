import { describe, expect, it } from "vitest";
import { done, makeHabit } from "@/lib/test/fixtures";
import { habitRate, overallRate } from "./stats";

describe("cumplimiento de hábitos diarios y de días concretos", () => {
  it("hoy sin marcar no cuenta como fallo", () => {
    const h = makeHabit({ type: "daily" }, "2026-09-28");
    const r = habitRate(h, done("2026-09-28", "2026-09-29"), "2026-09-28", "2026-10-04", "2026-09-30");
    expect(r).toEqual({ done: 2, expected: 2, rate: 1 });
  });

  it("los días pasados sin marcar sí cuentan; los futuros no", () => {
    const h = makeHabit({ type: "daily" }, "2026-09-28");
    const r = habitRate(h, done("2026-09-28"), "2026-09-28", "2026-10-04", "2026-10-01");
    expect(r).toEqual({ done: 1, expected: 3, rate: 1 / 3 });
  });

  it("solo cuenta los días que tocan y desde el inicio del hábito", () => {
    const h = makeHabit({ type: "weekdays", days: [2, 4, 7] }, "2026-09-30");
    const r = habitRate(h, done("2026-10-01"), "2026-09-28", "2026-10-04", "2026-10-05");
    expect(r).toEqual({ done: 1, expected: 2, rate: 0.5 });
  });

  it("sin nada que hacer el porcentaje es null", () => {
    const h = makeHabit({ type: "daily" }, "2026-10-10");
    expect(habitRate(h, done(), "2026-10-01", "2026-10-07", "2026-10-07").rate).toBeNull();
  });
});

describe("cumplimiento de hábitos semanales", () => {
  const h = makeHabit({ type: "weekly", times: 3 }, "2026-08-01");

  it("cada semana cuenta hasta su objetivo, sin pasarse", () => {
    const d = done("2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01");
    expect(habitRate(h, d, "2026-09-28", "2026-10-04", "2026-10-10")).toEqual({
      done: 3,
      expected: 3,
      rate: 1,
    });
  });

  it("las semanas partidas cuentan en el mes que tiene su jueves", () => {
    // Semana 28 sep – 4 oct: su jueves es 1 de octubre.
    const d = done("2026-09-28", "2026-09-29", "2026-09-30");
    // Septiembre: semanas con jueves 3, 10, 17 y 24 → 4 × 3.
    expect(habitRate(h, d, "2026-09-01", "2026-09-30", "2026-10-31").expected).toBe(12);
    expect(habitRate(h, d, "2026-10-01", "2026-10-31", "2026-10-31").done).toBe(3);
  });

  it("la semana en curso solo suma lo hecho", () => {
    const r = habitRate(h, done("2026-09-28"), "2026-09-28", "2026-10-04", "2026-09-29");
    expect(r).toEqual({ done: 1, expected: 1, rate: 1 });
  });
});

describe("cumplimiento conjunto", () => {
  it("suma varios hábitos", () => {
    const a = { ...makeHabit({ type: "daily" }, "2026-09-28"), id: "a" };
    const b = { ...makeHabit({ type: "weekdays", days: [1] }, "2026-09-28"), id: "b" };
    const byHabit = new Map([
      ["a", done("2026-09-28", "2026-09-29")],
      ["b", done()],
    ]);
    expect(overallRate([a, b], byHabit, "2026-09-28", "2026-09-29", "2026-09-30")).toEqual({
      done: 2,
      expected: 3,
      rate: 2 / 3,
    });
  });
});
