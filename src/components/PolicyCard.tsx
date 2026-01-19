"use client";

import React from "react";

type PolicyItem = {
  text: string;
};

type Props = {
  title: string;
  icon?: React.ReactNode;
  items: PolicyItem[];
  highlight?: React.ReactNode;
};

export default function PolicyCard({
  title,
  icon,
  items,
  highlight,
}: Props) {
  return (
    <div className="rounded-[24px] border border-black/10 bg-white p-5 shadow-sm">
      {/* HEADER */}
      <div className="mb-4 flex items-center gap-2">
        {icon && <span className="text-[22px]">{icon}</span>}
        <h3 className="text-[16px] font-semibold text-[#111827]">
          {title}
        </h3>
      </div>

      {/* LIST */}
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            {/* bullet tròn */}
            <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-[#F2994A]" />
            <p className="text-[14px] leading-[1.6] text-[#374151]">
              {item.text}
            </p>
          </li>
        ))}
      </ul>

      {/* HIGHLIGHT */}
      {highlight && (
        <div className="mt-4">
          {highlight}
        </div>
      )}
    </div>
  );
}