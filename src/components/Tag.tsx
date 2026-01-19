// src/components/Tag.tsx
"use client";
import * as React from "react";
import clsx from "clsx";

type Tone = "neutral" | "success" | "warning" | "danger";
type Variant = "soft" | "solid" | "outline";
type Size = "sm" | "md";

export default function Tag({
  children,
  tone = "neutral",
  variant = "soft",
  size = "md",
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  variant?: Variant;
  size?: Size;
}) {
  const base =
    "inline-flex items-center rounded-[999px] font-semibold whitespace-nowrap select-none";

  const sizes: Record<Size, string> = {
    sm: "text-caption px-3 py-1",
    md: "text-body px-3.5 py-1.5",
  };

  // Màu "soft" khớp PNG; "solid|outline" bám token trạng thái
  const styles: Record<Tone, Record<Variant, string>> = {
    neutral: {
      soft: "bg-[#F5F5F5] text-[var(--semantic-color-text-muted)]",
      solid:
        "bg-[#E5E7EB] text-[color:#111827]",
      outline:
        "bg-transparent text-[color:#4B5563] border border-[#E5E7EB]",
    },
    success: {
      soft: "bg-[#E8F5E9] text-[#2E7D32]",
      solid:
        "bg-[var(--semantic-color-success,#2E7D32)] text-white",
      outline:
        "bg-transparent text-[#2E7D32] border border-[rgba(46,125,50,0.28)]",
    },
    warning: {
      soft: "bg-[#FFF4CC] text-[#8A6D3B]",
      solid:
        "bg-[var(--semantic-color-warning,#F2C94C)] text-[#1F2937]",
      outline:
        "bg-transparent text-[#8A6D3B] border border-[rgba(242,201,76,0.5)]",
    },
 danger: {
  soft: "bg-[#FDECEC] text-[#D14343]", // 👈 dịu hơn, không gắt
  solid:
    "bg-[var(--semantic-color-danger,#EB5757)] text-white",
  outline:
    "bg-transparent text-[#D14343] border border-[rgba(235,87,87,0.28)]",
},

  };

  return (
    <span
      {...rest}
      className={clsx(base, sizes[size], styles[tone][variant], className)}
    >
      {children}
    </span>
  );
}
