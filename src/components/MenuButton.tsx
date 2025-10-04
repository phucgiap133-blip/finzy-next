"use client";

type Props = { className?: string };

export default function MenuButton({ className = "" }: Props) {
  // dùng trong Header nên chắc chắn ở trong MenuProvider
  const { toggleMenu } = require("./MenuProvider") as typeof import("./MenuProvider");
  const ctx = (toggleMenu as any) ? require("./MenuProvider").useMenu() : null;
  const { toggleMenu: t } = ctx || { toggleMenu: () => {} };

  return (
    <button
      type="button"
      onClick={t}
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
