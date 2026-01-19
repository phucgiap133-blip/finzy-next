import { Suspense } from "react";
import WithdrawClient from "./page.client";

export const metadata = {
  title: "Rút tiền | Finzy",
  description: "Nhập số tiền và chọn tài khoản nhận để rút tiền.",
};

export default function WithdrawPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <WithdrawClient />
    </Suspense>
  );
}
