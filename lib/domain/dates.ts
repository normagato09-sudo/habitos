import type { DateKey, Weekday } from "./types";

// Todas las fechas se tratan en hora local, sin horas: así un hábito
// marcado "hoy" es hoy para el usuario, esté donde esté.

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now);
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = fromDateKey(key);
  return toDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days));
}

/** 1 = lunes … 7 = domingo. */
export function weekdayOf(key: DateKey): Weekday {
  const day = fromDateKey(key).getDay(); // 0 = domingo
  return (day === 0 ? 7 : day) as Weekday;
}

/** Lunes de la semana que contiene la fecha. */
export function startOfWeek(key: DateKey): DateKey {
  return addDays(key, 1 - weekdayOf(key));
}

/** Los 7 días (lunes a domingo) de la semana que contiene la fecha. */
export function weekDays(key: DateKey): DateKey[] {
  const monday = startOfWeek(key);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Días entre dos fechas, ambas incluidas. Vacío si from > to. */
export function daysBetween(from: DateKey, to: DateKey): DateKey[] {
  const days: DateKey[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return days;
}

export function startOfMonth(key: DateKey): DateKey {
  return `${key.slice(0, 7)}-01`;
}

export function endOfMonth(key: DateKey): DateKey {
  const date = fromDateKey(key);
  return toDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function minKey(a: DateKey, b: DateKey): DateKey {
  return a < b ? a : b;
}

export function maxKey(a: DateKey, b: DateKey): DateKey {
  return a > b ? a : b;
}
