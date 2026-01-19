'use client';

import React from "react";
import Link from "next/link";
import { useMenu } from "@/components/MenuProvider";
import Button from "@/components/Button";
import { markForwardNavigation } from "@/lib/navigation-intent";


export default function AccountOverlay() {
  const { accountOpen, closeAccount, openLogout } = useMenu();
  const LOGOUT_BUTTON_COLOR = "#F2994A";

  if (!accountOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={closeAccount} className="fixed inset-0 z-[60] bg-black/40" />

      {/* Card */}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-[61] w-[92%] max-w-[420px] rounded-[24px] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.1)] overflow-hidden"
        style={{ top: "calc(var(--header-height, 56px) + 16px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nội dung scroll */}
      {/* Nội dung scroll – thêm relative để chứa absolute */}
<div className="px-3 pt-6 pb-8 max-h-[70vh] overflow-y-auto relative">

  {/* Wrapper avatar + nút X cùng hàng */}
<div className="relative flex flex-col items-center text-center">


  {/* Nút X – canh ngang tâm avatar */}
  <button
    className="
      absolute right-0
      top-[18px] 
    "
    aria-label="Đóng"
    onClick={closeAccount}
  >
    <span className="relative block h-6 w-6">
      <span
        className={`
          block h-[2px] w-5 rounded-full bg-[#111827]
          transition-transform duration-200
          ${open ? "translate-y-[4px] -rotate-45" : "-translate-y-[2px]"}
        `}
      />
      <span
        className={`
          block h-[2px] w-5 rounded-full bg-[#111827]
          transition-opacity duration-150
          ${open ? "opacity-0" : "opacity-100"}
        `}
      />
      <span
        className={`
          block h-[2px] w-5 rounded-full bg-[#111827]
          transition-transform duration-200
          ${open ? "-translate-y-[4px] rotate-45" : "translate-y-[2px]"}
        `}
      />
    </span>
  </button>

  {/* Avatar – mobile 72px | desktop 56px */}
  <div
    className="
      grid place-items-center rounded-full bg-white ring-1 ring-black/5
      h-[72px] w-[72px]
      md:h-14 md:w-14
    "
  >
    <div
      className="
        grid place-items-center rounded-full
        bg-gradient-to-br from-[#FF7A1A] to-[#FFB347]
        h-[44px] w-[44px]
        md:h-8 md:w-8
      "
    >
      <span className="font-extrabold text-white text-lg md:text-sm">
        fp
      </span>
    </div>
  </div>




            <div className="mt-3 text-[20px] font-semibold leading-tight">Tuấn</div>
            <div className="mt-1 text-[14px] leading-[20px] text-[#7A7A7A]">
              privacy@gmail.com
            </div>
            <div className="mt-2 text-[20px] leading-[24px] font-bold text-[#222222]">
              37.000đ
            </div>
          </div>
{/* 3 NÚT PILL – NAVIGATION */}
<div className="mt-5 flex flex-wrap justify-center gap-2">
  <Link
    href="/wallet"
    onClick={() => {
      markForwardNavigation();
      closeAccount();
    }}
    className="
      rounded-full
      bg-white
      border border-[#F2994A]
      px-4 py-2
      text-[14px] font-semibold
      text-[#F2994A]
    "
  >
    Ví
  </Link>

  <Link
    href="/withdraw?from=account"
    onClick={() => {
      markForwardNavigation();
      closeAccount();
    }}
    className="
      rounded-full
      bg-white
      border border-[#F2994A]
      px-4 py-2
      text-[14px] font-semibold
      text-[#F2994A]
    "
  >
    Rút tiền
  </Link>

  <Link
    href="/my-withdrawals"
    onClick={() => {
      markForwardNavigation();
      closeAccount();
    }}
    className="
      rounded-full
      bg-white
      border border-[#F2994A]
      px-4 py-2
      text-[14px] font-semibold
      text-[#F2994A]
    "
  >
    Lịch sử của tôi
  </Link>
</div>

       {/* 2 ROW CÀI ĐẶT & HỖ TRỢ */}
<div className="mt-6 space-y-4">
  <Link
    href="/settings"
    onClick={closeAccount}
    className="
      flex h-12 items-center
      rounded-[16px] bg-white
      px-3
      shadow-[0_2px_8px_rgba(0,0,0,0.06)]
    "
  >
    <span className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#111]">
      ⚙
    </span>
    <span className="text-[16px]">Cài đặt</span>
  </Link>

  <Link
    href="/support"
    onClick={closeAccount}
    className="
      flex h-12 items-center
      rounded-[16px] bg-white
      px-3
      shadow-[0_2px_8px_rgba(0,0,0,0.06)]
    "
  >
    <span className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#111]">
      ❗
    </span>
    <span className="text-[16px]">Hỗ trợ</span>
  </Link>
</div>

{/* NÚT ĐĂNG XUẤT */}
<div className="mt-6">
  <Button
    onClick={openLogout}
    className="
      w-full h-12
      rounded-[12px]
      flex items-center justify-center
      text-[17px] font-semibold text-white
    "
    style={{ backgroundColor: LOGOUT_BUTTON_COLOR }}
  >
    Đăng xuất
  </Button>
</div>

        </div>
      </div>
    </>
  );
}  