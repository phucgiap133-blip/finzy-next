// SupportFaqLayout.tsx – CHUẨN Ý MÀY: CARD TO BAO HẾT, CHỈ ĐỂ HEADER RA NGOÀI

"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Card from "@/components/Card";
import Button from "@/components/Button";
import EmailSmartButton from "@/components/EmailSmartButton";
import PageContainer from "@/components/PageContainer";

type ChatHref = string | { pathname: string; query?: Record<string, any> };

type SupportFaqLayoutProps = {
  chipLabel?: string;
  children: React.ReactNode;
  chatHref: ChatHref;
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  backHref?: string;
  showHeader?: boolean;
  footerText?: string;
};

export default function SupportFaqLayout({
  chipLabel = "",
  children,
  chatHref,
  emailTo,
  emailSubject,
  emailBody,
  backHref = "/support",
  showHeader = true,
  footerText = "Hỗ trợ 24/7 • DPO: privacy@finzy.tech",
}: SupportFaqLayoutProps) {
  return (
    <>
      {/* HEADER + ICON + CHỮ RA NGOÀI – ĐÚNG Ý MÀY */}
      {showHeader && (
        <Header
          title="Hỗ trợ"
          showBack
          noLine
          centerTitle
          backNoBorder
          backFallback={backHref}
          forceFallback
          fixed={false}
        />
      )}

      <PageContainer className="px-[12px] pt-6 pb-8 flex justify-center">
  <div className="w-full max-w-[480px]">



        {/* CHIP + NỘI DUNG (card cam, kiểm tra, card hồng) */}
        {!!chipLabel && chipLabel.trim() && (
          <div className="inline-flex items-center rounded-full bg-[#FFF6F3] px-4 py-2 text-[13px] font-medium text-[#F2994A]">
            {chipLabel}
          </div>
        )}
        {children}

        {/* 1. CARD HỒNG → 2 NÚT CHAT/EMAIL: ĐÚNG 24PX */}
        <div className="mt-6 space-y-4">           {/* ← mt-6 = 24px */}

          {/* 2. HAI NÚT CHAT + EMAIL → NÚT TELE: ĐÚNG 16PX */}
          <div className="flex gap-3">
            <Link href={chatHref as any} className="flex-1 h-12 rounded-[16px] border border-[#E5E7EB] bg-white flex items-center justify-center gap-2 text-[15px] font-medium text-[#111827]">
              Chat ngay
            </Link>
            <EmailSmartButton
              className="flex-1 h-12 rounded-[16px] border border-[#E5E7EB] bg-white flex items-center justify-center gap-2 text-[15px] font-medium text-[#111827]"
              to={emailTo} subject={emailSubject} body={emailBody}
            >
              Gửi email
            </EmailSmartButton>
          </div>

          {/* NÚT TELEGRAM */}
          <Button asChild className="w-full h-12 rounded-[16px] text-[15px] font-semibold" style={{ backgroundColor: "#EB5757", borderColor: "#EB5757" }}>
            <a href="https://t.me/" target="_blank" rel="noreferrer">
              Telegram
            </a>
          </Button>
        </div>

      

        {/* 3. CARD TRẮNG TỔNG → FOOTER "Hỗ trợ 24/7": ĐÚNG 24PX */}
    {footerText && (
      <div className="mt-6 text-center text-[13px] text-[#6B7280]">   {/* ← mt-6 = 24px */}
        {footerText}
      </div>
    )}
        </div>
      </PageContainer>
    </>
  );
}