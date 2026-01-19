import { Suspense } from "react";
import RutPageClient from "./page.client";

export const metadata = {
  title: "Lịch sử rút tiền | Finzy",
  description: "Xem lại các giao dịch rút tiền, phí và trạng thái xử lý.",
};

export default function RutPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải lịch sử rút tiền…</div>}>
      <RutPageClient />
    </Suspense>
  );
}
