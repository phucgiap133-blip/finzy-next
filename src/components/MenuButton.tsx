// src/components/MenuButton.tsx
"use client";

import { ButtonHTMLAttributes } from "react";
import { useMenu } from "./MenuProvider";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function MenuButton({ className = "", ...rest }: Props) {
  const { open } = useMenu(); // <- đọc trạng thái mở menu

  return (
    <button
      type="button"
      aria-label="Mở menu"
      aria-expanded={open}
      {...rest}
      className={`
        relative inline-flex flex-col justify-center items-center
        gap-[4px] rounded-full
        transition-colors duration-200
        ${className}
      `}
    >
      {/* 3 thanh – biến hình thành X khi open = true */}
      <span
        className={`
          block h-[2px] w-5 rounded-full bg-[#111827]
          transition-transform duration-200
          ${open ? "translate-y-[4px] rotate-45" : "-translate-y-[2px]"}
        `}
      />
      <span
        className={`
          block h-[2px] w-5 rounded-full bg-[#111827]
          transition-opacity duration-150
          ${open ? "opacity-0" : "opacity-100"}
        `}
      />
      <span
        className={`
          block h-[2px] w-5 rounded-full bg-[#111827]
          transition-transform duration-200
          ${open ? "-translate-y-[4px] -rotate-45" : "translate-y-[2px]"}
        `}
      />
    </button>
  );
}
