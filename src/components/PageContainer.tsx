"use client";
import React from "react";

type Props = React.ComponentProps<"main">;

export default function PageContainer({ className = "", ...rest }: Props) {
  return (
    <main
      {...rest}
      className={[
        "mx-auto w-full px-4 md:px-6 py-6",
        "max-w-[420px] sm:max-w-screen-sm md:max-w-screen-md",
        "lg:max-w-screen-lg xl:max-w-screen-xl",
        className || "",
      ]
        .join(" ")
        .trim()}
    />
  );
}
