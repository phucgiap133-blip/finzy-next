// src/app/logout/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";

export default function LogoutPage() {
  const router = useRouter();

  const handleCancel = () => router.back();
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // nếu có
    router.replace("/"); // quay về Trang chủ
  };

  return (
    <PageContainer className="min-h-screen flex items-center justify-center bg-bg-page">
      <div className="bg-white border border-border shadow-md rounded-2xl p-xl max-w-sm w-full text-center space-y-md">
        <h1 className="text-h5 font-bold">Đăng xuất</h1>
        <p className="text-text-muted">
          Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?
        </p>

        <div className="flex justify-center gap-sm mt-md">
          <button
            onClick={handleCancel}
            className="px-md py-sm rounded-control border border-border"
          >
            Hủy
          </button>
          <Button onClick={handleLogout}>Đăng xuất</Button>
        </div>
      </div>
    </PageContainer>
  );
}
