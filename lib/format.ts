import { addDays, fromDateKey } from "@/lib/domain/dates";
import type { DateKey, Frequency } from "@/lib/domain/types";

const longDate = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const weekdayName = new Intl.DateTimeFormat("es-ES", { weekday: "long" });
const monthYear = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });

export const WEEKDAY_INITIALS = ["L", "M", "X", "J", "V", "S", "D"];

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "jueves, 1 de octubre" */
export function formatLongDate(date: DateKey): string {
  return longDate.format(fromDateKey(date));
}

/** "Octubre de 2026" */
export function formatMonthYear(date: DateKey): string {
  return capitalize(monthYear.format(fromDateKey(date)));
}

/** "Hoy", "Ayer", "Mañana" o el nombre del día ("Jueves"). */
export function relativeDayName(date: DateKey, today: DateKey): string {
  if (date === today) return "Hoy";
  if (date === addDays(today, -1)) return "Ayer";
  if (date === addDays(today, 1)) return "Mañana";
  return capitalize(weekdayName.format(fromDateKey(date)));
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Nombres de los días, de lunes (índice 0) a domingo. */
export const WEEKDAY_NAMES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

/** "a, b y c" */
export function listJoin(items: string[]): string {
  return items.length <= 1
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

/** "Cada día", "Martes, jueves y domingo", "3 veces por semana"… */
export function describeFrequency(frequency: Frequency): string {
  switch (frequency.type) {
    case "daily":
      return "Cada día";
    case "weekly":
      return frequency.times === 1 ? "1 vez por semana" : `${frequency.times} veces por semana`;
    case "weekdays": {
      const days = [...frequency.days].sort((a, b) => a - b);
      const key = days.join("");
      if (key === "1234567") return "Cada día";
      if (key === "12345") return "De lunes a viernes";
      if (key === "67") return "Fines de semana";
      return capitalize(listJoin(days.map((d) => WEEKDAY_NAMES[d - 1])));
    }
  }
}
