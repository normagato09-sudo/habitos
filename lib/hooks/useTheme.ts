"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY, applyTheme, type ThemeChoice } from "@/lib/theme";

const listeners = new Set<() => void>();
// Por si el navegador no deja guardar (modo privado): el tema dura la sesión.
let unsaved: ThemeChoice = "auto";

function read(): ThemeChoice {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "auto";
  } catch {
    return unsaved;
  }
}

// Si se cambia en otra pestaña, esta también se pone al día.
function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_KEY) return;
    applyTheme(read());
    onChange();
  };
  listeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function setTheme(choice: ThemeChoice) {
  unsaved = choice;
  try {
    if (choice === "auto") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Se queda en `unsaved`.
  }
  applyTheme(choice);
  listeners.forEach((l) => l());
}

/** Tema elegido; `null` durante el renderizado en servidor. */
export function useTheme(): [ThemeChoice | null, (choice: ThemeChoice) => void] {
  const theme = useSyncExternalStore(subscribe, read, () => null);
  return [theme, setTheme];
}
