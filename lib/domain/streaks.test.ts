import { describe, expect, it } from "vitest";
import { done, makeHabit } from "@/lib/test/fixtures";
import { daysBetween } from "./dates";
import { computeStreak } from "./streaks";

describe("rachas diarias", () => {
  const h = makeHabit({ type: "daily" }, "2026-09-25");

  it("cuenta días seguidos hasta hoy", () => {
    const d = done(...daysBetween("2026-10-01", "2026-10-04"));
    expect(computeStreak(h, d, "2026-10-04")).toEqual({ current: 4, best: 4, unit: "dias" });
  });

  it("hoy sin marcar no rompe la racha", () => {
    const d = done(...daysBetween("2026-10-01", "2026-10-03"));
    expect(computeStreak(h, d, "2026-10-04").current).toBe(3);
  });

  it("un día fallado reinicia la racha pero guarda la mejor", () => {
    const d = done(...daysBetween("2026-09-25", "2026-09-29"), "2026-10-02", "2026-10-03");
    expect(computeStreak(h, d, "2026-10-04")).toEqual({ current: 2, best: 5, unit: "dias" });
  });

  it("sin nada hecho la racha es 0", () => {
    expect(computeStreak(h, done(), "2026-10-04")).toEqual({ current: 0, best: 0, unit: "dias" });
  });
});

describe("rachas de días concretos", () => {
  // Martes, jueves y domingo.
  const h = makeHabit({ type: "weekdays", days: [2, 4, 7] }, "2026-09-22");

  it("los días que no tocan no rompen la racha", () => {
    const d = done("2026-09-27", "2026-09-29", "2026-10-01", "2026-10-04");
    expect(computeStreak(h, d, "2026-10-05").current).toBe(4);
  });

  it("marcar un día que no toca no suma", () => {
    const d = done("2026-10-01", "2026-10-02", "2026-10-04");
    expect(computeStreak(h, d, "2026-10-05").current).toBe(2);
  });

  it("saltarse un día programado la rompe", () => {
    const d = done("2026-09-29", "2026-10-04"); // falta el jueves 1
    expect(computeStreak(h, d, "2026-10-05").current).toBe(1);
  });
});

describe("rachas semanales", () => {
  const h = makeHabit({ type: "weekly", times: 2 }, "2026-09-14");

  it("cuenta semanas seguidas cumplidas", () => {
    const d = done(
      "2026-09-14",
      "2026-09-16",
      "2026-09-22",
      "2026-09-27",
      "2026-09-29",
      "2026-10-03",
    );
    expect(computeStreak(h, d, "2026-10-04")).toEqual({ current: 3, best: 3, unit: "semanas" });
  });

  it("la semana en curso sin cumplir no rompe la racha", () => {
    const d = done("2026-09-14", "2026-09-16", "2026-09-22", "2026-09-27");
    expect(computeStreak(h, d, "2026-10-01").current).toBe(2);
  });

  it("una semana pasada sin cumplir la rompe", () => {
    const d = done("2026-09-14", "2026-09-16", "2026-09-22", "2026-09-29", "2026-10-01");
    expect(computeStreak(h, d, "2026-10-04")).toEqual({ current: 1, best: 1, unit: "semanas" });
  });
});
