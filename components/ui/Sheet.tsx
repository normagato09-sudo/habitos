"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconClose } from "@/components/icons";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Panel que sube desde abajo, basado en <dialog> nativo:
 * gestiona el foco, la tecla Escape y el fondo inerte por nosotros.
 */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="sheet m-0 mt-auto w-full p-0 sm:mx-auto sm:max-w-lg"
    >
      <div className="flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[1.75rem] bg-surface pb-[var(--safe-bottom)]">
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line" aria-hidden="true" />
        <header className="flex items-center justify-between gap-3 px-5 pt-3 pb-2">
          <h2 id={titleId} className="font-display text-2xl font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
          >
            <IconClose />
          </button>
        </header>
        {/* min-h-0: sin esto, el contenido largo no se encoge y se desplaza todo el panel. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
        {footer && <footer className="border-t border-line px-5 py-4">{footer}</footer>}
      </div>
    </dialog>
  );
}
