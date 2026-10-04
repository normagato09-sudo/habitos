import type { Metadata } from "next";
import { DesignShowcase } from "./DesignShowcase";

// Página interna para revisar el sistema de diseño. No aparece en la navegación.
export const metadata: Metadata = {
  title: "Diseño",
  robots: { index: false, follow: false },
};

export default function DisenoPage() {
  return <DesignShowcase />;
}
