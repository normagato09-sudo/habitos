# Hábitos

App de hábitos en español, pensada para el móvil e instalable como PWA.

## Tecnología

- Next.js (App Router) + TypeScript + Tailwind CSS
- Datos locales en IndexedDB detrás de una capa de datos propia (`lib/data`),
  preparada para añadir cuentas y sincronización más adelante
- Despliegue automático en Vercel con cada push a `main`

## Estructura

```
app/          Rutas y pantallas (App Router)
components/   Componentes de interfaz reutilizables
lib/domain/   Lógica pura: frecuencias, rachas, estadísticas
lib/data/     Acceso a datos (repositorio + IndexedDB)
public/       Iconos y recursos estáticos
```

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```
