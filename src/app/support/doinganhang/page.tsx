import { Suspense } from "react";
import ChangeBankFAQClient from "./page.client";

export const metadata = {
  title: "Hỗ trợ: Đổi ngân hàng rút | Finzy",
  description: "Hướng dẫn liên kết/đổi ngân hàng rút và kênh liên hệ hỗ trợ.",
};

export default function ChangeBankFAQPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <ChangeBankFAQClient />
    </Suspense>
  );
}
