import { Suspense } from "react";
import MyWithdrawalsClient from "./page.client";

export const metadata = {
  title: "Lịch sử của tôi | Finzy",
  description: "Xem lịch sử rút tiền và hoa hồng nhận được",
};

export default function MyWithdrawalsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải...</div>}>
      <MyWithdrawalsClient />
    </Suspense>
  );
}
