import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { BottomNav } from "@/components/nav/BottomNav";
import { ServiceWorker } from "@/components/pwa/ServiceWorker";
import { THEME_COLORS, THEME_SCRIPT } from "@/lib/theme";
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
  applicationName: "Hábitos",
  appleWebApp: { capable: true, title: "Hábitos", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${figtree.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
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
        <ServiceWorker />
      </body>
    </html>
  );
}
