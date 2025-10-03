// nơi render danh sách menu (ví dụ src/components/Menu.tsx / Sidebar.tsx)
"use client";
import Link from "next/link";
import { useMenu } from "./MenuProvider";

export default function MenuList() {
  const { openLogout, closeMenu } = useMenu();

  return (
    <nav className="space-y-sm">
      <Link href="/" className="...">Trang chủ</Link>
      <Link href="/tasks" className="...">Tất cả nhiệm vụ</Link>
      {/* ... các mục khác ... */}

      {/* ✅ Đổi mục này */}
      <button
        onClick={() => { closeMenu(); openLogout(); }}
        className="w-full text-left rounded-control border border-border px-md py-sm"
      >
        Đăng xuất
      </button>
    </nav>
  );
}
