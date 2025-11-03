"use client";
import React, { ReactNode } from "react";

type Props = React.ComponentProps<"div"> & {
  title?: ReactNode;
};

export default function Card({ title, className = "", ...rest }: Props) {
  return (
    <div
      {...rest}
      className={[
        "bg-bg-card rounded-control shadow-sm p-md border border-border",
        className || "",
      ]
        .join(" ")
        .trim()}
    >
      {title && <div className="text-body font-medium mb-sm">{title}</div>}
      {rest.children}
    </div>
  );
}
