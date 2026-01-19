"use client";

import Link from "next/link";
import Button from "@/components/Button";
import Card from "@/components/Card";
import PageContainer from "@/components/PageContainer";
import MenuButton from "@/components/MenuButton";
import { useMenu } from "@/components/MenuProvider";
import { markForwardNavigation } from "@/lib/navigation-intent";

export default function HomePage() {
  const { openMenu, openAccount } = useMenu();

  return (
    <PageContainer id="app-container" className="flex justify-center">
      <div className="w-full max-w-[420px] pb-12 px-[12px]">
        {/* HEADER – H = 72px */}
        <header
  className="
    pt-safe-top          /* 👈 bù safe-area iPhone */
    h-[56px]             /* 👈 header thực = 56px */
    flex items-center justify-between
  "
>
  <MenuButton
    onClick={openMenu}
    className="w-11 h-11 rounded-full text-[#111827] hover:bg-black/5"
  />

  <h1 className="text-[18px] leading-[24px] font-semibold tracking-[0.01em]">
    Trang chủ
  </h1>

  <button
    type="button"
    onClick={openAccount}
    aria-label="Tài khoản"
    className="w-11 h-11 rounded-full border border-border bg-bg-card shadow-[0_8px_20px_rgba(0,0,0,0.06)] grid place-items-center"
  >
    <span className="text-[20px] text-brand-primary font-bold">∞</span>
  </button>
</header>
        {/* HERO CARD – cách header 24px */}
        <Card
  id="hero-card"
  className="
    mt-6        /* 24px -> đúng spec cách header 24 */
    rounded-[24px]
    border border-[#F2F2F2]
    bg-bg-card
    shadow-[0_18px_40px_rgba(0,0,0,0.10)]
    px-6 pt-6 pb-6
  "
>

          <div className="text-center">
            {/* Label */}
            <div
              id="income-title"
              className="
                uppercase tracking-[0.08em]
                text-[14px] font-semibold text-[#4B4B4B]
              "
            >
              TỔNG THU NHẬP
            </div>

            {/* Số tiền */}
            <div className="mt-2 text-[20px] leading-[24px] font-bold text-[#222222]">
              37.000đ
            </div>

            {/* Dòng phụ */}
            <div className="mt-1 text-[14px] leading-[20px] text-[#7A7A7A]">
              Rút tối thiểu 20.000đ
            </div>

{/* Nút primary */}
<div className="mt-3">
  <Link href="/withdraw?from=home" onClick={() => markForwardNavigation()}>
    <Button
      className="
        w-full h-[48px] px-4
        rounded-[12px]
        text-[16px] leading-[20px] font-semibold
        bg-[#F2994A] hover:bg-[#EA8A2F]
        text-[#FFFFFF]
        shadow-[0_8px_18px_rgba(242,153,74,0.45)]
        border border-[#F2994A]
        flex items-center justify-center
      "
    >
      <span>Rút tiền ngay</span>
    </Button>
  </Link>
</div>


          </div>
        </Card>

        {/* NHIỆM VỤ HÔM NAY */}
        <section className="mt-10" aria-labelledby="today-tasks">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="today-tasks"
              className="uppercase text-[14px] leading-[20px] font-semibold tracking-[0.04em]"
            >
              NHIỆM VỤ HÔM NAY
            </h2>

            <Link
              href="/tasks"
              className="inline-flex items-center gap-1 text-[14px] leading-[18px] font-medium text-[#6B7280]"
            >
              Xem tất cả <span aria-hidden>›</span>
            </Link>
          </div>

          {/* spacing = 16px giữa các nhiệm vụ */}
          <div className="space-y-4">
            {["Click ads", "Click ads", "Click ads"].map((t, i) => (
              <div key={i} className="flex items-center justify-between">
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  {/* Ô vuông xám */}
                  <div className="w-[32px] h-[32px] rounded-[8px] bg-[#BDB8B8]" />

                  <div>
                    <div className="text-[14px] leading-[20px] font-normal text-[#222222]">
                      {t}{" "}
                      <span className="text-[12px] leading-[18px] font-normal text-[#9CA3AF]">
                        5%
                      </span>
                    </div>

                    <div className="mt-[2px] text-[14px] leading-[20px] font-medium text-brand-primary">
                      +5.000đ
                    </div>
                  </div>
                </div>

                {/* RIGHT – nút soft */}
                <Link href="/tasks" aria-label={`Làm nhiệm vụ ${t}`}>
 <Button
  variant="soft"
  className="
    w-[82px] h-[44px]
    rounded-[22px]
    text-[16px] leading-[20px] font-medium
    shadow-none
  "
>
  Làm
</Button>



                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
