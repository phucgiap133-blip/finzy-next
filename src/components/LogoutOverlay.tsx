"use client";

import { useEffect } from "react";
import { useMenu } from "./MenuProvider";
import Button from "./Button";
import PageContainer from "./PageContainer";

export default function LogoutOverlay() {
  const { logoutOpen, closeLogout } = useMenu();
  if (!logoutOpen) return null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLogout();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLogout]);

  return (
    <>
      {/* backdrop Logout: z cao hơn Account */}
      <div
        onClick={closeLogout}
        className="fixed inset-0 z-[80] bg-black/40"
        aria-hidden
      />
      {/* dialog Logout: z cao hơn Account */}
      <section
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[81] flex items-start justify-center pt-20"
        onClick={closeLogout}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-[min(720px,calc(100%-2rem))] rounded-2xl border border-border bg-bg-page shadow-xl"
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
                <Button
                  onClick={() => {
                    // TODO: clear token / gọi API / rồi điều hướng nếu muốn
                    closeLogout();
                  }}
                >
                  Đăng xuất
                </Button>
              </div>
            </div>
          </PageContainer>
        </div>
      </section>
    </>
  );
}
