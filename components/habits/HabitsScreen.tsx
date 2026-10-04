"use client";

import { useState } from "react";
import { HabitForm } from "@/components/habits/HabitForm";
import { IconChevronRight, IconPlus, IconTrash } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Sheet } from "@/components/ui/Sheet";
import { getRepository } from "@/lib/data";
import { useHabits } from "@/lib/data/hooks";
import { groupLabel } from "@/lib/domain/day-plan";
import { DEFAULT_GROUPS, TIMES_OF_DAY, type Habit, type HabitInput } from "@/lib/domain/types";
import { describeFrequency } from "@/lib/format";

const FORM_ID = "habit-form";

const TIME_DOT: Record<Habit["timeOfDay"], string> = {
  manana: "bg-manana",
  tarde: "bg-tarde",
  noche: "bg-noche",
  cualquiera: "bg-cuando",
};

/** Hábitos agrupados por grupo, en el orden Personal, Casa y el resto. */
function byGroup(habits: Habit[]) {
  const ids = [
    ...DEFAULT_GROUPS.map((g) => g.id),
    ...[...new Set(habits.map((h) => h.group))].filter((g) => !DEFAULT_GROUPS.some((d) => d.id === g)).sort(),
  ];
  return ids
    .map((id) => ({ id, label: groupLabel(id), habits: habits.filter((h) => h.group === id) }))
    .filter((g) => g.habits.length > 0);
}

type Editing = { mode: "new" } | { mode: "edit"; habit: Habit };

export function HabitsScreen() {
  const habits = useHabits();
  const [editing, setEditing] = useState<Editing | null>(null);
  // Cambia en cada apertura para que el formulario empiece de cero.
  const [formKey, setFormKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const open = (next: Editing) => {
    setFormKey((k) => k + 1);
    setEditing(next);
  };
  const close = () => {
    setConfirmDelete(false);
    setEditing(null);
  };

  const save = async (input: HabitInput) => {
    const repo = getRepository();
    if (editing?.mode === "edit") await repo.updateHabit(editing.habit.id, input);
    else await repo.createHabit(input);
    close();
  };

  const remove = async () => {
    if (editing?.mode !== "edit") return;
    await getRepository().deleteHabit(editing.habit.id);
    close();
  };

  const newButton = (
    <Button onClick={() => open({ mode: "new" })} className="mb-1">
      <IconPlus width={20} height={20} /> Nuevo
    </Button>
  );

  return (
    <>
      <ScreenHeader eyebrow="Tu lista" title="Hábitos" action={newButton} />

      {habits.error ? (
        <EmptyState emoji="😕" title="No se han podido cargar tus hábitos">
          Prueba a recargar la página.
        </EmptyState>
      ) : !habits.data ? (
        <div aria-busy="true" aria-label="Cargando tus hábitos" className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[4.5rem] rounded-3xl bg-surface-2 motion-safe:animate-pulse" />
          ))}
        </div>
      ) : habits.data.length === 0 ? (
        <EmptyState emoji="🌱" title="Todavía no hay hábitos">
          <p className="mb-5">Empieza por algo pequeño que quieras hacer a menudo.</p>
          <Button size="lg" onClick={() => open({ mode: "new" })}>
            <IconPlus /> Crear mi primer hábito
          </Button>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-7">
          {byGroup(habits.data).map((group) => (
            <section key={group.id} aria-labelledby={`grupo-${group.id}`}>
              <h2
                id={`grupo-${group.id}`}
                className="mb-3 flex items-baseline justify-between text-sm font-bold tracking-wider text-ink-soft uppercase"
              >
                {group.label}
                <span className="font-semibold tracking-normal normal-case tabular-nums">
                  {group.habits.length}
                </span>
              </h2>
              <ul className="flex flex-col gap-2.5">
                {group.habits.map((habit) => (
                  <li key={habit.id}>
                    <button
                      type="button"
                      onClick={() => open({ mode: "edit", habit })}
                      className="flex min-h-[4.5rem] w-full items-center gap-3.5 rounded-3xl border border-line bg-surface p-3 pr-3 text-left transition-transform active:scale-[0.985]"
                    >
                      <span
                        className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-bg text-[1.6rem]"
                        aria-hidden="true"
                      >
                        {habit.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[1.05rem] leading-snug font-semibold">
                          {habit.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
                          {describeFrequency(habit.frequency)}
                          <span aria-hidden="true">·</span>
                          <span
                            className={`size-2 rounded-full ${TIME_DOT[habit.timeOfDay]}`}
                            aria-hidden="true"
                          />
                          {TIMES_OF_DAY.find((t) => t.id === habit.timeOfDay)?.label}
                        </span>
                      </span>
                      <IconChevronRight className="shrink-0 text-ink-soft" />
                      <span className="sr-only">Editar</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Sheet
        open={editing !== null}
        onClose={close}
        title={editing?.mode === "edit" ? "Editar hábito" : "Nuevo hábito"}
        footer={
          <Button type="submit" form={FORM_ID} block size="lg">
            {editing?.mode === "edit" ? "Guardar cambios" : "Crear hábito"}
          </Button>
        }
      >
        {editing && (
          <>
            <HabitForm
              key={formKey}
              id={FORM_ID}
              habit={editing.mode === "edit" ? editing.habit : undefined}
              onSubmit={(input) => void save(input)}
            />
            {editing.mode === "edit" && (
              <Button
                variant="ghost"
                block
                onClick={() => setConfirmDelete(true)}
                className="mt-8 text-danger"
              >
                <IconTrash width={20} height={20} /> Borrar hábito
              </Button>
            )}
          </>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmDelete}
        destructive
        title={editing?.mode === "edit" ? `¿Borrar «${editing.habit.name}»?` : "¿Borrar el hábito?"}
        description="Se borrarán también su historial y su racha. No se puede deshacer."
        confirmLabel="Borrar"
        onConfirm={() => void remove()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
