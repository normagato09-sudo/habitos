"use client";

import { useId, useState, type FormEvent } from "react";
import { EmojiPicker } from "@/components/habits/EmojiPicker";
import { Segmented } from "@/components/ui/Segmented";
import {
  NAME_MAX,
  TIMES_MAX,
  TIMES_MIN,
  draftFromHabit,
  validateDraft,
  type DraftErrors,
  type HabitDraft,
} from "@/lib/domain/habit-draft";
import {
  DEFAULT_GROUPS,
  TIMES_OF_DAY,
  type Habit,
  type HabitInput,
  type Weekday,
} from "@/lib/domain/types";
import { WEEKDAY_INITIALS, WEEKDAY_NAMES, capitalize } from "@/lib/format";

type HabitFormProps = {
  id: string;
  habit?: Habit;
  onSubmit: (input: HabitInput) => void;
};

const ALL_DAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

export function HabitForm({ id, habit, onSubmit }: HabitFormProps) {
  const [draft, setDraft] = useState<HabitDraft>(() => draftFromHabit(habit));
  const [errors, setErrors] = useState<DraftErrors>({});
  const nameId = useId();
  const nameErrorId = useId();
  const daysErrorId = useId();

  const update = (changes: Partial<HabitDraft>) => {
    setDraft((d) => ({ ...d, ...changes }));
    // Los errores se recalculan al cambiar, pero solo si ya se mostraron.
    if (Object.keys(errors).length > 0) {
      const result = validateDraft({ ...draft, ...changes });
      setErrors(result.ok ? {} : result.errors);
    }
  };

  const toggleDay = (day: Weekday) =>
    update({
      days: draft.days.includes(day) ? draft.days.filter((d) => d !== day) : [...draft.days, day],
    });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = validateDraft(draft);
    if (result.ok) {
      onSubmit(result.input);
      return;
    }
    setErrors(result.errors);
    // Llevar el foco al primer campo con error.
    const form = e.currentTarget;
    const target = result.errors.name
      ? form.querySelector<HTMLElement>(`#${CSS.escape(nameId)}`)
      : result.errors.emoji
        ? form.querySelector<HTMLElement>('input[name="emoji"]')
        : form.querySelector<HTMLElement>('input[name="dias"]');
    target?.focus();
  };

  return (
    <form id={id} onSubmit={submit} noValidate className="flex flex-col gap-7 pt-2">
      <div>
        <label htmlFor={nameId} className="mb-2 block font-semibold">
          Nombre
        </label>
        <input
          id={nameId}
          type="text"
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
          maxLength={NAME_MAX}
          autoComplete="off"
          enterKeyHint="done"
          placeholder="Ej.: Beber agua"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? nameErrorId : undefined}
          className={`min-h-14 w-full rounded-2xl border bg-bg px-4 text-lg placeholder:text-ink-soft/70 ${
            errors.name ? "border-danger" : "border-line"
          }`}
        />
        {errors.name && (
          <p id={nameErrorId} className="mt-2 text-sm font-semibold text-danger">
            {errors.name}
          </p>
        )}
      </div>

      <EmojiPicker value={draft.emoji} onChange={(emoji) => update({ emoji })} error={errors.emoji} />

      <div className="flex flex-col gap-4">
        <Segmented
          legend="Frecuencia"
          name="frecuencia"
          value={draft.frequencyType}
          onChange={(frequencyType) => update({ frequencyType })}
          options={[
            { value: "daily", label: "Cada día" },
            { value: "weekdays", label: "Días concretos" },
            { value: "weekly", label: "Veces por semana" },
          ]}
        />

        {draft.frequencyType === "weekdays" && (
          <fieldset aria-describedby={errors.days ? daysErrorId : undefined}>
            <legend className="sr-only">Días de la semana</legend>
            <div className="grid grid-cols-7 gap-1.5">
              {ALL_DAYS.map((day) => (
                <label key={day} className="flex">
                  <input
                    type="checkbox"
                    name="dias"
                    checked={draft.days.includes(day)}
                    onChange={() => toggleDay(day)}
                    aria-label={capitalize(WEEKDAY_NAMES[day - 1])}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="flex aspect-square flex-1 cursor-pointer items-center justify-center rounded-full border-2 border-line font-bold text-ink-soft transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
                  >
                    {WEEKDAY_INITIALS[day - 1]}
                  </span>
                </label>
              ))}
            </div>
            {errors.days && (
              <p id={daysErrorId} className="mt-2 text-sm font-semibold text-danger">
                {errors.days}
              </p>
            )}
          </fieldset>
        )}

        {draft.frequencyType === "weekly" && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 p-2 pl-4">
            <span id={`${id}-veces`} className="font-semibold">
              Veces por semana
            </span>
            <div className="flex items-center gap-1" role="group" aria-labelledby={`${id}-veces`}>
              <button
                type="button"
                aria-label="Una vez menos"
                disabled={draft.times <= TIMES_MIN}
                onClick={() => update({ times: draft.times - 1 })}
                className="flex size-11 items-center justify-center rounded-xl bg-surface text-2xl font-semibold disabled:opacity-40"
              >
                −
              </button>
              <output
                aria-live="polite"
                className="w-10 text-center font-display text-2xl font-semibold tabular-nums"
              >
                {draft.times}
              </output>
              <button
                type="button"
                aria-label="Una vez más"
                disabled={draft.times >= TIMES_MAX}
                onClick={() => update({ times: draft.times + 1 })}
                className="flex size-11 items-center justify-center rounded-xl bg-surface text-2xl font-semibold disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      <Segmented
        legend="Momento del día"
        name="momento"
        value={draft.timeOfDay}
        onChange={(timeOfDay) => update({ timeOfDay })}
        options={TIMES_OF_DAY.map((t) => ({ value: t.id, label: t.label }))}
      />

      <Segmented
        legend="Grupo"
        name="grupo"
        value={draft.group}
        onChange={(group) => update({ group })}
        options={DEFAULT_GROUPS.map((g) => ({ value: g.id, label: g.label }))}
      />
    </form>
  );
}
