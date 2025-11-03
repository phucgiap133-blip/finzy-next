"use client";
import { useState } from "react";

type ToggleProps = {
  /** Controlled value (ưu tiên nếu truyền vào) */
  checked?: boolean;
  /** Uncontrolled mặc định ban đầu */
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
  id?: string;
  className?: string;
};

export default function Toggle({
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  id,
  className = "",
}: ToggleProps) {
  const [inner, setInner] = useState<boolean>(defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? !!checked : inner;

  const setOn = (v: boolean) => {
    if (!isControlled) setInner(v);
    onChange?.(v);
  };

  const toggle = () => {
    if (disabled) return;
    setOn(!on);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      aria-disabled={disabled}
      onClick={toggle}
      onKeyDown={onKeyDown}
      className={[
        "w-11 h-6 rounded-full border border-border relative transition",
        on ? "bg-brand-primary" : "bg-[color:#EDEDED]",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-[22px]" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}
