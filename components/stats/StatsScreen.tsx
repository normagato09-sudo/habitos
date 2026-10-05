"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";
import { PeriodChart } from "@/components/stats/PeriodChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Segmented } from "@/components/ui/Segmented";
import { useCompletions, useHabits } from "@/lib/data/hooks";
import { groupCompletions } from "@/lib/domain/completions";
import {
  firstStartDate,
  periodBuckets,
  periodContaining,
  periodIncludes,
  shiftPeriod,
  type Period,
  type PeriodKind,
} from "@/lib/domain/period";
import { habitRate, overallRate, type Rate } from "@/lib/domain/stats";
import { computeStreak, type Streak } from "@/lib/domain/streaks";
import type { DateKey, Habit } from "@/lib/domain/types";
import { formatMonthYear, formatPercent, formatShortRange, plural } from "@/lib/format";
import { useToday } from "@/lib/hooks/useToday";

const KINDS: { value: PeriodKind; label: string }[] = [
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
  { value: "ano", label: "Año" },
];

const PREVIOUS: Record<PeriodKind, string> = {
  semana: "la semana anterior",
  mes: "el mes anterior",
  ano: "el año anterior",
};

function periodTitle(period: Period, today: DateKey): string {
  const current = periodContaining(period.kind, today);
  switch (period.kind) {
    case "semana":
      if (period.from === current.from) return "Esta semana";
      if (period.from === shiftPeriod(current, -1).from) return "La semana pasada";
      return formatShortRange(period.from, period.to);
    case "mes":
      return formatMonthYear(period.from);
    case "ano":
      return period.from.slice(0, 4);
  }
}

function streakText({ current, unit }: Pick<Streak, "current" | "unit">): string {
  return unit === "dias" ? plural(current, "día", "días") : plural(current, "semana", "semanas");
}

export function StatsScreen() {
  const today = useToday();
  const habits = useHabits();
  const completions = useCompletions();
  const [kind, setKind] = useState<PeriodKind>("semana");
  // null = el periodo que contiene hoy.
  const [anchor, setAnchor] = useState<DateKey | null>(null);
  const [selected, setSelected] = useState<DateKey | null>(null);

  const doneByHabit = useMemo(
    () => groupCompletions(completions.data ?? []),
    [completions.data],
  );

  if (habits.error || completions.error) {
    return (
      <>
        <ScreenHeader eyebrow="Tu progreso" title="Estadísticas" />
        <EmptyState emoji="😕" title="No se han podido cargar tus datos">
          Prueba a recargar la página.
        </EmptyState>
      </>
    );
  }

  if (!today || !habits.data || !completions.data) return <StatsSkeleton />;

  if (habits.data.length === 0) {
    return (
      <>
        <ScreenHeader eyebrow="Tu progreso" title="Estadísticas" />
        <EmptyState emoji="📈" title="Aún no hay datos">
          <Link href="/habitos" className="font-semibold text-accent underline underline-offset-4">
            Crea un hábito
          </Link>{" "}
          y, cuando lo marques, aquí verás tu cumplimiento y tus mejores rachas.
        </EmptyState>
      </>
    );
  }

  const period = periodContaining(kind, anchor ?? today);
  const isCurrent = periodIncludes(period, today);
  const first = firstStartDate(habits.data) ?? today;
  // Solo cuentan los hábitos que ya existían en el periodo.
  const active = habits.data.filter((h) => h.startDate <= period.to);
  const rate = overallRate(active, doneByHabit, period.from, period.to, today);
  const previous = shiftPeriod(period, -1);
  const previousRate =
    previous.to >= first
      ? overallRate(habits.data, doneByHabit, previous.from, previous.to, today)
      : null;
  const buckets = periodBuckets(period, active, doneByHabit, today);

  const goTo = (next: Period) => {
    setSelected(null);
    setAnchor(periodIncludes(next, today) ? null : next.from);
  };

  return (
    <>
      <ScreenHeader eyebrow="Tu progreso" title="Estadísticas" />

      <div className="mb-4">
        <Segmented
          legend="Periodo"
          name="periodo"
          value={kind}
          options={KINDS}
          onChange={(k) => {
            setKind(k);
            setAnchor(null);
            setSelected(null);
          }}
        />
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-semibold" aria-live="polite">
          {periodTitle(period, today)}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => goTo(shiftPeriod(period, -1))}
            disabled={period.from <= first}
            aria-label="Periodo anterior"
            className="flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => goTo(shiftPeriod(period, 1))}
            disabled={isCurrent}
            aria-label="Periodo siguiente"
            className="flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>

      <Summary
        rate={rate}
        previous={previousRate}
        previousLabel={PREVIOUS[kind]}
        isCurrent={isCurrent}
      />

      <PeriodChart
        kind={kind}
        buckets={buckets}
        today={today}
        selected={selected}
        onSelect={setSelected}
      />

      <Streaks habits={habits.data} doneByHabit={doneByHabit} today={today} />

      <section aria-labelledby="por-habito">
        <h2
          id="por-habito"
          className="mb-3 text-sm font-bold tracking-wider text-ink-soft uppercase"
        >
          Por hábito
        </h2>
        {active.length === 0 ? (
          <p className="rounded-2xl bg-surface-2 px-4 py-3 text-ink-soft">
            Ningún hábito había empezado todavía en este periodo.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {active.map((habit) => (
              <HabitStatsRow
                key={habit.id}
                habit={habit}
                rate={habitRate(
                  habit,
                  doneByHabit.get(habit.id) ?? new Set(),
                  period.from,
                  period.to,
                  today,
                )}
                streak={computeStreak(habit, doneByHabit.get(habit.id) ?? new Set(), today)}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Summary({
  rate,
  previous,
  previousLabel,
  isCurrent,
}: {
  rate: Rate;
  previous: Rate | null;
  previousLabel: string;
  isCurrent: boolean;
}) {
  if (rate.rate === null) {
    return (
      <p className="mb-6 rounded-2xl bg-surface-2 px-4 py-3 text-ink-soft">
        {isCurrent
          ? "Aún no has marcado nada en este periodo. Lo que hagas hoy aparecerá aquí."
          : "En este periodo no había nada que hacer."}
      </p>
    );
  }

  const delta =
    previous?.rate != null ? Math.round(rate.rate * 100) - Math.round(previous.rate * 100) : null;

  return (
    <div className="mb-6">
      <p className="flex items-baseline gap-3">
        <span className="font-display text-5xl font-semibold tabular-nums">
          {formatPercent(rate.rate)}
        </span>
        <span className="text-ink-soft">
          {rate.done} de {rate.expected} hechas
        </span>
      </p>
      {delta !== null && (
        <p className="mt-1 text-sm text-ink-soft">
          {delta === 0 ? (
            <>Igual que {previousLabel}</>
          ) : (
            <>
              <span className="font-semibold text-ink">
                <span aria-hidden="true">{delta > 0 ? "↑ " : "↓ "}</span>
                {plural(Math.abs(delta), "punto", "puntos")} {delta > 0 ? "más" : "menos"}
              </span>{" "}
              que {previousLabel}
            </>
          )}
        </p>
      )}
    </div>
  );
}

function Streaks({
  habits,
  doneByHabit,
  today,
}: {
  habits: Habit[];
  doneByHabit: ReadonlyMap<string, ReadonlySet<string>>;
  today: DateKey;
}) {
  const streaks = habits.map((habit) => ({
    habit,
    streak: computeStreak(habit, doneByHabit.get(habit.id) ?? new Set(), today),
  }));
  const current = streaks.reduce((a, b) => (b.streak.current > a.streak.current ? b : a));
  const best = streaks.reduce((a, b) => (b.streak.best > a.streak.best ? b : a));

  const tiles = [
    { title: "Racha actual", value: current.streak.current, entry: current },
    { title: "Mejor racha", value: best.streak.best, entry: best },
  ];

  return (
    <section aria-label="Rachas" className="mb-8 grid grid-cols-2 gap-2.5">
      {tiles.map(({ title, value, entry }) => (
        <div key={title} className="rounded-3xl bg-surface-2 p-4">
          <h2 className="text-sm font-semibold text-ink-soft">{title}</h2>
          {value === 0 ? (
            <p className="mt-1 font-display text-2xl font-semibold">—</p>
          ) : (
            <>
              <p className="mt-1 font-display text-2xl font-semibold">
                <span aria-hidden="true">🔥 </span>
                {streakText({ current: value, unit: entry.streak.unit })}
              </p>
              <p className="mt-0.5 truncate text-sm text-ink-soft">
                <span aria-hidden="true">{entry.habit.emoji} </span>
                {entry.habit.name}
              </p>
            </>
          )}
        </div>
      ))}
    </section>
  );
}

function HabitStatsRow({ habit, rate, streak }: { habit: Habit; rate: Rate; streak: Streak }) {
  return (
    <li className="flex items-center gap-3.5 rounded-3xl border border-line bg-surface p-3 pr-4">
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-bg text-[1.6rem]"
        aria-hidden="true"
      >
        {habit.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[1.05rem] leading-snug font-semibold">{habit.name}</p>
          <p className="shrink-0 font-semibold tabular-nums">
            {rate.rate === null ? "—" : formatPercent(rate.rate)}
          </p>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-label={`Cumplimiento de ${habit.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rate.rate === null ? undefined : Math.round(rate.rate * 100)}
        >
          {rate.rate !== null && (
            <div
              className="h-full rounded-full bg-success transition-[width] duration-500 ease-out"
              style={{ width: `${rate.rate * 100}%` }}
            />
          )}
        </div>
        <p className="mt-1.5 flex flex-wrap gap-x-3 text-sm text-ink-soft">
          <span>
            {rate.rate === null ? "Sin datos en este periodo" : `${rate.done} de ${rate.expected}`}
          </span>
          {streak.best > 0 && (
            <span>
              <span aria-hidden="true">🔥 </span>
              {streak.current > 0 ? (
                <>
                  <span className="sr-only">Racha: </span>
                  {streakText(streak)}
                </>
              ) : (
                "Sin racha"
              )}{" "}
              · récord {streakText({ current: streak.best, unit: streak.unit })}
            </span>
          )}
        </p>
      </div>
    </li>
  );
}

function StatsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando tus estadísticas">
      <div className="mb-6 pt-2">
        <div className="h-4 w-32 rounded-full bg-surface-2" />
        <div className="mt-3 h-10 w-48 rounded-xl bg-surface-2" />
      </div>
      <div className="mb-6 h-12 rounded-2xl bg-surface-2" />
      <div className="mb-6 h-14 w-40 rounded-xl bg-surface-2" />
      <div className="h-60 rounded-3xl bg-surface-2 motion-safe:animate-pulse" />
    </div>
  );
}
