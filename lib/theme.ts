export type ThemeChoice = "auto" | "light" | "dark";

export const THEME_KEY = "habitos-tema";

/** Fondo de cada tema: color de la barra de estado del móvil. */
export const THEME_COLORS = { light: "#f5f0e8", dark: "#15120f" } as const;

// Las etiquetas theme-color de Next.js (una por modo del sistema) las
// gestiona React: no se tocan. Con un tema forzado se añade otra propia al
// principio de <head>, y el navegador usa la primera que encaja.
const META_ID = "tema-forzado";

/**
 * Se ejecuta en <head> antes del primer pintado: aplica el tema guardado
 * (sin parpadeos) y pone la barra de estado del mismo color.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;var m=document.createElement("meta");m.id=${JSON.stringify(META_ID)};m.name="theme-color";m.content=${JSON.stringify(THEME_COLORS)}[t];document.head.prepend(m)}}catch(e){}`;

/** Aplica un tema ya en marcha: atributo de <html> y barra de estado. */
export function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  let meta = document.getElementById(META_ID) as HTMLMetaElement | null;

  if (choice === "auto") {
    delete root.dataset.theme;
    meta?.remove();
    return;
  }

  root.dataset.theme = choice;
  if (!meta) {
    meta = document.createElement("meta");
    meta.id = META_ID;
    meta.name = "theme-color";
    document.head.prepend(meta);
  }
  meta.content = THEME_COLORS[choice];
}
