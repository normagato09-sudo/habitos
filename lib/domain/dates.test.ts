import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  endOfMonth,
  startOfMonth,
  startOfWeek,
  toDateKey,
  weekDays,
  weekdayOf,
} from "./dates";

describe("fechas", () => {
  it("formatea en hora local", () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("calcula el día de la semana empezando en lunes", () => {
    expect(weekdayOf("2026-10-05")).toBe(1); // lunes
    expect(weekdayOf("2026-10-04")).toBe(7); // domingo
  });

  it("suma días cruzando meses, años y el cambio de hora", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30"); // horario de verano
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26"); // horario de invierno
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("devuelve la semana de lunes a domingo", () => {
    expect(startOfWeek("2026-10-04")).toBe("2026-09-28");
    expect(weekDays("2026-10-01")).toEqual([
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
    ]);
  });

  it("recorre rangos y meses", () => {
    expect(daysBetween("2026-02-27", "2026-03-01")).toEqual([
      "2026-02-27",
      "2026-02-28",
      "2026-03-01",
    ]);
    expect(daysBetween("2026-03-02", "2026-03-01")).toEqual([]);
    expect(startOfMonth("2026-02-14")).toBe("2026-02-01");
    expect(endOfMonth("2028-02-10")).toBe("2028-02-29");
  });
});
