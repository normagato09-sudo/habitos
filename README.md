# Hábitos

App de hábitos en español, pensada para el móvil e instalable como PWA.

## Tecnología

- Next.js (App Router) + TypeScript + Tailwind CSS
- Datos locales en IndexedDB detrás de una capa de datos propia (`lib/data`),
  preparada para añadir cuentas y sincronización más adelante
- PWA instalable: manifest, iconos propios y service worker propio
  (`lib/pwa/sw.js`, servido en `/sw.js`) que permite usarla sin conexión
- Despliegue automático en Vercel con cada push a `main`

## Estructura

```
app/          Rutas y pantallas (App Router)
components/   Componentes de interfaz reutilizables
lib/domain/   Lógica pura: frecuencias, rachas, estadísticas
lib/data/     Acceso a datos (repositorio + IndexedDB)
lib/pwa/      Service worker e instalación de la app
assets/       SVG originales del icono (`npm run icons` genera los PNG)
public/       Iconos y recursos estáticos
```

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm test         # tests de lógica y datos (Vitest)
npm run build
```

## PWA

- El service worker solo se registra en producción (> habitos@0.1.0 build
> next build

▲ Next.js 16.3.8 (Turbopack)
✓ Running next.config.ts took 23ms

  Creating an optimized production build ...
✓ Compiled successfully in 203ms
  Running TypeScript ...
  Finished TypeScript in 1476ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/11) ...
  Generating static pages using 7 workers (2/11) 
  Generating static pages using 7 workers (5/11) 
  Generating static pages using 7 workers (8/11) 
✓ Generating static pages using 7 workers (11/11) in 269ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /ajustes
├ ○ /apple-icon.png
├ ○ /diseno
├ ○ /estadisticas
├ ○ /habitos
├ ○ /icon.svg
├ ○ /manifest.webmanifest
└ ○ /sw.js


○  (Static)  prerendered as static content

Unknown command: "start"


Did you mean one of these?
  npm star # Mark your favorite packages
  npm stars # View packages marked as favorites
  npm start # Start a package
To see a list of supported npm commands, run:
  npm help).
- Páginas: primero la red y, sin conexión, la copia guardada.
  Archivos de : desde la caché.
- Cada despliegue genera un  distinto; la app avisa con
  «Hay una versión nueva» y se actualiza al pulsar «Actualizar».
