"use client";

import { useSyncExternalStore } from "react";
import { todayKey } from "@/lib/domain/dates";
import type { DateKey } from "@/lib/domain/types";

// Revisa la fecha cada minuto y al volver a la app, para que "hoy"
// cambie solo a medianoche aunque la app se quede abierta.
function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  document.addEventListener("visibilitychange", onChange);
  window.addEventListener("focus", onChange);
  return () => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", onChange);
    window.removeEventListener("focus", onChange);
  };
}

/** Fecha de hoy en el navegador; `null` durante el renderizado en servidor. */
export function useToday(): DateKey | null {
  return useSyncExternalStore(subscribe, () => todayKey(), () => null);
}
