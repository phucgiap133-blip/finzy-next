"use client";

import { ReactNode, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMenu } from "./MenuProvider";

type Props = {
  title?: string;
  right?: ReactNode;
  showBack?: boolean;
  noLine?: boolean;
  showClose?: boolean;
  hideLeft?: boolean;
  backFallback?: string;
  forceFallback?: boolean;
  closeTo?: string;
};

export default function Header({
  title = "",
  right = null,
  showBack = false,
  noLine = false,
  showClose = false,
  hideLeft = false,
  backFallback = "/",
  forceFallback = false,
  closeTo,
}: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const { toggleMenu } = useMenu();

  const fromMenu = search?.get("src") === "menu";

  const doDefaultBack = useCallback(() => {
    if (forceFallback) return router.push(backFallback);
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(backFallback);
  }, [backFallback, forceFallback, router]);

  const onBack = () => {
    if (fromMenu) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("openMenuAfterNav", "1");
      }
      router.push("/");
      return;
    }
    doDefaultBack();
  };

  const onClose = () => {
    if (closeTo) router.push(closeTo);
    else onBack();
  };

  return (
    <header className={["sticky top-0 z-40 bg-bg-card/95 backdrop-blur", noLine ? "" : "border-b border-border"].join(" ")}>
      <div className="mx-auto max-w-md flex items-center gap-sm p-md">
        {!hideLeft &&
          (showBack ? (
            <button
              onClick={onBack}
              className="rounded-control px-sm py-xs border border-border text-text-muted"
              aria-label="Quay lại"
            >
              ←
            </button>
          ) : (
            <button
              onClick={toggleMenu}
              aria-label="Mở menu"
              className="inline-flex items-center justify-center w-9 h-9 rounded-control border border-border hover:shadow-sm"
            >
              ≡
            </button>
          ))}

        <h1 className="text-h5 md:text-h4 font-bold">{title}</h1>

        <div className="ml-auto flex items-center gap-sm">
          {right}
          {showClose && (
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="inline-flex items-center justify-center w-9 h-9 rounded-control border border-border hover:shadow-sm"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
