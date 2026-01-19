import { Suspense } from "react";
import BanksClient from "./page.client";

export const metadata = {
  title: "Liên kết ngân hàng | Finzy",
  description: "Quản lý tài khoản ngân hàng rút tiền mặc định.",
};

export default function BanksPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <BanksClient />
    </Suspense>
  );
}
