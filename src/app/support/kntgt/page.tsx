"use client";

import Header from "@/components/Header";
import Button from "@/components/Button";
import Link from "next/link";
import EmailSmartButton from "@/components/EmailSmartButton";
import PageContainer from "@/components/PageContainer";
import { usePathname } from "next/navigation"; // ✅ thêm dòng này

export default function ReferralFAQPage() {
  const pathname = usePathname(); // ✅ thêm dòng này

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
            Thưởng +10.000đ được cộng khi người được mời hoàn tất{" "}
            <b>lệnh rút đầu tiên thành công</b>.
          </p>
          <ul className="text-caption text-text-muted list-disc pl-5 mt-2 space-y-1">
            <li>
              Đăng ký bằng <b>đúng link</b> của bạn.
            </li>
            <li>Tài khoản mới, không trùng thiết bị/SDT/ngân hàng.</li>
            <li>
              Lệnh <b>hủy/thất bại</b> không tính thưởng.
            </li>
          </ul>
        </div>

        <div className="flex gap-sm">
          <Link
            href={{ pathname: "/support/chat", query: { from: pathname } }} // ✅ sửa ở đây
            className="px-md py-sm rounded-control border border-border flex-1 text-center text-body"
          >
            Chat ngay
          </Link>

          <EmailSmartButton
            className="px-md py-sm rounded-control border border-border text-center flex-1 text-body"
            to="privacy@finzy.tech"
            subject="Hỗ trợ: Thưởng giới thiệu"
            body={"User mời: ...\nNgười được mời: ...\nThời điểm rút: ..."}
          >
            Gửi email
          </EmailSmartButton>
        </div>

        <Button className="w-full">Telegram</Button>
      </PageContainer>
    </>
  );
}
