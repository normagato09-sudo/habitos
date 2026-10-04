import { addDays, fromDateKey } from "@/lib/domain/dates";
import type { DateKey } from "@/lib/domain/types";

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
