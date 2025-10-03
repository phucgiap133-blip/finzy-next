"use client";

import { useEffect } from "react";
import { useMenu } from "./MenuProvider";
import Button from "./Button";
import PageContainer from "./PageContainer";

export default function LogoutOverlay() {
  const { logoutOpen, closeLogout } = useMenu();
  if (!logoutOpen) return null;

  // ESC để đóng
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeLogout();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLogout]);

  return (
    <>
      {/* lớp tối */}
      <div
        onClick={closeLogout}
        className="fixed inset-0 z-[70] bg-black/40"
        aria-hidden
      />

      {/* panel nổi */}
      <section
        role="dialog"
        aria-modal="true"
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
        <div className="flex justify-end px-md pt-md">
          <button
            onClick={closeLogout}
            className="w-9 h-9 grid place-items-center rounded-control border border-border"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <PageContainer className="pb-lg">
          <div className="bg-bg-card rounded-control border border-border shadow-sm p-xl text-center space-y-md">
            <div className="text-h5 font-bold">Đăng xuất</div>
            <p className="text-text-muted">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?
            </p>

            <label className="inline-flex items-center gap-sm text-caption text-text-muted">
              <input type="checkbox" /> Đăng xuất khỏi thiết bị
            </label>

            <div className="flex justify-center gap-sm">
              <button
                className="px-md py-sm rounded-control border border-border"
                onClick={closeLogout}
              >
                Hủy
              </button>
              <Button>Đăng xuất</Button>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
