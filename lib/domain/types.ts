/** Fecha local en formato "YYYY-MM-DD". Se compara bien como texto. */
export type DateKey = string;

/** Día de la semana ISO: 1 = lunes … 7 = domingo. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Frequency =
  | { type: "daily" }
  | { type: "weekdays"; days: Weekday[] }
  | { type: "weekly"; times: number };

export type TimeOfDay = "manana" | "tarde" | "noche" | "cualquiera";

/** Texto libre para poder añadir más grupos sin migrar datos. */
export type GroupId = string;

export type Reminder = {
  enabled: boolean;
  /** Hora local "HH:MM". */
  time: string;
};

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  frequency: Frequency;
  timeOfDay: TimeOfDay;
  group: GroupId;
  reminder: Reminder | null;
  /** Primer día en que el hábito cuenta (para rachas y estadísticas). */
  startDate: DateKey;
  /** Posición en las listas. */
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type Completion = {
  /** `${habitId}:${date}`: un hábito se completa como mucho una vez al día. */
  id: string;
  habitId: string;
  date: DateKey;
  completedAt: string;
};

/** Datos que el usuario rellena al crear o editar un hábito. */
export type HabitInput = Pick<
  Habit,
  "name" | "emoji" | "frequency" | "timeOfDay" | "group" | "reminder"
> &
  Partial<Pick<Habit, "startDate">>;

export const DEFAULT_GROUPS: { id: GroupId; label: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "casa", label: "Casa" },
];

export const TIMES_OF_DAY: { id: TimeOfDay; label: string }[] = [
  { id: "manana", label: "Mañana" },
  { id: "tarde", label: "Tarde" },
  { id: "noche", label: "Noche" },
  { id: "cualquiera", label: "Cuando sea" },
];

export function completionId(habitId: string, date: DateKey): string {
  return `${habitId}:${date}`;
}
