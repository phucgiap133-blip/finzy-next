import { Suspense } from "react";
import WithdrawSlowInfoClient from "./page.client";

export const metadata = {
  title: "Hỗ trợ: Rút tiền chậm | Finzy",
  description: "Thời gian xử lý, lưu ý ngân hàng và kênh liên hệ khi rút tiền chậm.",
};

export default function WithdrawSlowInfoPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <WithdrawSlowInfoClient />
    </Suspense>
  );
}
