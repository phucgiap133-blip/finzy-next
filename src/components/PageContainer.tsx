// src/components/PageContainer.tsx
"use client";

import * as React from "react";
import clsx from "clsx";

type Props = React.ComponentProps<"main">;

export default function PageContainer({ className = "", ...rest }: Props) {
  return (
    <main
      {...rest}
      className={clsx(
        "w-full min-h-[100dvh] bg-bg-page text-text pb-[40px] overscroll-none",
        className
      )}
    />
  );
}
