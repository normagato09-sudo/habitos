import type { ReactNode } from "react";

type EmptyStateProps = {
  emoji: string;
  title: string;
  children?: ReactNode;
};

export function EmptyState({ emoji, title, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-12 text-center">
      <span className="text-5xl" aria-hidden="true">
        {emoji}
      </span>
      <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
      {children && <div className="mt-2 max-w-xs text-ink-soft">{children}</div>}
    </div>
  );
}
