import { Suspense } from "react";
import SettingsClient from "./page.client";

export const metadata = {
  title: "Cài đặt | Finzy",
  description: "Tùy chọn hiển thị nhiệm vụ, video hướng dẫn và chẩn đoán hệ thống.",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <SettingsClient />
    </Suspense>
  );
}
