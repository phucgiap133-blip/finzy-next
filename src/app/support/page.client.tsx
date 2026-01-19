"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import EmailSmartButton from "@/components/EmailSmartButton";

export default function SupportClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  // 🔹 DATA giống policy
  const faqItems = [
    {
      label: "Rút tiền bị chậm?",
      href: "/support/ruttiencham",
    },
    {
      label: "Không thể nhận được thưởng giới thiệu?",
      href: "/support/kntgt",
    },
    {
      label: "Cách đổi ngân hàng rút",
      href: "/support/doinganhang",
    },
  ];

  // 🔹 FILTER giống policy
  const filteredFaq = faqItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageContainer id="app-container" className="flex justify-center">
      <div className="w-full max-w-[420px] px-[12px] pb-10">
        {/* HEADER */}
        <header className="pt-safe-top h-[56px] flex items-center justify-between relative">
          <button
            type="button"
            onClick={() => router.push("/account")}
            aria-label="Quay lại"
            className="w-11 h-11 rounded-full grid place-items-center hover:bg-black/5 transition"
          >
            <span className="text-[20px] leading-none text-[#111827]">‹</span>
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold text-[#111827] pointer-events-none">
            Hỗ trợ
          </h1>

          <div className="w-11 h-11" />
        </header>

        {/* BODY */}
        <div className="mt-6">
          {/* 🔍 Ô tìm kiếm – GIỮ NGUYÊN */}
          <div className="flex items-center gap-3 rounded-[16px] bg-[#F4F4F4] px-4 py-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="text-[#4B5563]"
            >
              <circle
                cx="11"
                cy="11"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <line
                x1="16"
                y1="16"
                x2="21"
                y2="21"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <input
              placeholder="Bạn cần giúp gì?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-[15px] leading-[22px] text-[#111827] outline-none placeholder:text-[#BDBDBD]"
            />
          </div>

          {/* 📌 FAQ – LỌC TẠI ĐÂY */}
          <section className="mt-6 space-y-3">
            <h2 className="text-[18px] font-semibold text-[#111827]">
              Câu hỏi thường gặp
            </h2>

            <div className="space-y-3">
              {filteredFaq.length > 0 ? (
                filteredFaq.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between h-12 rounded-[16px] bg-[#F9F9F9] px-4 text-[15px] text-[#111827]"
                  >
                    <span>{item.label}</span>
                    <span className="text-xl text-[#9CA3AF]">›</span>
                  </Link>
                ))
              ) : (
                <div className="text-[14px] text-[#9CA3AF] px-1">
                  Không tìm thấy nội dung phù hợp
                </div>
              )}
            </div>
          </section>

          {/* 📞 LIÊN HỆ */}
          <section className="mt-6 space-y-4">
            <h2 className="text-[18px] font-semibold text-[#111827]">Liên hệ</h2>

            <div className="flex gap-3">
              <Link
                href={{ pathname: "/support/chat", query: { from: pathname } }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-[16px] border border-[#E5E7EB] bg-white px-4 h-12 text-[15px] font-medium text-[#111827]"
              >
                💬 Chat ngay
              </Link>

              <EmailSmartButton
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-[16px] border border-[#E5E7EB] bg-white px-4 h-12 text-[15px] font-medium text-[#111827]"
                to="privacy@hh"
                subject="Hỗ trợ khách hàng"
                body="Xin chào, tôi cần hỗ trợ về..."
              >
                ✉️ Gửi email
              </EmailSmartButton>
            </div>

            <Button
              asChild
              className="h-12 w-full rounded-[16px] text-[15px] font-semibold"
              style={{ backgroundColor: "#EB5757", borderColor: "#EB5757" }}
            >
              <a href="https://t.me/" target="_blank" rel="noreferrer">
                📨 Telegram
              </a>
            </Button>
          </section>

          <footer className="mt-6 text-center text-[13px] text-[#6B7280]">
            <div className="font-medium text-[#111827]">Hỗ trợ 24/7</div>
            <div>Hỗ trợ 24/7 · DPO: privacy@hh</div>
          </footer>
        </div>
      </div>
    </PageContainer>
  );
}
