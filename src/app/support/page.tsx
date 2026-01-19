import { Suspense } from "react";
import SupportClient from "./page.client";

export const metadata = {
  title: "Hỗ trợ | Finzy",
  description: "Câu hỏi thường gặp, chat CSKH, email và Telegram.",
};

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <SupportClient />
    </Suspense>
  );
}
