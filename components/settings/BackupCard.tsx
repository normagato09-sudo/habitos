"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getRepository } from "@/lib/data";
import { backupFileName, buildBackup, parseBackup, type AppData } from "@/lib/data/backup";
import { addDays, todayKey } from "@/lib/domain/dates";
import { formatLongDate, plural } from "@/lib/format";

const LAST_BACKUP_KEY = "habitos-ultima-copia";

// Fecha de la última copia guardada en este navegador (solo informativa).
const lastBackupListeners = new Set<() => void>();
function readLastBackup(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}
function subscribeLastBackup(onChange: () => void) {
  lastBackupListeners.add(onChange);
  return () => lastBackupListeners.delete(onChange);
}
function saveLastBackup(date: string) {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, date);
  } catch {
    // No pasa nada: solo es un recordatorio.
  }
  lastBackupListeners.forEach((l) => l());
}

function lastBackupText(date: string | null): string {
  if (!date) return "Aún no has guardado ninguna copia.";
  const today = todayKey();
  const when =
    date === today ? "hoy" : date === addDays(today, -1) ? "ayer" : `el ${formatLongDate(date)}`;
  return `Última copia: ${when}.`;
}

function summary({ habits, completions }: AppData): string {
  return `${plural(habits.length, "hábito", "hábitos")} y ${plural(completions.length, "día marcado", "días marcados")}`;
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

type Message = { kind: "ok" | "error"; text: string };

export function BackupCard() {
  const lastBackup = useSyncExternalStore(subscribeLastBackup, readLastBackup, () => null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [pending, setPending] = useState<{ incoming: AppData; current: AppData } | null>(null);

  const save = async () => {
    try {
      const data = await getRepository().exportData();
      const today = todayKey();
      const name = backupFileName(today);
      download(name, JSON.stringify(buildBackup(data), null, 2));
      saveLastBackup(today);
      setMessage({ kind: "ok", text: `Copia guardada en «${name}», con ${summary(data)}.` });
    } catch {
      setMessage({ kind: "error", text: "No se ha podido guardar la copia. Prueba otra vez." });
    }
  };

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setMessage(null);
    const result = parseBackup(await file.text());
    if (!result.ok) {
      setMessage({ kind: "error", text: result.error });
      return;
    }
    setPending({ incoming: result.data, current: await getRepository().exportData() });
  };

  const restore = async () => {
    if (!pending) return;
    const { incoming } = pending;
    setPending(null);
    try {
      await getRepository().replaceAll(incoming);
      setMessage({ kind: "ok", text: `Copia restaurada: ${summary(incoming)}.` });
    } catch {
      setMessage({ kind: "error", text: "No se ha podido restaurar la copia. Tus datos no han cambiado." });
    }
  };

  return (
    <section aria-labelledby="copias" className="rounded-3xl border border-line bg-surface p-5">
      <h2 id="copias" className="font-display text-xl font-semibold">
        Copia de seguridad
      </h2>
      <p className="mt-1 text-ink-soft">
        Tus hábitos se guardan solo en este móvil. Guarda una copia de vez en cuando para no
        perderlos si cambias de móvil o borras los datos del navegador.
      </p>
      <p className="mt-3 text-sm font-semibold text-ink-soft">{lastBackupText(lastBackup)}</p>

      <div className="mt-4 flex flex-col gap-2.5">
        <Button block size="lg" onClick={() => void save()}>
          Guardar copia
        </Button>
        <Button block size="lg" variant="secondary" onClick={() => fileInput.current?.click()}>
          Restaurar una copia
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            void pick(e.target.files?.[0]);
            // Permite volver a elegir el mismo archivo.
            e.target.value = "";
          }}
        />
      </div>

      {message && (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={`mt-4 rounded-2xl px-4 py-3 ${
            message.kind === "error" ? "bg-accent-soft text-ink" : "bg-success-soft text-ink"
          }`}
        >
          <span aria-hidden="true">{message.kind === "error" ? "⚠️ " : "✅ "}</span>
          {message.text}
        </p>
      )}

      <ConfirmDialog
        open={pending !== null}
        destructive
        title="¿Restaurar esta copia?"
        description={
          pending && (
            <>
              Se sustituirán tus datos actuales ({summary(pending.current)}) por los de la copia (
              {summary(pending.incoming)}). No se puede deshacer.
            </>
          )
        }
        confirmLabel="Restaurar"
        onConfirm={() => void restore()}
        onCancel={() => setPending(null)}
      />
    </section>
  );
}
