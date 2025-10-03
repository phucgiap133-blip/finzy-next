"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useMenu } from "./MenuProvider";
import Button from "./Button";
import PageContainer from "./PageContainer";
import { useRouter } from "next/navigation";

export default function AccountOverlay() {
  const { accountOpen, closeAccount } = useMenu();
  const router = useRouter();

  // Khoá scroll khi mở
  useEffect(() => {
    if (!accountOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [accountOpen]);

  // ESC để đóng
  useEffect(() => {
    if (!accountOpen) return;
    const onKey = (e) => e.key === "Escape" && closeAccount();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [accountOpen, closeAccount]);

  // Không mở thì không render (tránh chặn click)
  if (!accountOpen) return null;

  return (
    <>
      {/* click ra ngoài để đóng */}
      <div
        onClick={closeAccount}
        className="fixed inset-0 z-[70] bg-transparent"
        aria-hidden
      />

      {/* panel khớp mép container & hero */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Tài khoản"
        onClick={(e) => e.stopPropagation()}
        className="fixed z-[71] bg-bg-page rounded-2xl"
        style={{
          left: "var(--container-left, 16px)",
          right: "var(--container-left, 16px)",
          top: "var(--hero-top, 72px)",
          maxHeight: "calc(100vh - var(--hero-top, 72px) - 24px)",
          overflow: "auto",
        }}
      >
        {/* nút đóng trong panel */}
        <div className="flex justify-end px-md pt-md">
          <button
            onClick={closeAccount}
            aria-label="Đóng"
            className="w-9 h-9 grid place-items-center rounded-control border border-border hover:shadow-sm"
          >
            ×
          </button>
        </div>

        <PageContainer className="space-y-md pb-lg">
          {/* card có bóng */}
          <div className="bg-bg-card rounded-control p-lg shadow-md border border-border mt-md">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full grid place-items-center shadow-sm border border-border">
                <span className="text-brand-primary text-2xl font-bold">∞</span>
              </div>
              <div className="mt-sm text-body font-medium">Tuấn</div>
              <div className="text-caption text-text-muted">privacy@gmail.com</div>
              <div className="mt-sm text-stat font-bold">37.000đ</div>
            </div>

            {/* chips nhanh */}
            <div className="mt-md flex gap-sm justify-center flex-wrap">
              <Link
                href="/wallet"
                prefetch={false}
                onClick={closeAccount}
                className="px-md py-xs rounded-control bg-[color:#FFF3E0] text-body font-medium"
              >
                Ví
              </Link>
              <Link
                href="/withdraw"
                prefetch={false}
                onClick={closeAccount}
                className="px-md py-xs rounded-control bg-[color:#FFF3E0] text-body font-medium"
              >
                Rút tiền
              </Link>
              <Link
                href="/my-withdrawals"
                prefetch={false}
                onClick={closeAccount}
                className="px-md py-xs rounded-control bg-[color:#FFF3E0] text-body font-medium"
              >
                Lịch sử của tôi
              </Link>
            </div>

            {/* links */}
            <div className="mt-md grid gap-sm sm:grid-cols-2">
              <Link
                href="/settings"
                prefetch={false}
                onClick={closeAccount}
                className="flex items-center justify-between rounded-control border border-border p-md bg-bg-card text-body font-medium"
              >
                <span className="flex items-center gap-sm">
                  <span className="w-5 h-5 grid place-items-center">⚙️</span>Cài đặt
                </span>
                <span className="text-caption text-text-muted">›</span>
              </Link>
              <Link
                href="/support"
                prefetch={false}
                onClick={closeAccount}
                className="flex items-center justify-between rounded-control border border-border p-md bg-bg-card text-body font-medium"
              >
                <span className="flex items-center gap-sm">
                  <span className="w-5 h-5 grid place-items-center">🛟</span>Hỗ trợ
                </span>
                <span className="text-caption text-text-muted">›</span>
              </Link>
            </div>

            {/* Đăng xuất */}
            <div className="mt-md">
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  closeAccount();
                  router.push("/logout");
                }}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
