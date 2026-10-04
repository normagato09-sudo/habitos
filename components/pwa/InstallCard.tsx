"use client";

import { Button } from "@/components/ui/Button";
import { useInstallState } from "@/lib/pwa/install";

export function InstallCard() {
  const state = useInstallState();
  if (!state) return null;

  return (
    <section aria-labelledby="instalar" className="rounded-3xl border border-line bg-surface p-5">
      <h2 id="instalar" className="font-display text-xl font-semibold">
        {state.kind === "installed" ? "App instalada" : "Instala Hábitos"}
      </h2>

      {state.kind === "installed" && (
        <p className="mt-1 text-ink-soft">
          Ya la usas como app: a pantalla completa y también sin conexión.
        </p>
      )}

      {state.kind === "prompt" && (
        <>
          <p className="mt-1 mb-4 text-ink-soft">
            Tenla en tu pantalla de inicio, a pantalla completa y sin conexión.
          </p>
          <Button block size="lg" onClick={() => void state.install()}>
            Instalar app
          </Button>
        </>
      )}

      {state.kind === "ios" && (
        <>
          <p className="mt-1 text-ink-soft">En Safari, para tenerla en tu pantalla de inicio:</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>
              Pulsa el botón <strong>Compartir</strong> (el cuadrado con la flecha hacia arriba).
            </li>
            <li>
              Elige <strong>Añadir a pantalla de inicio</strong>.
            </li>
            <li>
              Pulsa <strong>Añadir</strong>.
            </li>
          </ol>
        </>
      )}

      {state.kind === "manual" && (
        <p className="mt-1 text-ink-soft">
          Abre el menú del navegador y elige <strong>Instalar app</strong> o{" "}
          <strong>Añadir a pantalla de inicio</strong>.
        </p>
      )}
    </section>
  );
}
