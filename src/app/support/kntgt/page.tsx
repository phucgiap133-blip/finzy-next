import { Suspense } from "react";
import ReferralFAQClient from "./page.client";

export const metadata = {
  title: "Hỗ trợ: Thưởng giới thiệu | Finzy",
  description: "Điều kiện nhận thưởng và kênh liên hệ hỗ trợ.",
};

export default function ReferralFAQPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">Đang tải…</div>}>
      <ReferralFAQClient />
    </Suspense>
  );
}