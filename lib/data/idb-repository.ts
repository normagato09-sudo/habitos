import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { startOfWeek, todayKey } from "@/lib/domain/dates";
import { applyHabitChanges, buildHabit } from "@/lib/domain/habits";
import { completionId, type Completion, type Habit } from "@/lib/domain/types";
import type { AppData } from "./backup";
import type { HabitRepository } from "./repository";
import { SEED_HABITS } from "./seed";

const DB_NAME = "habitos";
const DB_VERSION = 2;
const CHANNEL = "habitos-cambios";

interface HabitosDB extends DBSchema {
  habits: {
    key: string;
    value: Habit;
  };
  completions: {
    key: string;
    value: Completion;
    indexes: { byHabit: string; byDate: string };
  };
}

type DB = IDBPDatabase<HabitosDB>;

export class IdbRepository implements HabitRepository {
  private dbPromise: Promise<DB>;
  private listeners = new Set<() => void>();
  private channel: BroadcastChannel | null = null;

  constructor(dbName: string = DB_NAME) {
    this.dbPromise = openDB<HabitosDB>(dbName, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, tx) {
        if (oldVersion < 1) {
          db.createObjectStore("habits", { keyPath: "id" });
          const completions = db.createObjectStore("completions", { keyPath: "id" });
          completions.createIndex("byHabit", "habitId");
          completions.createIndex("byDate", "date");

          // Primera vez: hábitos de ejemplo, en la misma transacción.
          // Empiezan el lunes de esta semana para poder marcar ya los días pasados.
          const now = new Date();
          const startDate = startOfWeek(todayKey(now));
          SEED_HABITS.forEach((input, i) => {
            void tx.objectStore("habits").add(buildHabit({ ...input, startDate }, i, now));
          });
        }
        if (oldVersion >= 1 && oldVersion < 2) {
          // v2: se quitan los recordatorios; se borra el campo de los hábitos guardados.
          void (async () => {
            const store = tx.objectStore("habits");
            for (let cursor = await store.openCursor(); cursor; cursor = await cursor.continue()) {
              const habit: Habit & { reminder?: unknown } = { ...cursor.value };
              delete habit.reminder;
              await cursor.update(habit);
            }
          })();
        }
        // Futuras versiones: añadir aquí migraciones con `if (oldVersion < 3) { … }`.
      },
    });

    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel(CHANNEL);
      this.channel.onmessage = () => this.emit();
    }
  }

  async listHabits(): Promise<Habit[]> {
    const db = await this.dbPromise;
    const habits = await db.getAll("habits");
    return habits.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    const db = await this.dbPromise;
    return db.get("habits", id);
  }

  async createHabit(input: Parameters<HabitRepository["createHabit"]>[0]): Promise<Habit> {
    const db = await this.dbPromise;
    const tx = db.transaction("habits", "readwrite");
    const existing = await tx.store.getAll();
    const order = existing.reduce((max, h) => Math.max(max, h.order + 1), 0);
    const habit = buildHabit(input, order);
    await tx.store.add(habit);
    await tx.done;
    this.notify();
    return habit;
  }

  async updateHabit(
    id: string,
    changes: Parameters<HabitRepository["updateHabit"]>[1],
  ): Promise<Habit> {
    const db = await this.dbPromise;
    const tx = db.transaction("habits", "readwrite");
    const habit = await tx.store.get(id);
    if (!habit) throw new Error(`No existe el hábito ${id}`);
    const updated = applyHabitChanges(habit, changes);
    await tx.store.put(updated);
    await tx.done;
    this.notify();
    return updated;
  }

  async deleteHabit(id: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(["habits", "completions"], "readwrite");
    await tx.objectStore("habits").delete(id);
    const index = tx.objectStore("completions").index("byHabit");
    for (let cursor = await index.openCursor(id); cursor; cursor = await cursor.continue()) {
      await cursor.delete();
    }
    await tx.done;
    this.notify();
  }

  async listCompletions(range?: { from: string; to: string }): Promise<Completion[]> {
    const db = await this.dbPromise;
    if (!range) return db.getAll("completions");
    return db.getAllFromIndex("completions", "byDate", IDBKeyRange.bound(range.from, range.to));
  }

  async setCompleted(habitId: string, date: string, done: boolean): Promise<void> {
    const db = await this.dbPromise;
    const id = completionId(habitId, date);
    if (done) {
      await db.put("completions", { id, habitId, date, completedAt: new Date().toISOString() });
    } else {
      await db.delete("completions", id);
    }
    this.notify();
  }

  async exportData(): Promise<AppData> {
    const db = await this.dbPromise;
    const tx = db.transaction(["habits", "completions"], "readonly");
    const [habits, completions] = await Promise.all([
      tx.objectStore("habits").getAll(),
      tx.objectStore("completions").getAll(),
    ]);
    await tx.done;
    return { habits, completions };
  }

  async replaceAll(data: AppData): Promise<void> {
    const db = await this.dbPromise;
    // Una sola transacción: si algo falla, no se pierde nada.
    const tx = db.transaction(["habits", "completions"], "readwrite");
    const habits = tx.objectStore("habits");
    const completions = tx.objectStore("completions");
    await Promise.all([habits.clear(), completions.clear()]);
    await Promise.all([
      ...data.habits.map((h) => habits.put(h)),
      ...data.completions.map((c) => completions.put(c)),
    ]);
    await tx.done;
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Cierra la base de datos (útil en tests). */
  async close(): Promise<void> {
    this.channel?.close();
    (await this.dbPromise).close();
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  private notify() {
    this.emit();
    this.channel?.postMessage("cambio");
  }
}
