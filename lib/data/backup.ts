import {
  TIMES_OF_DAY,
  completionId,
  type Completion,
  type Frequency,
  type Habit,
  type Weekday,
} from "@/lib/domain/types";

/** Todo lo que guarda la app: lo que va en una copia de seguridad. */
export type AppData = { habits: Habit[]; completions: Completion[] };

/** Formato del archivo de copia. `version` permite cambiarlo en el futuro. */
export type BackupFile = AppData & {
  app: "habitos";
  version: 1;
  exportedAt: string;
};

export type ParseResult = { ok: true; data: AppData } | { ok: false; error: string };

export function buildBackup(data: AppData, now: Date = new Date()): BackupFile {
  return { app: "habitos", version: 1, exportedAt: now.toISOString(), ...data };
}

/** "habitos-copia-2026-10-05.json" */
export function backupFileName(date: string): string {
  return `habitos-copia-${date}.json`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Raw = Record<string, unknown>;

const isObject = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
const isDate = (v: unknown): v is string => typeof v === "string" && DATE_RE.test(v);

function parseFrequency(v: unknown): Frequency | null {
  if (!isObject(v)) return null;
  switch (v.type) {
    case "daily":
      return { type: "daily" };
    case "weekly":
      return Number.isInteger(v.times) && (v.times as number) >= 1 && (v.times as number) <= 7
        ? { type: "weekly", times: v.times as number }
        : null;
    case "weekdays": {
      const days = v.days;
      if (!Array.isArray(days) || days.length === 0) return null;
      if (!days.every((d) => Number.isInteger(d) && d >= 1 && d <= 7)) return null;
      return { type: "weekdays", days: [...new Set(days as Weekday[])] };
    }
    default:
      return null;
  }
}

function parseHabit(v: unknown): Habit | null {
  if (!isObject(v)) return null;
  const frequency = parseFrequency(v.frequency);
  const timeOfDay = TIMES_OF_DAY.find((t) => t.id === v.timeOfDay)?.id;
  if (
    !isText(v.id) ||
    !isText(v.name) ||
    !isText(v.emoji) ||
    !frequency ||
    !timeOfDay ||
    !isText(v.group) ||
    !isDate(v.startDate) ||
    typeof v.order !== "number" ||
    !isText(v.createdAt) ||
    !isText(v.updatedAt)
  ) {
    return null;
  }
  return {
    id: v.id,
    name: v.name.trim(),
    emoji: v.emoji,
    frequency,
    timeOfDay,
    group: v.group,
    startDate: v.startDate,
    order: v.order,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

/**
 * Lee un archivo de copia y comprueba que es válido antes de tocar nada.
 * Los días marcados de hábitos que no están en la copia se descartan.
 */
export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "El archivo no es una copia de Hábitos." };
  }
  if (!isObject(raw) || raw.app !== "habitos") {
    return { ok: false, error: "El archivo no es una copia de Hábitos." };
  }
  if (raw.version !== 1) {
    return { ok: false, error: "Esta copia es de una versión más nueva de la app. Actualízala y vuelve a probar." };
  }
  if (!Array.isArray(raw.habits) || !Array.isArray(raw.completions)) {
    return { ok: false, error: "La copia está incompleta o dañada." };
  }

  const habits: Habit[] = [];
  for (const item of raw.habits) {
    const habit = parseHabit(item);
    if (!habit) return { ok: false, error: "La copia está incompleta o dañada." };
    habits.push(habit);
  }

  const ids = new Set(habits.map((h) => h.id));
  const completions = new Map<string, Completion>();
  for (const item of raw.completions) {
    if (!isObject(item) || !isText(item.habitId) || !isDate(item.date)) {
      return { ok: false, error: "La copia está incompleta o dañada." };
    }
    if (!ids.has(item.habitId)) continue;
    const id = completionId(item.habitId, item.date);
    completions.set(id, {
      id,
      habitId: item.habitId,
      date: item.date,
      completedAt: isText(item.completedAt) ? item.completedAt : `${item.date}T12:00:00.000Z`,
    });
  }

  return { ok: true, data: { habits, completions: [...completions.values()] } };
}
