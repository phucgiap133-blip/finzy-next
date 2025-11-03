"use client";

import { useMenu } from "./MenuProvider";

type Props = { className?: string };

export default function MenuButton({ className = "" }: Props) {
  const { toggleMenu } = useMenu();

  return (
    <button
      type="button"
      onClick={toggleMenu}
      aria-label="Mở menu"
      className={
        className ||
        "inline-flex items-center justify-center w-9 h-9 rounded-control border border-border bg-bg-card hover:shadow-sm"
      }
    >
      <span className="i">≡</span>
    </button>
  );
}
