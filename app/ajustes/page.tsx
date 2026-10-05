import type { Metadata } from "next";
import { InstallCard } from "@/components/pwa/InstallCard";
import { BackupCard } from "@/components/settings/BackupCard";
import { ThemeCard } from "@/components/settings/ThemeCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export const metadata: Metadata = { title: "Ajustes" };

export default function AjustesPage() {
  return (
    <>
      <ScreenHeader eyebrow="Tu app" title="Ajustes" />
      <div className="flex flex-col gap-4">
        <ThemeCard />
        <BackupCard />
        <InstallCard />
      </div>
    </>
  );
}
