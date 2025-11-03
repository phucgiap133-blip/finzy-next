// src/components/Tag.tsx
import React from "react";
type Tone = "neutral" | "success" | "warning" | "danger";
export default function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  const tones: Record<Tone, string> = {
    neutral: "bg-[color:#F5F5F5] text-text-muted",
    success: "bg-[color:#DFF0D8] text-[color:#3C763D]",
    warning: "bg-[color:#FFF4E5] text-[color:#8A6D3B]",
    danger: "bg-[color:#F2DEDE] text-[color:#A94442]",
  };
  return (
    <span className={"rounded-control px-sm py-xs text-sm " + tones[tone]}>
      {children}
    </span>
  );
}
