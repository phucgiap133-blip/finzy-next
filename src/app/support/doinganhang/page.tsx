"use client";

import Header from "@/components/Header";
import Button from "@/components/Button";
import Link from "next/link";
import EmailSmartButton from "@/components/EmailSmartButton";
import PageContainer from "@/components/PageContainer";

export default function ChangeBankFAQPage() {
  return (
    <>
      <Header title="Cách đổi ngân hàng rút" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        <div className="rounded-2xl border border-border bg-white p-md">
          <ol className="text-caption text-text-muted list-decimal pl-5 space-y-1">
            <li>
              Vào <b>Ngân hàng</b> → <b>Liên kết ngân hàng</b>.
            </li>
            <li>
              Nhập <b>Họ tên</b>, <b>Số tài khoản</b>, chọn <b>Ngân hàng</b>.
            </li>
            <li>Xác nhận và lưu.</li>
          </ol>
          <p className="text-caption text-text-muted mt-2">Nếu lỗi xác minh, gửi ảnh sao kê/màn hình app ngân hàng để đối chiếu.</p>
        </div>

        <div className="flex gap-sm">
          <Link
            href={{ pathname: "/chat", query: { from: "/doinganhang" } }}
            className="px-md py-sm rounded-control border border-border text-center flex-1 text-body"
          >
            Chat ngay
          </Link>
          <EmailSmartButton
            className="px-md py-sm rounded-control border border-border text-center flex-1 text-body"
            to="privacy@finzy.tech"
            subject="Hỗ trợ: Liên kết/đổi ngân hàng rút"
            body={"Ngân hàng cũ: ...\nNgân hàng mới: ...\nLỗi gặp phải: ..."}
          >
            Gửi email
          </EmailSmartButton>
        </div>

        <Button className="w-full">Telegram</Button>
      </PageContainer>
    </>
  );
}
