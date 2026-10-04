"use client";

import { useSyncExternalStore } from "react";

/** Evento de Chrome/Edge/Android para instalar la app (no estándar). */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallState =
  | { kind: "installed" }
  | { kind: "prompt"; install: () => Promise<void> }
  | { kind: "ios" }
  | { kind: "manual" };

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    emit();
  });
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

async function install() {
  if (!deferred) return;
  const event = deferred;
  deferred = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === "accepted") installed = true;
  emit();
}

const STATES = {
  installed: { kind: "installed" },
  prompt: { kind: "prompt", install },
  ios: { kind: "ios" },
  manual: { kind: "manual" },
} as const satisfies Record<InstallState["kind"], InstallState>;

function snapshot(): InstallState {
  if (installed || isStandalone()) return STATES.installed;
  if (deferred) return STATES.prompt;
  if (isIos()) return STATES.ios;
  return STATES.manual;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Cómo se puede instalar la app en este dispositivo; `null` en el servidor. */
export function useInstallState(): InstallState | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}
