"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import Link from "next/link";
import EmailSmartButton from "@/components/EmailSmartButton";
import PageContainer from "@/components/PageContainer";

export default function WithdrawSlowPage() {
  const pathname = usePathname(); // "/support/ruttiencham"

  return (
    <>
      <Header
        title="Hỗ trợ"
        showBack
        noLine
        backFallback="/support"
        forceFallback
      />

      <PageContainer className="space-y-md">
        <div className="rounded-2xl border border-border bg-white p-md">
          <p className="text-caption text-text-muted">
            Lệnh rút thường xử lý trong <b>5–30 phút</b>. Một số ngân hàng có
            thể mất
            <b> 24–48 giờ</b> (cuối tuần/giờ cao điểm).
          </p>
          <ul className="text-caption text-text-muted list-disc pl-5 mt-2 space-y-1">
            <li>
              Kiểm tra <b>Họ tên</b>, <b>Số tài khoản</b>, <b>Ngân hàng</b> đã
              chính xác.
            </li>
            <li>
              Nếu quá <b>72 giờ</b> vẫn chưa nhận, vui lòng liên hệ hỗ trợ.
            </li>
          </ul>
        </div>

        <div className="flex gap-sm">
          <Link
            href={{ pathname: "/support/chat", query: { from: pathname } }}
            className="px-md py-sm rounded-control border border-border flex-1 text-center text-body"
          >
            Chat ngay
          </Link>

          <EmailSmartButton
            className="px-md py-sm rounded-control border border-border text-center flex-1 text-body"
            to="privacy@finzy.tech"
            subject="Hỗ trợ: Rút tiền bị chậm"
            body={"Mô tả vấn đề: ...\nSố tiền: ...\nThời gian giao dịch: ..."}
          >
            Gửi email
          </EmailSmartButton>
        </div>

        <Button className="w-full">Telegram</Button>
      </PageContainer>
    </>
  );
}
