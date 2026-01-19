"use client";
import { useRef, useEffect } from "react";

type Props = { length?: number; value?: string; onChange?: (v: string) => void };

export default function OTPInput({ length = 6, value = "", onChange }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current = Array(length).fill(null).map((_, i) => refs.current[i] || null);
  }, [length]);

  const val = value.padEnd(length, " ").slice(0, length).split("");

  const handle = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    const next = (value.slice(0, i) + ch + value.slice(i + 1)).slice(0, length);
    onChange?.(next);
    if (ch && refs.current[i + 1]) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !val[i] && refs.current[i - 1]) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex items-center gap-sm">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          inputMode="numeric"
          maxLength={1}
          className="w-12 h-12 rounded-control border border-border text-center text-md"
          value={val[i].trim()}
          onChange={(e) => handle(i, e)}
          onKeyDown={(e) => onKey(i, e)}
        />
      ))}
    </div>
  );
}
