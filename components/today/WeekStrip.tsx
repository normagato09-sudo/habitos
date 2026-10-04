"use client";

import { IconChevronLeft, IconChevronRight } from "@/components/icons";
import { weekDays } from "@/lib/domain/dates";
import type { DateKey } from "@/lib/domain/types";
import { WEEKDAY_INITIALS, formatLongDate, formatMonthYear } from "@/lib/format";

export type DayProgress = { total: number; completed: number };

type WeekStripProps = {
  selected: DateKey;
  today: DateKey;
  progress: (date: DateKey) => DayProgress;
  onSelect: (date: DateKey) => void;
  onShiftWeek: (direction: -1 | 1) => void;
};

function ProgressRing({ total, completed, muted }: DayProgress & { muted: boolean }) {
  const r = 7;
  const c = 2 * Math.PI * r;
  const ratio = total === 0 ? 0 : completed / total;
  const full = total > 0 && completed === total;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="mt-1">
      <circle
        cx="9"
        cy="9"
        r={r}
        fill={full ? "var(--success)" : "none"}
        stroke={total === 0 ? "transparent" : "var(--line)"}
        strokeWidth="2.5"
      />
      {!full && ratio > 0 && !muted && (
        <circle
          cx="9"
          cy="9"
          r={r}
          fill="none"
          stroke="var(--success)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${c * ratio} ${c}`}
          transform="rotate(-90 9 9)"
        />
      )}
      {full && (
        <path
          d="m5.5 9.2 2.3 2.3 4.7-4.9"
          fill="none"
          stroke="var(--surface)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function WeekStrip({ selected, today, progress, onSelect, onShiftWeek }: WeekStripProps) {
  const days = weekDays(selected);

  return (
    <section aria-label="Semana" className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-semibold text-ink-soft" aria-live="polite">
          {formatMonthYear(days[3])}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onShiftWeek(-1)}
            aria-label="Semana anterior"
            className="flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => onShiftWeek(1)}
            aria-label="Semana siguiente"
            className="flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>

      <ol className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          const isSelected = date === selected;
          const isToday = date === today;
          const isFuture = date > today;
          const p = progress(date);
          const status =
            p.total === 0
              ? "sin hábitos"
              : isFuture
                ? `${p.total} por hacer`
                : `${p.completed} de ${p.total} hechas`;
          return (
            <li key={date}>
              <button
                type="button"
                onClick={() => onSelect(date)}
                aria-pressed={isSelected}
                aria-current={isToday ? "date" : undefined}
                aria-label={`${formatLongDate(date)}${isToday ? " (hoy)" : ""}: ${status}`}
                className={`flex w-full flex-col items-center rounded-2xl pt-1.5 pb-2 transition-colors ${
                  isSelected
                    ? "bg-ink text-bg"
                    : isToday
                      ? "bg-accent-soft text-ink"
                      : "text-ink hover:bg-surface-2"
                } ${isFuture && !isSelected ? "opacity-60" : ""}`}
              >
                <span className={`text-xs font-semibold ${isSelected ? "" : "text-ink-soft"}`}>
                  {WEEKDAY_INITIALS[i]}
                </span>
                <span className="text-lg leading-tight font-semibold tabular-nums">
                  {Number(date.slice(8))}
                </span>
                <ProgressRing {...p} muted={isFuture} />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
