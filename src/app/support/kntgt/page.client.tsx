
"use client";

import { usePathname } from "next/navigation";
import SupportFaqLayout from "@/components/SupportFaqLayout";

export default function ReferralFAQClient() {
  const pathname = usePathname();

  return (
    <SupportFaqLayout
      backHref="/support"
      chatHref={{ pathname: "/support/chat", query: { from: pathname } }}
      emailTo="privacy@finzy.tech"
      emailSubject="Hỗ trợ: Thưởng giới thiệu"
      emailBody="User mời: ...\nNgười được mời: ...\nThời điểm rút: ..."
    >
      <div className="space-y-6">
        {/* CARD CAM – ĐÃ ĐỒNG BỘ */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl px-[11px] py-[10px]
 border border-orange-200">
          <p className="text-[17px] font-bold text-orange-900">
            Thưởng +10.000đ khi người được mời rút tiền thành công lần đầu
          </p>
          <p className="text-[14.5px] text-orange-800 mt-1.5">
            Không giới hạn số lượng người mời
          </p>
        </div>

        {/* BLOCK ĐIỀU KIỆN – CHUẨN 24px → 16px → 8px */}
        <div className="space-y-4">
          <p className="font-semibold text-[15.5px] text-gray-900">
            Điều kiện nhận thưởng:
          </p>
          <div className="text-[14.5px] text-gray-600 space-y-2 pl-1">
            <p>
              • Đăng ký bằng <b>đúng link</b> của bạn
            </p>
            <p>• Tài khoản mới, không trùng thiết bị/SDT/ngân hàng</p>
            <p>
              • Lệnh <b>hủy/thất bại</b> không được tính thưởng
            </p>
          </div>
        </div>

        {/* CARD ĐỎ – CHUẨN 100% */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl px-[11px] py-[10px]
border border-red-200">
          <p className="text-[17px] font-bold text-red-900">
            Chưa nhận được thưởng?
          </p>
          <p className="text-[14.5px] text-red-800 mt-1.5">
            Dùng ngay nút{" "}
            <span className="font-bold text-orange-600">Chat ngay</span> bên
            dưới.
          </p>
        </div>
      </div>
    </SupportFaqLayout>
  );
}  