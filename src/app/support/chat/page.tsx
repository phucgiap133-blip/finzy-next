import { Suspense } from "react";
import SupportChatClient from "./page.client";

export const metadata = {
  title: "Hỗ trợ • Chat | Finzy",
  description: "Trò chuyện với CSKH và dùng lệnh nhanh /rút tiền chậm, /giới thiệu…",
};

export default function SupportChatPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải chat…</div>}>
      <SupportChatClient />
    </Suspense>
  );
}
