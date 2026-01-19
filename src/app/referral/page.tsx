import { Suspense } from "react";
import ReferralClient from "./page.client";

export const metadata = {
  title: "Giới thiệu bạn bè | Finzy",
  description: "Nhận thưởng khi mời bạn bè tham gia và rút tiền thành công.",
};

export default function ReferralPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <ReferralClient />
    </Suspense>
  );
}
