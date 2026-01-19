
"use client";
import React, { ReactNode } from "react";

type Props = React.ComponentProps<"div"> & { title?: ReactNode };

export default function Card({ className = "", ...rest }: Props) {
  return (
    <div
      {...rest}
      className={[
        "w-full rounded-[16px] bg-white",
        "border border-[#EDEDED]",       // 👈 tạo khung
        "shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
        className,
      ].join(" ")}
    >
      {rest.children}
    </div>
  );
}
