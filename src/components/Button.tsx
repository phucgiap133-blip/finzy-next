"use client";
import * as React from "react";
import clsx from "clsx";

type Variant = "primary" | "soft" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
};

export default function Button({
  className = "",
  asChild,
  loading,
  variant = "primary",
  size = "md",
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-[16px] btn-text " +
    "transition-[transform,filter,box-shadow] duration-150 " +
    "enabled:active:translate-y-[1px] " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-page";

 const variants: Record<Variant, string> = {
  primary:
    "border border-transparent " +
    "bg-brand-primary text-white " +
    "hover:bg-brand-primary " +          // ❌ bỏ brightness
    "shadow-none " +                      // ❌ bỏ shadow làm bẩn màu
    "focus:ring-brand-primary",

  soft:
    "border border-transparent bg-[#FFE8D6] text-[#E67E22] hover:bg-[#FFDCC2]",

  outline:
    "border border-border bg-transparent text-text hover:bg-[#FFF8F0]",

  danger:
    "border border-transparent bg-[#EF4444] text-white hover:brightness-105 focus:ring-[#EF4444]",
};

const sizeMap: Record<Size, string> = {
  sm: "px-sm py-xs",
  md: "px-md py-sm",
  lg: "px-lg py-md",
};

const cls = clsx(
  base,
  sizeMap[size],
  variants[variant],
  "disabled:opacity-60 disabled:cursor-not-allowed",
  className,
);

  if (asChild) return <span className={cls}>{children}</span>;

  return (
    <button className={cls} {...rest}>
      {loading ? (
        <span className="relative pr-6">
          <i className="absolute right-0 top-1/2 inline-block h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-white/60 border-t-white" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
