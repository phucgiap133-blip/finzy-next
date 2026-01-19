"use client";

import * as React from "react";

type InputProps = {
  label?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export default function Input({
  label,
  type = "text",
  value,
  placeholder,
  className = "",
  onChange,
  onBlur,
}: InputProps) {
  return (
    <div className="space-y-xs w-full">
      {label && (
        <label className="text-body font-medium text-text">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={[
          "w-full rounded-[12px] border border-border bg-white",
          "px-md py-sm text-body text-text placeholder:text-text-muted",
          "focus:outline-none focus:ring-1 focus:ring-[var(--semantic-color-brand-primary)] focus:border-[var(--semantic-color-brand-primary)]",
          className,
        ]
          .join(" ")
          .trim()}
      />
    </div>
  );
}
