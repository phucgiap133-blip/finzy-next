"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { consumeForwardNavigation } from "@/lib/navigation-intent";

const LOADING_PATHS = new Set(["/wallet", "/withdraw", "/my-withdrawals"]);

export default function InitialLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // ✅ LUÔN consume để không bị “back lại hiện”
    const isForward = consumeForwardNavigation();
    const shouldShow = LOADING_PATHS.has(pathname);

    if (!shouldShow || !isForward) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 420);
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <Image
        src="/fp-mark.png"
        alt="FP"
        width={120}
        height={120}
        priority
        className="opacity-85 animate-fp-slide-down"
      />
    </div>
  );
}
