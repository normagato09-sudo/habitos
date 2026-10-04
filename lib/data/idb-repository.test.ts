import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdbRepository } from "./idb-repository";

let n = 0;
const repos: IdbRepository[] = [];

function newRepo(name = `habitos-test-${n++}`) {
  const repo = new IdbRepository(name);
  repos.push(repo);
  return repo;
}

afterEach(async () => {
  await Promise.all(repos.splice(0).map((r) => r.close()));
});

describe("IdbRepository", () => {
  it("crea los hábitos de ejemplo la primera vez", async () => {
    const habits = await newRepo().listHabits();
    expect(habits.map((h) => h.name)).toEqual(["Lavarme los dientes", "Ducharme"]);
    expect(habits[1].frequency).toEqual({ type: "weekdays", days: [2, 4, 7] });
  });

  it("no duplica los ejemplos al volver a abrir la base de datos", async () => {
    const name = `habitos-test-${n++}`;
    const first = new IdbRepository(name);
    await first.listHabits();
    await first.close();
    expect(await newRepo(name).listHabits()).toHaveLength(2);
  });

  it("crea, edita y ordena hábitos", async () => {
    const repo = newRepo();
    const created = await repo.createHabit({
      name: "  Fregar  ",
      emoji: "🧽",
      frequency: { type: "weekly", times: 3 },
      timeOfDay: "tarde",
      group: "casa",
      reminder: null,
    });
    expect(created.name).toBe("Fregar");
    expect(created.order).toBe(2);

    const updated = await repo.updateHabit(created.id, { name: "Fregar los platos" });
    expect(updated.name).toBe("Fregar los platos");
    expect(updated.createdAt).toBe(created.createdAt);
    expect((await repo.listHabits()).at(-1)?.name).toBe("Fregar los platos");
  });

  it("marca y desmarca compleciones, y filtra por fechas", async () => {
    const repo = newRepo();
    const [habit] = await repo.listHabits();
    await repo.setCompleted(habit.id, "2026-10-01", true);
    await repo.setCompleted(habit.id, "2026-10-01", true); // repetir no duplica
    await repo.setCompleted(habit.id, "2026-10-03", true);
    expect(await repo.listCompletions()).toHaveLength(2);
    expect(await repo.listCompletions({ from: "2026-10-02", to: "2026-10-31" })).toHaveLength(1);

    await repo.setCompleted(habit.id, "2026-10-01", false);
    expect((await repo.listCompletions()).map((c) => c.date)).toEqual(["2026-10-03"]);
  });

  it("al borrar un hábito borra su historial y no el de los demás", async () => {
    const repo = newRepo();
    const [a, b] = await repo.listHabits();
    await repo.setCompleted(a.id, "2026-10-01", true);
    await repo.setCompleted(b.id, "2026-10-01", true);
    await repo.deleteHabit(a.id);
    expect((await repo.listHabits()).map((h) => h.id)).toEqual([b.id]);
    expect((await repo.listCompletions()).map((c) => c.habitId)).toEqual([b.id]);
  });

  it("avisa de los cambios a quien esté suscrito", async () => {
    const repo = newRepo();
    const listener = vi.fn();
    const unsubscribe = repo.subscribe(listener);
    const [habit] = await repo.listHabits();
    await repo.setCompleted(habit.id, "2026-10-01", true);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    await repo.setCompleted(habit.id, "2026-10-01", false);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
