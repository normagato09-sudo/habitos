"use client";

import type { ReactNode } from "react";

type Option<T extends string> = { value: T; label: ReactNode };

type SegmentedProps<T extends string> = {
  legend: string;
  name: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

/**
 * Selector de una opción entre varias. Usa radios nativos, así que funciona
 * con lector de pantalla y con las flechas del teclado sin código extra.
 */
export function Segmented<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{legend}</legend>
      <div
        className="grid gap-1 rounded-2xl bg-surface-2 p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <label key={option.value} className="flex">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl px-1.5 py-1 text-center text-[0.9rem] leading-tight font-semibold text-ink-soft transition-colors peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-[0_1px_2px_rgb(0_0_0/0.1)] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-accent hover:text-ink">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
