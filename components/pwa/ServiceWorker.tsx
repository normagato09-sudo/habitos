"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
// Se importa aquí para empezar a escuchar el evento de instalación cuanto antes.
import "@/lib/pwa/install";

/**
 * Registra el service worker y avisa cuando hay una versión nueva de la app.
 * Solo en producción: en desarrollo la caché estorbaría.
 */
export function ServiceWorker() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const updating = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    const watch = (reg: ServiceWorkerRegistration) => {
      // Solo hay "versión nueva" si ya había una funcionando.
      if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(worker);
          }
        });
      });
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        registration = reg;
        watch(reg);
      })
      .catch((error) => console.error("No se pudo registrar el service worker", error));

    // Al volver a la app, comprobar si hay un despliegue nuevo.
    const onVisible = () => {
      if (document.visibilityState === "visible") void registration?.update();
    };
    const onControllerChange = () => {
      if (updating.current) window.location.reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  if (!waiting) return null;

  return (
    <div
      role="status"
      className="animate-rise-in fixed inset-x-0 bottom-[calc(var(--nav-h)+var(--safe-bottom)+0.75rem)] z-50 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center gap-3 rounded-3xl bg-ink py-2.5 pr-2.5 pl-5 text-bg shadow-lg"
    >
      <p className="flex-1 font-semibold">Hay una versión nueva</p>
      <Button
        onClick={() => {
          updating.current = true;
          waiting.postMessage({ type: "SKIP_WAITING" });
        }}
      >
        Actualizar
      </Button>
    </div>
  );
}
