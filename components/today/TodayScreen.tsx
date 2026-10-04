"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HabitRow } from "@/components/today/HabitRow";
import { WeekStrip } from "@/components/today/WeekStrip";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { getRepository } from "@/lib/data";
import { useCompletions, useHabits } from "@/lib/data/hooks";
import { groupCompletions } from "@/lib/domain/completions";
import { addDays } from "@/lib/domain/dates";
import { buildDayPlan, type DayPlan } from "@/lib/domain/day-plan";
import { computeStreak } from "@/lib/domain/streaks";
import type { DateKey } from "@/lib/domain/types";
import { capitalize, formatLongDate, relativeDayName } from "@/lib/format";
import { useToday } from "@/lib/hooks/useToday";

const SECTION_DOT: Record<string, string> = {
  manana: "bg-manana",
  tarde: "bg-tarde",
  noche: "bg-noche",
  cualquiera: "bg-cuando",
};

export function TodayScreen() {
  const today = useToday();
  // null = seguir el día de hoy (también cuando cambia a medianoche).
  const [picked, setPicked] = useState<DateKey | null>(null);
  const habits = useHabits();
  const completions = useCompletions();

  const doneByHabit = useMemo(
    () => groupCompletions(completions.data ?? []),
    [completions.data],
  );

  if (habits.error || completions.error) {
    return (
      <>
        <ScreenHeader title="Hoy" />
        <EmptyState emoji="😕" title="No se han podido cargar tus hábitos">
          Prueba a recargar la página. Si usas el modo privado del navegador, puede que no
          permita guardar datos.
        </EmptyState>
      </>
    );
  }

  if (!today || !habits.data || !completions.data) return <TodaySkeleton />;

  const date = picked ?? today;
  const isToday = date === today;
  const isFuture = date > today;
  const allHabits = habits.data;
  const plan = buildDayPlan(allHabits, doneByHabit, date);

  const toggle = (habitId: string, done: boolean) => {
    void getRepository().setCompleted(habitId, date, done);
  };

  return (
    <>
      <ScreenHeader
        eyebrow={capitalize(formatLongDate(date))}
        title={relativeDayName(date, today)}
        action={
          !isToday && (
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="mb-1 min-h-11 rounded-full bg-surface-2 px-4 font-semibold"
            >
              Ir a hoy
            </button>
          )
        }
      />

      <WeekStrip
        selected={date}
        today={today}
        progress={(d) => buildDayPlan(allHabits, doneByHabit, d)}
        onSelect={(d) => setPicked(d === today ? null : d)}
        onShiftWeek={(dir) => {
          const next = addDays(date, dir * 7);
          setPicked(next === today ? null : next);
        }}
      />

      {allHabits.length === 0 ? (
        <EmptyState emoji="🌱" title="Aún no tienes hábitos">
          <Link href="/habitos" className="font-semibold text-accent underline underline-offset-4">
            Crea tu primer hábito
          </Link>{" "}
          y aparecerá aquí los días que toque.
        </EmptyState>
      ) : plan.total === 0 ? (
        <EmptyState emoji="☕" title="Nada para este día">
          No hay ningún hábito programado. Disfruta del descanso.
        </EmptyState>
      ) : (
        <>
          <DaySummary plan={plan} isToday={isToday} isFuture={isFuture} />

          <div className="flex flex-col gap-7">
            {plan.sections.map((section) => (
              <section key={section.timeOfDay} aria-labelledby={`momento-${section.timeOfDay}`}>
                <h2
                  id={`momento-${section.timeOfDay}`}
                  className="mb-3 flex items-center gap-2.5 text-sm font-bold tracking-wider text-ink-soft uppercase"
                >
                  <span
                    className={`size-2.5 rounded-full ${SECTION_DOT[section.timeOfDay]}`}
                    aria-hidden="true"
                  />
                  {section.label}
                  {!isFuture && (
                    <span className="ml-auto font-semibold tabular-nums normal-case tracking-normal">
                      {section.completed}/{section.total}
                    </span>
                  )}
                </h2>

                {section.groups.map((group) => (
                  <div key={group.group} className="mb-3 last:mb-0">
                    {section.groups.length > 1 && (
                      <h3 className="mb-2 ml-1 text-sm font-semibold text-ink-soft">
                        {group.label}
                      </h3>
                    )}
                    <ul className="flex flex-col gap-2.5">
                      {group.items.map((item) => (
                        <li key={item.habit.id}>
                          <HabitRow
                            item={item}
                            streak={computeStreak(
                              item.habit,
                              doneByHabit.get(item.habit.id) ?? new Set(),
                              today,
                            )}
                            readOnly={isFuture}
                            onToggle={(done) => toggle(item.habit.id, done)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function DaySummary({
  plan,
  isToday,
  isFuture,
}: {
  plan: DayPlan;
  isToday: boolean;
  isFuture: boolean;
}) {
  const { total, completed } = plan;
  const allDone = total > 0 && completed === total;

  if (isFuture) {
    return (
      <p className="mb-6 rounded-2xl bg-surface-2 px-4 py-3 text-ink-soft">
        Este día aún no ha llegado: puedes ver lo que toca, pero no marcarlo.
      </p>
    );
  }

  return (
    <div className="mb-7">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-lg font-semibold" aria-live="polite" aria-atomic="true">
          <span className="font-display text-3xl tabular-nums">{completed}</span>
          <span className="text-ink-soft"> de {total} hechas</span>
        </p>
        <p className="text-sm font-semibold text-ink-soft tabular-nums">
          {Math.round((completed / total) * 100)}%
        </p>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-label="Progreso del día"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
      >
        <div
          className="h-full rounded-full bg-success transition-[width] duration-500 ease-out"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>

      {allDone && (
        <div
          role="status"
          className="animate-rise-in mt-4 flex items-center gap-3 rounded-3xl bg-success-soft px-4 py-3.5"
        >
          <span className="text-3xl" aria-hidden="true">
            🎉
          </span>
          <div>
            <p className="font-display text-lg font-semibold">
              {isToday ? "¡Todo hecho por hoy!" : "¡Día completado!"}
            </p>
            <p className="text-sm text-ink-soft">
              {isToday ? "Buen trabajo. Mañana, más." : "Hiciste todo lo que tocaba."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando tus hábitos">
      <div className="mb-6 pt-2">
        <div className="h-4 w-40 rounded-full bg-surface-2" />
        <div className="mt-3 h-10 w-28 rounded-xl bg-surface-2" />
      </div>
      <div className="mb-8 h-20 rounded-2xl bg-surface-2" />
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[4.75rem] rounded-3xl bg-surface-2 motion-safe:animate-pulse" />
        ))}
      </div>
    </div>
  );
}
