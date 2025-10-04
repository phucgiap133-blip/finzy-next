"use client";

import Link from "next/link";
import { useMenu } from "./MenuProvider";

type MenuCtx = { openLogout: () => void; closeMenu: () => void };

export default function MenuList() {
  const { openLogout, closeMenu } = useMenu() as MenuCtx;

  return (
    <nav className="space-y-sm">
      <Link href="/" className="...">Trang chủ</Link>
      <Link href="/tasks" className="...">Tất cả nhiệm vụ</Link>

      <button
        onClick={() => {
          closeMenu();
          openLogout();
        }}
        className="w-full text-left rounded-control border border-border px-md py-sm"
      >
        Đăng xuất
      </button>
    </nav>
  );
}
