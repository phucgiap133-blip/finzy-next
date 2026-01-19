import { Suspense } from "react";
import ChangePasswordClient from "./page.client";

export const metadata = {
  title: "Đổi mật khẩu | Finzy",
  description: "Đổi mật khẩu đăng nhập tài khoản Finzy.",
};

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải…</div>}>
      <ChangePasswordClient />
    </Suspense>
  );
}
