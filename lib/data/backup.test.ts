import { describe, expect, it } from "vitest";
import { makeHabit } from "@/lib/test/fixtures";
import { backupFileName, buildBackup, parseBackup } from "./backup";

const habit = makeHabit({ type: "weekdays", days: [2, 4] }, "2026-09-01");
const completion = { id: "h1:2026-09-01", habitId: "h1", date: "2026-09-01", completedAt: "2026-09-01T09:00:00.000Z" };

function file(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({ ...buildBackup({ habits: [habit], completions: [completion] }), ...overrides });
}

describe("copias de seguridad", () => {
  it("una copia se lee tal cual se guardó", () => {
    const result = parseBackup(file());
    expect(result).toEqual({ ok: true, data: { habits: [habit], completions: [completion] } });
  });

  it("nombra el archivo con la fecha", () => {
    expect(backupFileName("2026-10-05")).toBe("habitos-copia-2026-10-05.json");
  });

  it("rechaza archivos que no son copias de Hábitos", () => {
    expect(parseBackup("no es json")).toMatchObject({ ok: false });
    expect(parseBackup(JSON.stringify({ hola: 1 }))).toMatchObject({ ok: false });
    expect(parseBackup(file({ version: 2 }))).toMatchObject({
      ok: false,
      error: expect.stringContaining("versión más nueva"),
    });
  });

  it("rechaza copias con hábitos dañados", () => {
    expect(parseBackup(file({ habits: [{ ...habit, frequency: { type: "weekly", times: 0 } }] })).ok).toBe(false);
    expect(parseBackup(file({ habits: [{ ...habit, startDate: "1 de septiembre" }] })).ok).toBe(false);
    expect(parseBackup(file({ habits: [{ ...habit, timeOfDay: "madrugada" }] })).ok).toBe(false);
    expect(parseBackup(file({ completions: [{ habitId: "h1" }] })).ok).toBe(false);
  });

  it("descarta los días marcados de hábitos que no están y los repetidos", () => {
    const result = parseBackup(
      file({ completions: [completion, completion, { ...completion, habitId: "otro", id: "otro:2026-09-01" }] }),
    );
    expect(result.ok && result.data.completions).toEqual([completion]);
  });
});
