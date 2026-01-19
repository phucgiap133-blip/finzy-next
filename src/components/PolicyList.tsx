"use client";

import React from "react";

export type PolicyListItem = {
  text: string;
  icon?: React.ReactNode;
};

type Props = {
  items: PolicyListItem[];
  className?: string;
  itemClassName?: string;
  textClassName?: string;
};

export default function PolicyList({
  items,
  className = "",
  itemClassName = "",
  textClassName = "",
}: Props) {
  return (
    <ul className={["space-y-3", className].join(" ")}>
      {items.map((item, idx) => (
        <li key={idx} className={["flex items-start gap-3", itemClassName].join(" ")}>
          {/* icon (nếu không truyền icon thì fallback chấm cam) */}
          <span className="mt-[2px] text-[18px] leading-none shrink-0">
            {item.icon ?? <span className="mt-[6px] block h-2 w-2 rounded-full bg-[#F2994A]" />}
          </span>

          <p className={["text-[14px] leading-[1.6] text-[#374151]", textClassName].join(" ")}>
            {item.text}
          </p>
        </li>
      ))}
    </ul>
  );
}
