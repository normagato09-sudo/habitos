"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { IconHabits, IconSettings, IconStats, IconToday } from "@/components/icons";

type Tab = {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const TABS: Tab[] = [
  { href: "/", label: "Hoy", Icon: IconToday },
  { href: "/habitos", label: "Hábitos", Icon: IconHabits },
  { href: "/estadisticas", label: "Estadísticas", Icon: IconStats },
  { href: "/ajustes", label: "Ajustes", Icon: IconSettings },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[var(--safe-bottom)] backdrop-blur-md select-none"
    >
      <ul className="mx-auto grid h-[var(--nav-h)] max-w-lg grid-cols-4 px-2">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[0.75rem] font-semibold transition-colors ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                    active ? "bg-accent-soft text-accent" : "group-active:scale-90"
                  }`}
                >
                  <Icon width={22} height={22} strokeWidth={active ? 2.2 : 1.9} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
