import { Suspense } from "react";
import WithdrawSlowSupportClient from "./page.client";

export const metadata = {
  title: "Hỗ trợ: Gửi yêu cầu rút tiền chậm | Finzy",
  description: "Điền số tiền và thời gian giao dịch để CSKH kiểm tra.",
};

export default function WithdrawSlowSupportPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <WithdrawSlowSupportClient />
    </Suspense>
  );
}
