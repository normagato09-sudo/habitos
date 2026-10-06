# Hábitos

App de hábitos en español, pensada para el móvil e instalable como PWA.

## Qué hace

- **Hoy**: los hábitos que tocan cada día, por momento (mañana, tarde, noche)
  y grupo. Se marcan con un toque; se puede ir a días pasados para marcarlos
  y ver los futuros. Muestra la racha de cada hábito.
- **Hábitos**: crear, editar y borrar. Frecuencia diaria, días concretos o
  veces por semana.
- **Estadísticas**: cumplimiento por semana, mes o año, comparado con el
  periodo anterior; rachas y detalle por hábito.
- **Ajustes**: tema (automático, claro u oscuro), copias de seguridad e
  instrucciones para instalar la app.
- `/diseno` es una página interna para revisar el sistema de diseño; no
  aparece en la navegación.

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

- El service worker solo se registra en producción (`npm run build && npm start`).
- Páginas: primero la red y, sin conexión, la copia guardada.
  Archivos de `/_next/static`: desde la caché.
- Cada despliegue genera un `/sw.js` distinto; la app avisa con
  «Hay una versión nueva» y se actualiza al pulsar «Actualizar».

## Datos y copias de seguridad

- Todo se guarda solo en el navegador del móvil (IndexedDB); no hay servidor.
- En Ajustes, «Guardar copia» descarga un archivo `habitos-copia-AAAA-MM-DD.json`
  con los hábitos y los días marcados. «Restaurar una copia» lo comprueba antes
  de tocar nada y, tras confirmar, sustituye todos los datos de una sola vez.
- El tema (automático, claro u oscuro) se guarda en `localStorage`.
