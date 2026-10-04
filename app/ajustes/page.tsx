import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export const metadata: Metadata = { title: "Ajustes" };

export default function AjustesPage() {
  return (
    <>
      <ScreenHeader eyebrow="Tu app" title="Ajustes" />
      <EmptyState emoji="⚙️" title="Próximamente">
        Tema claro u oscuro y copias de seguridad.
      </EmptyState>
    </>
  );
}
