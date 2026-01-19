import { Suspense } from "react";
import ReferralSupportClient from "./page.client";

export const metadata = {
  title: "Hỗ trợ: Không nhận được thưởng giới thiệu | Finzy",
  description: "Gửi mã giới thiệu để CSKH kiểm tra và hỗ trợ.",
};

export default function ReferralSupportPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <ReferralSupportClient />
    </Suspense>
  );
}
