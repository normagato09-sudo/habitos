import type { Metadata } from "next";
import { StatsScreen } from "@/components/stats/StatsScreen";

export const metadata: Metadata = { title: "Estadísticas" };

export default function EstadisticasPage() {
  return <StatsScreen />;
}
