import { describe, expect, it } from "vitest";
import { describeFrequency, formatLongDate, listJoin, relativeDayName } from "./format";

describe("describeFrequency", () => {
  it("describe cada tipo de frecuencia", () => {
    expect(describeFrequency({ type: "daily" })).toBe("Cada día");
    expect(describeFrequency({ type: "weekly", times: 1 })).toBe("1 vez por semana");
    expect(describeFrequency({ type: "weekly", times: 3 })).toBe("3 veces por semana");
  });

  it("nombra los días concretos en orden", () => {
    expect(describeFrequency({ type: "weekdays", days: [7, 2, 4] })).toBe(
      "Martes, jueves y domingo",
    );
    expect(describeFrequency({ type: "weekdays", days: [3] })).toBe("Miércoles");
  });

  it("usa nombres cortos para combinaciones habituales", () => {
    expect(describeFrequency({ type: "weekdays", days: [1, 2, 3, 4, 5] })).toBe("De lunes a viernes");
    expect(describeFrequency({ type: "weekdays", days: [6, 7] })).toBe("Fines de semana");
  });
});

describe("textos de fechas", () => {
  it("une listas en español", () => {
    expect(listJoin(["a"])).toBe("a");
    expect(listJoin(["a", "b", "c"])).toBe("a, b y c");
  });

  it("nombra el día respecto a hoy", () => {
    expect(relativeDayName("2026-10-04", "2026-10-04")).toBe("Hoy");
    expect(relativeDayName("2026-10-03", "2026-10-04")).toBe("Ayer");
    expect(relativeDayName("2026-10-05", "2026-10-04")).toBe("Mañana");
    expect(relativeDayName("2026-10-01", "2026-10-04")).toBe("Jueves");
    expect(formatLongDate("2026-10-01")).toBe("jueves, 1 de octubre");
  });
});
