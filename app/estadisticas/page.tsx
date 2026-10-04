import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export const metadata: Metadata = { title: "Estadísticas" };

export default function EstadisticasPage() {
  return (
    <>
      <ScreenHeader eyebrow="Tu progreso" title="Estadísticas" />
      <EmptyState emoji="📈" title="Aún no hay datos">
        Cuando marques hábitos, aquí verás tu cumplimiento y tus mejores rachas.
      </EmptyState>
    </>
  );
}
