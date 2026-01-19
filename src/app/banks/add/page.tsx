import { Suspense } from "react";
import BankAddClient from "./page.client";

export const metadata = {
  title: "Thêm ngân hàng | Finzy",
  description: "Liên kết tài khoản ngân hàng/ ví để nhận tiền rút.",
};

export default function BankAddPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <BankAddClient />
    </Suspense>
  );
}
