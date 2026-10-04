"use client";

import { useId } from "react";

const EMOJIS = [
  "✨", "🪥", "🚿", "💧", "🛏️", "😴", "💊", "🧴",
  "🏃", "🚶", "🧘", "🏋️", "🚴", "🥗", "🍎", "☕",
  "📚", "✍️", "🧠", "💻", "🎸", "🌱", "🙏", "📞",
  "🧹", "🧺", "🍽️", "🗑️", "🛒", "🪴", "🐶", "💰",
];

/** Primer carácter visible (un emoji puede ocupar varios caracteres). */
function firstGrapheme(text: string): string {
  const segment = new Intl.Segmenter("es", { granularity: "grapheme" }).segment(text.trim());
  return segment[Symbol.iterator]().next().value?.segment ?? "";
}

type EmojiPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
  error?: string;
};

export function EmojiPicker({ value, onChange, error }: EmojiPickerProps) {
  const customId = useId();
  const errorId = useId();
  const isCustom = value !== "" && !EMOJIS.includes(value);

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="mb-2 font-semibold">Icono</legend>
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((emoji) => (
          <label key={emoji} className="flex">
            <input
              type="radio"
              name="emoji"
              value={emoji}
              checked={value === emoji}
              onChange={() => onChange(emoji)}
              className="peer sr-only"
            />
            <span className="flex aspect-square flex-1 cursor-pointer items-center justify-center rounded-xl text-[1.45rem] transition-colors peer-checked:bg-accent-soft peer-checked:ring-2 peer-checked:ring-accent peer-focus-visible:outline-3 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-accent hover:bg-surface-2">
              {emoji}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <label htmlFor={customId} className="text-sm text-ink-soft">
          ¿Otro? Escríbelo aquí:
        </label>
        <input
          id={customId}
          type="text"
          inputMode="text"
          autoComplete="off"
          value={isCustom ? value : ""}
          onChange={(e) => {
            const emoji = firstGrapheme(e.target.value);
            if (emoji) onChange(emoji);
          }}
          placeholder="🙂"
          className={`size-12 rounded-xl border bg-surface text-center text-2xl ${
            isCustom ? "border-accent ring-2 ring-accent" : "border-line"
          }`}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
