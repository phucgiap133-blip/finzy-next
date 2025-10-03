// src/components/RootClient.jsx
"use client";
import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import MenuProvider, { useMenu } from "./MenuProvider";
import SideMenu from "./SideMenu";
import AccountOverlay from "./AccountOverlay";
import LogoutOverlay from "./LogoutOverlay";   // ✅ THÊM DÒNG NÀY

function RouteAutoCloser() {
  const pathname = usePathname();
  const { closeAccount, closeMenu, openMenu } = useMenu();

  useEffect(() => {
    // auto đóng overlay khi đổi route
    closeAccount();
    closeMenu();

    // mở lại menu trên home nếu về từ back-from-menu
    if (typeof window !== "undefined" && sessionStorage.getItem("openMenuAfterNav") === "1") {
      sessionStorage.removeItem("openMenuAfterNav");
      openMenu?.();
    }
  }, [pathname, closeAccount, closeMenu, openMenu]);

  return null;
}

export default function RootClient({ children }) {
  const updateVar = useCallback(() => {
    const container = document.getElementById("app-container");
    const hero = document.getElementById("hero-card");
    const left = container ? container.getBoundingClientRect().left : 16;
    document.documentElement.style.setProperty("--container-left", `${Math.max(left, 8)}px`);
    const top = hero ? hero.getBoundingClientRect().top : 72;
    document.documentElement.style.setProperty("--hero-top", `${Math.max(top, 48)}px`);
  }, []);

  useEffect(() => {
    updateVar();
    window.addEventListener("resize", updateVar);
    return () => window.removeEventListener("resize", updateVar);
  }, [updateVar]);

  return (
    <MenuProvider>
      <SideMenu />
      <AccountOverlay />
      <LogoutOverlay />       {/* ✅ THÊM DÒNG NÀY */}
      <RouteAutoCloser />
      {children}
    </MenuProvider>
  );
}
