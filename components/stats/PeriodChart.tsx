"use client";

import { weekdayOf } from "@/lib/domain/dates";
import type { Bucket, PeriodKind } from "@/lib/domain/period";
import type { DateKey } from "@/lib/domain/types";
import { WEEKDAY_INITIALS, capitalize, formatLongDate, formatMonth, formatPercent } from "@/lib/format";

type PeriodChartProps = {
  kind: PeriodKind;
  buckets: Bucket[];
  today: DateKey;
  selected: DateKey | null;
  onSelect: (from: DateKey | null) => void;
};

/** Texto de un tramo: "Martes, 29 de septiembre: 2 de 3 hechas (67%)". */
export function bucketText(kind: PeriodKind, bucket: Bucket, today: DateKey): string {
  const name = kind === "ano" ? formatMonth(bucket.from) : capitalize(formatLongDate(bucket.from));
  const { done, expected, rate } = bucket.rate;
  if (bucket.from > today) return `${name}: aún no ha llegado`;
  if (rate === null) return `${name}: sin nada que contar`;
  return `${name}: ${done} de ${expected} hechas (${formatPercent(rate)})`;
}

/** Relleno del calendario: de la superficie al verde según el cumplimiento. */
function heatColor(rate: number): string {
  return `color-mix(in oklab, var(--success) ${Math.round(18 + rate * 82)}%, var(--surface-2))`;
}

/**
 * Gráfico del periodo. Semana y año: barras (días o meses).
 * Mes: calendario con cada día coloreado según lo hecho.
 * Cada tramo es un botón: al tocarlo se muestra su detalle encima.
 */
export function PeriodChart(props: PeriodChartProps) {
  const { kind, buckets, today, selected } = props;
  const detail = buckets.find((b) => b.from === selected);

  return (
    <figure className="mb-8 rounded-3xl border border-line bg-surface p-4">
      <figcaption
        className="mb-3 min-h-10 text-sm leading-snug text-ink-soft"
        aria-live="polite"
      >
        {detail ? (
          <span className="font-semibold text-ink">{bucketText(kind, detail, today)}</span>
        ) : kind === "mes" ? (
          "Cada día, más intenso cuanto más hiciste. Toca un día para ver el detalle."
        ) : (
          `Porcentaje hecho cada ${kind === "ano" ? "mes" : "día"}. Toca una barra para ver el detalle.`
        )}
      </figcaption>

      {kind === "mes" ? (
        <MonthCalendar {...props} />
      ) : (
        <Bars {...props} />
      )}
    </figure>
  );
}

function Bars({ kind, buckets, today, selected, onSelect }: PeriodChartProps) {
  return (
    <ol className={`grid h-44 gap-1.5 ${kind === "ano" ? "grid-cols-12" : "grid-cols-7"}`}>
      {buckets.map((bucket, i) => {
        const { rate } = bucket.rate;
        const isSelected = bucket.from === selected;
        const isCurrent = bucket.from <= today && today <= bucket.to;
        const label = kind === "ano" ? formatMonth(bucket.from).charAt(0) : WEEKDAY_INITIALS[i];
        return (
          <li key={bucket.from} className="flex min-w-0">
            <button
              type="button"
              onClick={() => onSelect(isSelected ? null : bucket.from)}
              aria-pressed={isSelected}
              aria-label={bucketText(kind, bucket, today)}
              className={`flex w-full flex-col items-stretch gap-1.5 rounded-xl px-0.5 pt-1 pb-0.5 transition-colors ${
                isSelected ? "ring-2 ring-ink" : ""
              }`}
            >
              <span className="relative flex-1 overflow-hidden rounded-[4px] bg-surface-2">
                {rate !== null && (
                  <span
                    className="absolute inset-x-0 bottom-0 rounded-t-[4px] bg-success transition-[height] duration-500 ease-out"
                    style={{ height: rate === 0 ? "2px" : `${rate * 100}%` }}
                  />
                )}
              </span>
              <span
                className={`text-center text-xs leading-none font-semibold ${
                  isCurrent ? "text-accent" : "text-ink-soft"
                }`}
              >
                {label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function MonthCalendar({ kind, buckets, today, selected, onSelect }: PeriodChartProps) {
  const offset = weekdayOf(buckets[0].from) - 1;

  return (
    <>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5" aria-hidden="true">
        {WEEKDAY_INITIALS.map((d) => (
          <span key={d} className="text-center text-xs font-semibold text-ink-soft">
            {d}
          </span>
        ))}
      </div>
      <ol className="grid grid-cols-7 gap-1.5">
        {buckets.map((bucket, i) => {
          const { rate } = bucket.rate;
          const isSelected = bucket.from === selected;
          const isToday = bucket.from === today;
          return (
            <li key={bucket.from} style={i === 0 ? { gridColumnStart: offset + 1 } : undefined}>
              <button
                type="button"
                onClick={() => onSelect(isSelected ? null : bucket.from)}
                aria-pressed={isSelected}
                aria-label={bucketText(kind, bucket, today)}
                className={`flex aspect-square w-full items-center justify-center rounded-xl text-sm font-semibold tabular-nums ${
                  rate === null
                    ? "text-ink-soft"
                    : rate >= 0.75
                      ? "text-surface"
                      : "text-ink"
                } ${isSelected ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : isToday ? "ring-2 ring-accent" : ""} ${
                  bucket.from > today ? "opacity-50" : ""
                }`}
                style={rate !== null ? { background: heatColor(rate) } : undefined}
              >
                {Number(bucket.from.slice(8))}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-ink-soft" aria-hidden="true">
        0%
        {[0, 0.25, 0.5, 0.75, 1].map((r) => (
          <span key={r} className="size-3.5 rounded-[4px]" style={{ background: heatColor(r) }} />
        ))}
        100%
      </div>
    </>
  );
}
