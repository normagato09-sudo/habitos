import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export const metadata: Metadata = { title: { absolute: "Mis hábitos" } };

export default function HabitosPage() {
  return (
    <>
      <ScreenHeader eyebrow="Tu lista" title="Hábitos" />
      <EmptyState emoji="📝" title="Todavía no hay hábitos">
        Aquí podrás crear, editar y organizar tus hábitos.
      </EmptyState>
    </>
  );
}
