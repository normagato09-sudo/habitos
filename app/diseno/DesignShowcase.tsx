"use client";

import { useState } from "react";
import { IconPlus, IconTrash } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Sheet } from "@/components/ui/Sheet";

const MOMENTOS = [
  { label: "Mañana", className: "bg-manana" },
  { label: "Tarde", className: "bg-tarde" },
  { label: "Noche", className: "bg-noche" },
  { label: "Cuando sea", className: "bg-cuando" },
];

const COLORES = [
  "bg-bg",
  "bg-surface",
  "bg-surface-2",
  "bg-ink",
  "bg-ink-soft",
  "bg-line",
  "bg-accent",
  "bg-accent-soft",
  "bg-success",
  "bg-danger",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">{title}</h2>
      {children}
    </section>
  );
}

export function DesignShowcase() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <ScreenHeader eyebrow="Interno" title="Diseño" />

      <Section title="Tipografía">
        <p className="font-display text-4xl font-semibold tracking-tight">Lavarme los dientes</p>
        <p className="mt-2 text-lg">Texto normal en Figtree, cómodo de leer en el móvil.</p>
        <p className="mt-1 text-ink-soft">Texto secundario con buen contraste.</p>
      </Section>

      <Section title="Colores">
        <div className="grid grid-cols-5 gap-2">
          {COLORES.map((c) => (
            <div key={c} className="text-center text-[0.7rem] text-ink-soft">
              <div className={`h-12 rounded-xl border border-line ${c}`} />
              {c.replace("bg-", "")}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Momentos del día">
        <div className="flex flex-wrap gap-2">
          {MOMENTOS.map((m) => (
            <span
              key={m.label}
              className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold"
            >
              <span className={`size-2.5 rounded-full ${m.className}`} aria-hidden="true" />
              {m.label}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Botones">
        <div className="flex flex-col gap-3">
          <Button size="lg" block onClick={() => setSheetOpen(true)}>
            <IconPlus /> Abrir panel inferior
          </Button>
          <Button variant="secondary" block>
            Secundario
          </Button>
          <Button variant="ghost" block>
            Discreto
          </Button>
          <Button variant="danger" block onClick={() => setConfirmOpen(true)}>
            <IconTrash /> Abrir confirmación
          </Button>
          <Button block disabled>
            Desactivado
          </Button>
        </div>
      </Section>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Nuevo hábito"
        footer={
          <Button block size="lg" onClick={() => setSheetOpen(false)}>
            Guardar
          </Button>
        }
      >
        <p className="text-ink-soft">
          Aquí irá el formulario. Se cierra con la X, con Escape o tocando fuera.
        </p>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        destructive
        title="¿Borrar «Ducharme»?"
        description="Se borrarán también su historial y su racha. No se puede deshacer."
        confirmLabel="Borrar"
        onConfirm={() => setConfirmOpen(false)}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
