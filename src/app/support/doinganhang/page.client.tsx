// src/app/support/doinganhang/page.client.tsx
"use client";

import { usePathname } from "next/navigation";
import SupportFaqLayout from "@/components/SupportFaqLayout";

export default function ChangeBankFAQClient() {
  const pathname = usePathname();

  return (
    <SupportFaqLayout
      chipLabel=""   // ← ĐÃ XÓA HOÀN TOÀN CHIP, ĐỂ RỖNG NHƯ 3 TRANG KHÁC
      chatHref={{ pathname: "/support/chat", query: { from: pathname } }}
      emailTo="privacy@finzy.tech"
      emailSubject="Hỗ trợ: Liên kết/đổi ngân hàng rút"
      emailBody="Ngân hàng cũ: ...\nNgân hàng mới: ...\nLỗi gặp phải: ..."
    >
      <div className="space-y-6">

        {/* CARD CAM – HƯỚNG DẪN CHÍNH */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl px-[11px] py-[10px]
 border border-orange-200">
          <p className="text-[17px] font-bold text-orange-900">
            Cách đổi ngân hàng rút tiền
          </p>
          <ol className="text-[14.5px] text-orange-800 mt-3 space-y-2.5 pl-1">
            <li className="pl-4 relative before:content-['1'] before:absolute before:left-0 before:font-bold">
              Vào mục <span className="font-bold">Ngân hàng → Liên kết ngân hàng</span>
            </li>
            <li className="pl-4 relative before:content-['2'] before:absolute before:left-0 before:font-bold">
              Nhập đầy đủ <span className="font-bold">Họ tên + Số TK + Ngân hàng</span>
            </li>
            <li className="pl-4 relative before:content-['3'] before:absolute before:left-0 before:font-bold">
              Chọn ngân hàng mới làm <span className="font-bold text-orange-600">Mặc định</span>
            </li>
          </ol>
        </div>

        {/* BLOCK LỖI */}
        <div className="space-y-4">
          <p className="font-semibold text-[15.5px] text-gray-900">
            Nếu không đổi được?
          </p>
          <div className="text-[14.5px] text-gray-600 space-y-2 pl-1">
            <p>• Kiểm tra lại họ tên và số tài khoản có đúng 100%</p>
            <p>• Tài khoản không bị khóa, vẫn nhận được tiền</p>
            <p>• Vẫn lỗi → chụp màn hình và dùng nút bên dưới</p>
          </div>
        </div>

        {/* CARD ĐỎ */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl px-[11px] py-[10px]
 border border-red-200">
          <p className="text-[17px] font-bold text-red-900">
            Bị lỗi liên kết ngân hàng?
          </p>
          <p className="text-[14.5px] text-red-800 mt-1.5">
            Dùng ngay nút <span className="font-bold text-orange-600">Chat ngay</span> để được xử lý trong 5 phút!
          </p>
        </div>

      </div>
    </SupportFaqLayout>
  );
}
