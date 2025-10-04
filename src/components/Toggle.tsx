"use client";

import { useState } from "react";

type Props = {
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
};

export default function Toggle({ defaultChecked = false, onChange }: Props) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      onClick={() => {
        const v = !on;
        setOn(v);
        onChange && onChange(v);
      }}
      className={"w-10 h-6 rounded-full border border-border relative " + (on ? "bg-brand-primary" : "bg-[color:#EDEDED]")}
      role="switch"
      aria-checked={on}
    >
      <span className={"absolute top-0.5 transition " + (on ? "right-0.5" : "left-0.5")}>
        <span className="block w-5 h-5 rounded-full bg-white shadow-sm" />
      </span>
    </button>
  );
}
