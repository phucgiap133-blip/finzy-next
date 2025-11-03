"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMenu } from "./MenuProvider";

export default function SideMenu() {
  const { open, closeMenu, openLogout } = useMenu();

  const [noAnim, setNoAnim] = useState(false);
  useEffect(() => {
    let t: number | undefined;
    const onResize = () => {
      setNoAnim(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => setNoAnim(false), 180);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <>
      <div
        onClick={closeMenu}
        className={[
          "fixed inset-0 z-[60] bg-black/40 transition-opacity lg:hidden",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden={!open}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={[
          "fixed inset-y-0 left-0 z-[61] h-dvh w-[320px] max-w-[90vw]",
          "bg-white/95 border border-border rounded-2xl shadow-md",
          noAnim ? "transition-none" : "transition-transform duration-300",
          "lg:transition-none",
        ].join(" ")}
        style={{
          left: "var(--container-left, 16px)",
          transform: open
            ? "translateX(0)"
            : "translateX(calc(-100% - var(--container-left, 16px)))",
          backdropFilter: "saturate(180%) blur(8px)",
        }}
      >
        <div className="p-md flex items-center justify-between">
          <div className="text-h5 font-bold">Finzy. tech</div>
          <button
            onClick={closeMenu}
            className="w-8 h-8 grid place-items-center rounded-control border border-border"
            aria-label="Đóng menu"
          >
            ×
          </button>
        </div>

        <nav className="p-md space-y-sm overflow-y-auto">
          {[
            { href: "/", label: "Trang chủ" },
            { href: "/tasks", label: "Tất cả nhiệm vụ" },
            { href: "/withdraw", label: "Rút tiền" },
            { href: "/referral", label: "Giới thiệu bạn bè" },
            { href: "/community", label: "Cộng đồng" },
          ].map((i) => (
            <Link
              key={i.href}
              href={{ pathname: i.href, query: { src: "menu" } }}
              onClick={closeMenu}
              className="block rounded-[14px] border border-border bg-white p-md hover:shadow-sm"
              prefetch={false}
            >
              {i.label}
            </Link>
          ))}

          <div className="text-caption text-text-muted px-sm pt-sm">
            Tài khoản
          </div>

          <Link
            href={{ pathname: "/policy", query: { src: "menu" } }}
            onClick={closeMenu}
            className="block rounded-[14px] border border-border bg-white p-md hover:shadow-sm"
            prefetch={false}
          >
            Chính sách
          </Link>

          <Link
            href={{ pathname: "/password/change", query: { src: "menu" } }}
            onClick={closeMenu}
            className="block rounded-[14px] border border-border bg-white p-md hover:shadow-sm"
            prefetch={false}
          >
            Đổi mật khẩu
          </Link>

          <button
            type="button"
            onClick={() => {
              closeMenu();
              openLogout();
            }}
            className="w-full text-left rounded-[14px] border border-border bg-white p-md hover:shadow-sm"
          >
            Đăng xuất
          </button>
        </nav>
      </aside>
    </>
  );
}
