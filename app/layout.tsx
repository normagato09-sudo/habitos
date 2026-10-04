import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { BottomNav } from "@/components/nav/BottomNav";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: { default: "Hábitos", template: "%s · Hábitos" },
  description: "Tus hábitos diarios, de un vistazo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#15120f" },
  ],
};

// Aplica el tema guardado antes del primer pintado para evitar parpadeos.
const themeScript = `try{var t=localStorage.getItem("habitos-tema");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${figtree.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold"
        >
          Saltar al contenido
        </a>
        <div
          id="contenido"
          className="mx-auto w-full max-w-lg px-4 pt-[calc(var(--safe-top)+1rem)] pb-[calc(var(--nav-h)+var(--safe-bottom)+1.5rem)]"
        >
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
