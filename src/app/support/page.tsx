"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Card from "@/components/Card";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import EmailSmartButton from "@/components/EmailSmartButton";

export default function SupportPage() {
  const pathname = usePathname(); // "/support"

  return (
    <>
      <Header
        title="Hỗ trợ"
        showBack
        noLine
        backFallback="/account" // ← luôn quay về trang Account
        forceFallback // ← ép dùng backFallback, không dùng history.back()
      />

      <PageContainer className="space-y-md">
        <input
          placeholder="Bạn cần giúp gì?"
          className="w-full rounded-control border border-border bg-bg-card px-md py-sm text-body"
          aria-label="Tìm kiếm hỗ trợ"
        />

        <Card title="Câu hỏi thường gặp">
          <ul className="divide-y">
            <li>
              <Link
                href="/support/ruttiencham"
                className="py-sm flex justify-between w-full text-body"
              >
                <span>Rút tiền bị chậm?</span>
                <span className="text-caption text-text-muted">›</span>
              </Link>
            </li>
            <li>
              <Link
                href="/support/kntgt"
                className="py-sm flex justify-between w-full text-body"
              >
                <span>Không nhận được thưởng giới thiệu?</span>
                <span className="text-caption text-text-muted">›</span>
              </Link>
            </li>
            <li>
              <Link
                href="/support/doinganhang"
                className="py-sm flex justify-between w-full text-body"
              >
                <span>Cách đổi ngân hàng rút</span>
                <span className="text-caption text-text-muted">›</span>
              </Link>
            </li>
          </ul>
        </Card>

        <div className="flex gap-sm">
          {/* Truyền from = trang hiện tại */}
          <Link
            href={{ pathname: "/support/chat", query: { from: pathname } }}
            className="px-md py-sm rounded-control border border-border flex-1 text-center text-body"
          >
            Chat ngay
          </Link>

          <EmailSmartButton
            className="px-md py-sm rounded-control border border-border flex-1 text-center text-body"
            to="privacy@finzy.tech"
            subject="Hỗ trợ khách hàng"
            body="Xin chào, tôi cần hỗ trợ về..."
          >
            Gửi email
          </EmailSmartButton>
        </div>

        <Button>Telegram</Button>

        <div className="text-center text-caption text-text-muted">
          Hỗ trợ 24/7 • DPO: privacy@finzy.tech
        </div>
      </PageContainer>
    </>
  );
}
