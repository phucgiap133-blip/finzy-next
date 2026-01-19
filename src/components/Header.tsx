"use client";

import { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMenu } from "./MenuProvider";

type HeaderProps = {
  title?: string;
  right?: ReactNode;
  showBack?: boolean;
  noLine?: boolean;
  hideLeft?: boolean;
  backFallback?: string;
  forceFallback?: boolean;
  centerTitle?: boolean;
  backNoBorder?: boolean;
  fixed?: boolean; // ĐÃ THÊM PROP NÀY → CÓ THỂ TẮT CỐ ĐỊNH
};

export default function Header({
  title = "",
  right = null,
  showBack = false,
  noLine = false,
  hideLeft = false,
  backFallback = "/",
  forceFallback = false,
  centerTitle = false,
  backNoBorder = false,
  fixed = true, // ← mặc định bật (giữ hành vi cũ cho các trang khác)
}: HeaderProps) {
  const router = useRouter();
  const search = useSearchParams();
  const { toggleMenu } = useMenu();

  const fromMenu = search?.get("src") === "menu";

  const goBack = () => {
    if (forceFallback || fromMenu) return router.push(backFallback);
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(backFallback);
    }
  };

  const backCls = backNoBorder
    ? "inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5"
    : "inline-flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-black/5";

  let leftNode: ReactNode = null;
  if (!hideLeft) {
    if (showBack) {
      leftNode = (
        <button aria-label="Quay lại" onClick={goBack} className={backCls}>
          <span className="inline-block text-[18px] leading-none -translate-x-[1px]">
            ←
          </span>
        </button>
      );
    } else {
      leftNode = (
        <button aria-label="Mở menu" onClick={toggleMenu} className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-black/5">
          <span className="sr-only">Menu</span>
          <span className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-4 rounded-full bg-[#111827]" />
            <span className="block h-[2px] w-4 rounded-full bg-[#111827]" />
            <span className="block h-[2px] w-4 rounded-full bg-[#111827]" />
          </span>
        </button>
      );
    }
  }

  return (
    <header
      className={[
        fixed ? "sticky top-0 z-40" : "", // ← CHỈ sticky KHI fixed = true
        "bg-bg-page/95 backdrop-blur",
        noLine ? "" : "border-b border-border",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative mx-auto flex max-w-[480px] items-center px-md py-sm">
        {leftNode}

        <h1
          className={[
            "text-h5 text-text",
            centerTitle ? "absolute left-1/2 -translate-x-1/2" : "ml-sm font-bold",
          ].join(" ")}
        >
          {title}
        </h1>

        <div className="ml-auto flex items-center gap-sm">{right}</div>
      </div>
    </header>
  );
}