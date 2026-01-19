import { Suspense } from "react";
import PolicyClient from "./page.client";

export const metadata = {
  title: "Chính sách & Điều khoản | Finzy",
  description: "Quản lý tuỳ chọn dữ liệu và xem các điều khoản.",
};

export default function PolicyPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <PolicyClient />
    </Suspense>
  );
}
