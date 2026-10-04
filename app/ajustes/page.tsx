import type { Metadata } from "next";
import { InstallCard } from "@/components/pwa/InstallCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export const metadata: Metadata = { title: "Ajustes" };

export default function AjustesPage() {
  return (
    <>
      <ScreenHeader eyebrow="Tu app" title="Ajustes" />
      <div className="flex flex-col gap-4">
        <InstallCard />
        <EmptyState emoji="⚙️" title="Próximamente">
          Tema claro u oscuro y copias de seguridad.
        </EmptyState>
      </div>
    </>
  );
}
