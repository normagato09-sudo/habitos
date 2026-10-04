/*
 * Service worker de Hábitos.
 *
 * Se sirve desde /sw.js (app/sw.js/route.ts), que antepone la constante
 * VERSION con el identificador del despliegue. Así cada despliegue cambia
 * el archivo, el navegador detecta la versión nueva y la app avisa.
 *
 * Estrategias:
 * - Páginas: primero la red (para tener siempre lo último) y, sin conexión,
 *   la copia guardada.
 * - /_next/static: primero la caché (son archivos con hash, no cambian).
 * - Resto (iconos, manifest): la caché al instante y se refresca por detrás.
 */
/* global VERSION */

const CACHE = `habitos-${VERSION}`;
const PAGES = ["/", "/habitos", "/estadisticas", "/ajustes"];
const EXTRA = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
];
const NETWORK_TIMEOUT_MS = 4000;

// Recursos que aparecen en el HTML: JS, CSS, fuentes e iconos.
const ASSET_PATTERNS = [
  /\/_next\/static\/[^"'\\\s)<>]+/g,
  /\/(?:icon|apple-icon)[^"'\\\s)<>]*\.(?:svg|png)(?:\?[^"'\\\s)<>]*)?/g,
];

self.addEventListener("install", (event) => {
  event.waitUntil(precache());
});

async function precache() {
  const cache = await caches.open(CACHE);
  const assets = new Set(EXTRA);

  // Las páginas son imprescindibles: si alguna falla, la instalación falla.
  await Promise.all(
    PAGES.map(async (path) => {
      const response = await fetch(path, { cache: "reload" });
      if (!response.ok) throw new Error(`No se pudo guardar ${path}: ${response.status}`);
      const html = await response.clone().text();
      await cache.put(path, response);
      for (const pattern of ASSET_PATTERNS) {
        for (const match of html.matchAll(pattern)) assets.add(match[0].replace(/&amp;/g, "&"));
      }
    }),
  );

  // Los recursos, uno a uno: que falle uno no impide el resto.
  await Promise.allSettled([...assets].map((url) => cache.add(url)));
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key.startsWith("habitos-") && key !== CACHE).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

// La app pide activar la versión nueva cuando el usuario pulsa "Actualizar".
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(page(request, url));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
  } else if (request.headers.has("RSC") || url.searchParams.has("_rsc")) {
    // Datos de navegación de Next: siempre de la red. Sin conexión, Next
    // recarga la página entera y la sirve la estrategia de páginas.
    return;
  } else {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});

async function page(request, url) {
  const cache = await caches.open(CACHE);
  const key = url.pathname.replace(/\/$/, "") || "/";
  try {
    const response = await withTimeout(fetch(request), NETWORK_TIMEOUT_MS);
    if (response.ok) await cache.put(key, response.clone());
    return response;
  } catch {
    const cached = (await cache.match(key)) ?? (await cache.match("/"));
    return cached ?? offlineResponse();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return (await network) ?? Response.error();
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function offlineResponse() {
  return new Response(
    '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sin conexión · Hábitos</title><body style="font-family:system-ui;background:#f5f0e8;color:#1d1a16;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px"><div><h1>Sin conexión</h1><p>Abre Hábitos una vez con internet para poder usarla sin conexión.</p></div></body></html>',
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
