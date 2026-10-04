import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function HoyPage() {
  return (
    <>
      <ScreenHeader eyebrow="Tu día" title="Hoy" />
      <EmptyState emoji="🌱" title="Aquí verás tus hábitos de hoy">
        Muy pronto podrás marcarlos con un toque.
      </EmptyState>
    </>
  );
}
