import type { ReactNode } from "react";

type ScreenHeaderProps = {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function ScreenHeader({ title, eyebrow, action }: ScreenHeaderProps) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4 pt-2">
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold tracking-wide text-ink-soft uppercase">{eyebrow}</p>
        )}
        <h1 className="font-display text-[2.5rem] leading-[1.05] font-semibold tracking-tight">
          {title}
        </h1>
      </div>
      {action}
    </header>
  );
}
