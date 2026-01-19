import { Suspense } from "react";
import ForgotPasswordClient from "./page.client";

export const metadata = {
  title: "Quên mật khẩu | Finzy",
  description: "Gửi OTP và đặt lại mật khẩu qua email.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
