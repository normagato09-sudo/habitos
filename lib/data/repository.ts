import type { Completion, DateKey, Habit, HabitInput } from "@/lib/domain/types";

/**
 * Contrato de acceso a datos. La interfaz no sabe dónde viven los datos:
 * hoy es IndexedDB (local); mañana puede ser una versión que además
 * sincronice con un servidor, sin cambiar las pantallas.
 */
export interface HabitRepository {
  /** Hábitos ordenados por `order`. */
  listHabits(): Promise<Habit[]>;
  getHabit(id: string): Promise<Habit | undefined>;
  createHabit(input: HabitInput): Promise<Habit>;
  updateHabit(id: string, changes: Partial<HabitInput>): Promise<Habit>;
  /** Borra el hábito y todo su historial. */
  deleteHabit(id: string): Promise<void>;

  /** Compleciones entre dos fechas (incluidas); sin fechas, todas. */
  listCompletions(range?: { from: DateKey; to: DateKey }): Promise<Completion[]>;
  setCompleted(habitId: string, date: DateKey, done: boolean): Promise<void>;

  /** Avisa cuando cambian los datos (también desde otra pestaña). */
  subscribe(listener: () => void): () => void;
}
