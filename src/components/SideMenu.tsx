// src/components/SideMenu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMenu } from "./MenuProvider";

export default function SideMenu() {
  const { open, closeMenu, openLogout } = useMenu();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const mainItems = [
    { href: "/", label: "Trang chủ", icon: "🏠" },
    { href: "/tasks", label: "Tất cả nhiệm vụ", icon: "🧾" },
    { href: "/withdraw", label: "Rút tiền", icon: "💰", highlight: true },
    { href: "/referral", label: "Giới thiệu bạn bè", icon: "➕" },
    { href: "/community", label: "Cộng đồng", icon: "📨" },
  ];

  const accountItems = [
    { href: "/policy", label: "Chính sách", icon: "📄" },
    { href: "/password/change", label: "Đổi mật khẩu", icon: "🔑" },
  ];

return (
  <>
    {/* Overlay */}
    <div
      onClick={closeMenu}
      className={[
        "fixed inset-0 z-40 bg-black/40 transition-opacity",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      ].join(" ")}
    />

    {/* MENU CONTAINER */}
    <aside
      role="dialog"
      aria-modal="true"
      className={[
        "fixed z-50",
        "left-[12px] right-[12px]",
        "w-auto max-w-[300px]",
        "rounded-[24px] bg-[#FAFAFA] border border-[#F2F2F2]",
        "shadow-[0_18px_40px_rgba(0,0,0,0.10)]",
        "flex flex-col overflow-hidden",
        "transition-all duration-300",
        open
          ? "translate-y-0 opacity-100"
          : "-translate-y-3 opacity-0 pointer-events-none",
      ].join(" ")}
      style={{
        top: "calc(var(--safe-top, 0px) / 2 + 80px)",
        bottom: "24px",
      }}
    >
      {/* HEADER */}
      <div className="px-3 pt-4 mb-6 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-white shadow-sm grid place-items-center">
          <span className="text-[20px] text-[#F2994A] font-bold">∞</span>
        </div>
        <div className="text-[17px] font-semibold text-[#3B302A]">
          Finzy. tech
        </div>
      </div>

      {/* BODY */}
      <nav className="px-3 pb-4 flex-1 finzy-scroll">
        {/* MAIN MENU — spacing 16px */}
        <div className="space-y-4">
          {mainItems.map((i) => {
            const highlight = !!i.highlight;

            return (
              <Link
                key={i.href}
                href={{ pathname: i.href, query: { src: "menu" } }}
                prefetch={false}
                onClick={closeMenu}
                className={[
                  "flex items-center justify-between",
                  "h-[48px] px-3 rounded-[12px]",
                  "text-[16px] font-semibold",
                  "shadow-[0_2px_6px_rgba(0,0,0,0.06)]",
                  highlight
                    ? "bg-[#F2994A] text-white"
                    : "bg-[#FEFEFE] text-[#5D4037] hover:bg-[#FFF8F0]",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{i.icon}</span>
                  <span>{i.label}</span>
                </div>

                {highlight && (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 4l4 5-4 5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </Link>
            );
          })}
        </div>

        {/* Cộng đồng → Divider: 16px */}
        <div className="mt-4">
          {/* DIVIDER — trên/dưới 12px */}
          <div className="flex items-center gap-3 px-1 mt-3 mb-3 text-[#BDBDBD] text-[12px]">
            <span className="flex-1 h-px bg-[#E0E0E0]" />
            <span>Tài khoản</span>
            <span className="flex-1 h-px bg-[#E0E0E0]" />
          </div>

          {/* ACCOUNT ITEMS — spacing 16px */}
          <div className="space-y-4">
            {accountItems.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                prefetch={false}
                onClick={closeMenu}
                className="
                  flex items-center justify-between
                  h-[48px] px-3 rounded-[12px]
                  bg-[#FEFEFE]
                  shadow-[0_2px_6px_rgba(0,0,0,0.06)]
                  text-[#5D4037] text-[16px] font-semibold
                  hover:bg-[#FFF8F0]
                "
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{i.icon}</span>
                  <span>{i.label}</span>
                </div>
              </Link>
            ))}

            <button
              type="button"
              onClick={() => {
                closeMenu();
                openLogout();
              }}
              className="
                w-full flex items-center justify-between
                h-[48px] px-3 rounded-[12px]
                bg-[#FEFEFE]
                shadow-[0_2px_6px_rgba(0,0,0,0.06)]
                text-[#5D4037] text-[16px] font-semibold
                hover:bg-[#FFF3E0]
              "
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">↩</span>
                <span>Đăng xuất</span>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  </>
);
}