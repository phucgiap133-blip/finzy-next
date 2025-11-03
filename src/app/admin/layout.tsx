import { redirect } from "next/navigation";
import { assertAdmin } from "@/server/authz";
import React from "react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await assertAdmin(); // ⬅️ giờ đã export từ authz.ts
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-indigo-700">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Quản lý hệ thống hỗ trợ khách hàng</p>
        </header>
        <main>{children}</main>
      </div>
    );
  } catch {
    redirect("/"); // không phải admin → đá về trang chủ
  }
}
