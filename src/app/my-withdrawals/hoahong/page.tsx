import { Suspense } from "react";
import HoaHongClient from "./page.client";

export const metadata = {
  title: "Lịch sử hoa hồng | Finzy",
  description: "Xem lại các giao dịch hoa hồng và phần thưởng.",
};

export default function HoaHongPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải lịch sử hoa hồng…</div>}>
      <HoaHongClient />
    </Suspense>
  );
}
