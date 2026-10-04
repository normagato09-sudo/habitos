"use client";

import { useState } from "react";
import type { DayItem } from "@/lib/domain/day-plan";
import type { Streak } from "@/lib/domain/streaks";
import { plural } from "@/lib/format";

type HabitRowProps = {
  item: DayItem;
  streak: Streak;
  readOnly: boolean;
  onToggle: (done: boolean) => void;
};

function streakText({ current, unit }: Streak): string {
  return unit === "dias"
    ? plural(current, "día", "días")
    : plural(current, "semana", "semanas");
}

export function HabitRow({ item, streak, readOnly, onToggle }: HabitRowProps) {
  const { habit, done, weekly } = item;
  const [pop, setPop] = useState(false);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-disabled={readOnly || undefined}
      onClick={() => {
        if (readOnly) return;
        if (!done) {
          setPop(true);
          navigator.vibrate?.(12);
        }
        onToggle(!done);
      }}
      className={`group flex min-h-[4.75rem] w-full items-center gap-3.5 rounded-3xl border p-3 pr-4 text-left transition-[background-color,border-color,transform] duration-200 ${
        done ? "border-transparent bg-success-soft" : "border-line bg-surface"
      } ${readOnly ? "cursor-default" : "active:scale-[0.985]"}`}
    >
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-bg text-[1.6rem] leading-none"
        aria-hidden="true"
      >
        {habit.emoji}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-[1.05rem] leading-snug font-semibold transition-colors ${
            done ? "text-ink-soft" : "text-ink"
          }`}
        >
          {habit.name}
        </span>
        {(streak.current > 0 || weekly) && (
          <span className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-ink-soft">
            {streak.current > 0 && (
              <span>
                <span aria-hidden="true">🔥 </span>
                <span className="sr-only">Racha: </span>
                {streakText(streak)}
              </span>
            )}
            {weekly && (
              <span>
                {weekly.done} de {weekly.times} esta semana
              </span>
            )}
          </span>
        )}
      </span>

      <span
        aria-hidden="true"
        onAnimationEnd={() => setPop(false)}
        className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
          done
            ? "border-success bg-success text-surface"
            : readOnly
              ? "border-dashed border-line"
              : "border-ink-soft/40 group-hover:border-ink-soft"
        } ${pop ? "animate-check-pop" : ""}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m5 12.5 4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={24}
            strokeDashoffset={done ? 0 : 24}
            className="transition-[stroke-dashoffset] duration-300 ease-out"
          />
        </svg>
      </span>
    </button>
  );
}
