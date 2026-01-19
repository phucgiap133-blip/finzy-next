"use client";

import { useState } from "react";
import { useMenu } from "./MenuProvider";
import Button from "./Button";

export default function LogoutOverlay() {
  const { logoutOpen, closeLogout } = useMenu();
  const [logoutDevice, setLogoutDevice] = useState(false);

  const onLogout = () => {
    try {
      localStorage.removeItem("authToken");
    } catch {}

    closeLogout();
    window.location.href = "/"; // quay về Trang chủ
  };

  return (
    <>
      {/* overlay mờ phía sau */}
      <div
        onClick={closeLogout}
        className={`fixed inset-0 z-[90] bg-black/40 transition-opacity ${
          logoutOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* card giữa màn hình */}
      <div
        className={`fixed left-1/2 top-1/2 z-[91]
        w-[calc(100%-24px)] max-w-[420px]
        -translate-x-1/2 -translate-y-1/2
        rounded-[24px] bg-white
        shadow-[0_12px_32px_rgba(0,0,0,0.16)]
        px-xl py-[24px]
        transition-all duration-250
        ${
          logoutOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        {/* Tiêu đề + mô tả */}
        <div className="text-center">
          <div className="text-[20px] font-bold">Đăng xuất</div>

          {/* cách tiêu đề 12px */}
          <p className="mt-3 text-body text-[#4F4F4F] leading-relaxed">
            Bạn có chắc chắn muốn đăng xuất khỏi
            <br />
            tài khoản này?
          </p>
        </div>

        {/* ô vuông “Đăng xuất khỏi thiết bị” – cách đoạn text 16px */}
        <button
          type="button"
          onClick={() => setLogoutDevice((v) => !v)}
          className="mt-4 flex items-center gap-sm mx-auto text-body text-[#4F4F4F]"
        >
          <span
            className={`w-6 h-6 rounded-[8px] border border-[#E0E0E0] grid place-items-center ${
              logoutDevice ? "bg-[#EB5757]" : "bg-[#F2F2F2]"
            }`}
          >
            {logoutDevice && (
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path
                  d="M1 5.5 4.5 9 13 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span>Đăng xuất khỏi thiết bị</span>
        </button>

        {/* nút – cách ô tích 24px */}
        <div className="mt-6 flex gap-sm">
          <button
            type="button"
            onClick={closeLogout}
            className="flex-1 h-12 rounded-[16px] border border-[#E0E0E0] bg-white text-body"
          >
            Hủy
          </button>

          <Button
            type="button"
            disabled={!logoutDevice}
            onClick={onLogout}
            className={`flex-1 h-12 rounded-[16px] text-white text-body font-semibold transition-opacity ${
              !logoutDevice
                ? "bg-[#E0E0E0] opacity-50 cursor-not-allowed"
                : "bg-[#EB5757] hover:bg-[#D84343]"
            }`}
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </>
  );
}
