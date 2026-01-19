"use client";

import { usePathname } from "next/navigation";
import SupportFaqLayout from "@/components/SupportFaqLayout";

export default function WithdrawSlowInfoClient() {
  const pathname = usePathname();

  return (
    <SupportFaqLayout
      chipLabel=""
      backHref="/support"
      chatHref={{ pathname: "/support/chat", query: { from: pathname } }}
      emailTo="privacy@finzy.tech"
      emailSubject="Hỗ trợ: Rút tiền bị chậm"
      emailBody="Mô tả: ...\nSố tiền: ...\nThời gian giao dịch: ..."
    >
      {/* 
        space-y-6 = 24px giữa:
        - card cam
        - block “Kiểm tra nhanh”
        - card đỏ
      */}
      <div className="space-y-6">
        {/* Card 1: cam */}
        <div className="bg-orange-50/70 rounded-3xl px-[11px] py-[10px]
 border border-orange-100">
          <p className="text-[17px] font-bold text-orange-900">
            99% lệnh rút về trong{" "}
            <span className="text-[19px] text-orange-600">5–30 phút</span>
          </p>
          <p className="text-[14.5px] text-orange-800 mt-1.5">
            Chậm nhất 48 giờ với một số ngân hàng
          </p>
        </div>

        {/* Block “Kiểm tra nhanh” */}
        {/* space-y-4 = 16px từ title → bullet list */}
        <div className="space-y-4">
          <p className="font-semibold text-[15.5px] text-gray-900">
            Kiểm tra nhanh:
          </p>
          {/* space-y-2 = 8px giữa 3 dòng bullet */}
          <div className="text-[14.5px] text-gray-600 space-y-2 pl-1">
            <p>• Họ tên + số tài khoản đúng</p>
            <p>• Tài khoản nhận không bị khóa</p>
            <p>• Lệnh rút hiển thị hợp lệ</p>
          </div>
        </div>

        {/* Card 2: đỏ */}
        <div className="bg-red-50/70 rounded-3xl px-[11px] py-[10px]
 border border-red-100">
          <p className="text-[17px] font-bold text-red-900">
            Quá 48 giờ vẫn chưa về tiền?
          </p>
          <p className="text-[14.5px] text-red-800 mt-1.5">
            Dùng ngay nút{" "}
            <span className="font-bold text-orange-600">Chat ngay</span>.
          </p>
        </div>
      </div>
    </SupportFaqLayout>
  );
}  