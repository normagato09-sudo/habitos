"use client";

import { Segmented } from "@/components/ui/Segmented";
import { useTheme } from "@/lib/hooks/useTheme";
import type { ThemeChoice } from "@/lib/theme";

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "auto", label: "Automático" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

export function ThemeCard() {
  const [theme, setTheme] = useTheme();

  return (
    <section aria-labelledby="apariencia" className="rounded-3xl border border-line bg-surface p-5">
      <h2 id="apariencia" className="mb-4 font-display text-xl font-semibold">
        Apariencia
      </h2>
      {theme && (
        <Segmented legend="Tema" name="tema" value={theme} options={OPTIONS} onChange={setTheme} />
      )}
      <p className="mt-2 text-sm text-ink-soft">
        {theme === "auto"
          ? "Sigue el modo claro u oscuro del móvil."
          : "Se usa siempre, aunque el móvil cambie de modo."}
      </p>
    </section>
  );
}
