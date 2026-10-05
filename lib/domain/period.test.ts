import { describe, expect, it } from "vitest";
import { done, makeHabit } from "@/lib/test/fixtures";
import {
  dayRate,
  firstStartDate,
  periodBuckets,
  periodContaining,
  periodIncludes,
  shiftPeriod,
} from "./period";

describe("periodos", () => {
  it("calcula la semana, el mes y el año de una fecha", () => {
    expect(periodContaining("semana", "2026-10-01")).toEqual({
      kind: "semana",
      from: "2026-09-28",
      to: "2026-10-04",
    });
    expect(periodContaining("mes", "2026-02-10")).toEqual({
      kind: "mes",
      from: "2026-02-01",
      to: "2026-02-28",
    });
    expect(periodContaining("ano", "2026-10-01")).toEqual({
      kind: "ano",
      from: "2026-01-01",
      to: "2026-12-31",
    });
  });

  it("pasa al periodo anterior y al siguiente", () => {
    const week = periodContaining("semana", "2026-10-01");
    expect(shiftPeriod(week, -1).from).toBe("2026-09-21");
    expect(shiftPeriod(week, 1).from).toBe("2026-10-05");
    const month = periodContaining("mes", "2026-01-15");
    expect(shiftPeriod(month, -1)).toMatchObject({ from: "2025-12-01", to: "2025-12-31" });
    expect(shiftPeriod(periodContaining("ano", "2026-05-01"), 1).from).toBe("2027-01-01");
  });

  it("sabe si una fecha cae dentro", () => {
    const week = periodContaining("semana", "2026-10-01");
    expect(periodIncludes(week, "2026-10-04")).toBe(true);
    expect(periodIncludes(week, "2026-10-05")).toBe(false);
  });
});

describe("cumplimiento de un día", () => {
  const daily = { ...makeHabit({ type: "daily" }, "2026-09-01"), id: "d" };
  const weekly = { ...makeHabit({ type: "weekly", times: 3 }, "2026-09-01"), id: "w" };

  it("cuenta los hábitos que tocaban ese día", () => {
    const byHabit = new Map([["d", done("2026-09-30")]]);
    expect(dayRate([daily], byHabit, "2026-09-30", "2026-10-05").rate).toBe(1);
    expect(dayRate([daily], byHabit, "2026-09-29", "2026-10-05").rate).toBe(0);
  });

  it("los semanales solo suman el día en que se hicieron", () => {
    const byHabit = new Map([
      ["d", done()],
      ["w", done("2026-09-30")],
    ]);
    expect(dayRate([daily, weekly], byHabit, "2026-09-30", "2026-10-05")).toEqual({
      done: 1,
      expected: 2,
      rate: 0.5,
    });
    expect(dayRate([daily, weekly], byHabit, "2026-09-29", "2026-10-05")).toEqual({
      done: 0,
      expected: 1,
      rate: 0,
    });
  });

  it("los días futuros y hoy sin marcar no tienen datos", () => {
    const byHabit = new Map([["d", done()]]);
    expect(dayRate([daily], byHabit, "2026-10-05", "2026-10-05").rate).toBeNull();
    expect(dayRate([daily], byHabit, "2026-10-06", "2026-10-05").rate).toBeNull();
  });
});

describe("tramos del gráfico", () => {
  const daily = makeHabit({ type: "daily" }, "2026-09-01");
  const byHabit = new Map([["h1", done("2026-09-01", "2026-09-02")]]);

  it("una semana tiene 7 días y un mes, todos sus días", () => {
    const week = periodBuckets(periodContaining("semana", "2026-10-01"), [daily], byHabit, "2026-10-05");
    expect(week).toHaveLength(7);
    const month = periodBuckets(periodContaining("mes", "2026-09-10"), [daily], byHabit, "2026-10-05");
    expect(month).toHaveLength(30);
    expect(month[0].rate.rate).toBe(1);
    expect(month[2].rate.rate).toBe(0);
  });

  it("un año tiene 12 meses", () => {
    const year = periodBuckets(periodContaining("ano", "2026-09-10"), [daily], byHabit, "2026-10-05");
    expect(year.map((b) => b.from.slice(5, 7))).toEqual([
      "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
    ]);
    expect(year[0].rate.rate).toBeNull();
    expect(year[8].rate).toEqual({ done: 2, expected: 30, rate: 2 / 30 });
  });
});

describe("primer día con hábitos", () => {
  it("es el inicio más antiguo", () => {
    expect(firstStartDate([])).toBeNull();
    expect(
      firstStartDate([makeHabit({ type: "daily" }, "2026-09-10"), makeHabit({ type: "daily" }, "2026-08-03")]),
    ).toBe("2026-08-03");
  });
});
