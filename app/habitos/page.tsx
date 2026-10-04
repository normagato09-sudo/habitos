import type { Metadata } from "next";
import { HabitsScreen } from "@/components/habits/HabitsScreen";

export const metadata: Metadata = { title: { absolute: "Mis hábitos" } };

export default function HabitosPage() {
  return <HabitsScreen />;
}
