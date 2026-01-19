"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import PageContainer from "@/components/PageContainer";
import Tag from "@/components/Tag"; // dùng Tag giống my-withdrawals
import { displayCount } from "@/lib/displayCount";


type Status = "doing" | "pending" | "done";
type InviteItem = { id: number; name: string; phone: string; status: Status };

const ALL: InviteItem[] = [
  // doing = 2
  { id: 1, name: "Người H", phone: "09***456", status: "doing" },
  { id: 2, name: "Người H", phone: "09***456", status: "doing" },

  // pending = 10 (test 9+)
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: 100 + i,
    name: "Người X",
    phone: "09***999",
    status: "pending" as Status,
  })),

  // done = 1
  { id: 999, name: "Người Y", phone: "09***888", status: "done" },
];


// Dùng tone để feed vào <Tag>, không xài badgeClass nữa
const STATUS: Record<
  Status,
  { text: string; tone: "success" | "warning" | "danger" }
> = {
  doing: {
    text: "Đang làm",
    tone: "danger", // đỏ
  },
  pending: {
    text: "Chờ rút",
    tone: "warning", // vàng
  },
  done: {
    text: "Đã hoàn thành",
    tone: "success", // xanh
  },
};

export default function ReferralClient() {
  const [tab, setTab] = useState<Status>("doing");
  const inviteCode = "abc123";
  const inviteLink = `https://app.example/invite/${inviteCode}`;

  const filtered = useMemo(() => ALL.filter((i) => i.status === tab), [tab]);

  // Đếm số lượng từng trạng thái để show (n)
  const statusCounts = useMemo(() => {
    const counts: Record<Status, number> = {
      doing: 0,
      pending: 0,
      done: 0,
    };
    for (const item of ALL) {
      counts[item.status] += 1;
    }
    return counts;
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert("Đã sao chép link giới thiệu!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = inviteLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Đã sao chép link giới thiệu!");
    }
  };

  return (
    <>
      <Header
        title="Giới thiệu bạn bè"
        showBack
        noLine
        centerTitle
        backNoBorder
        forceFallback
      />

      {/* Đồng bộ layout: card giữa màn, max 420, cách mép 12px */}
      <PageContainer className="pt-4 pb-10 flex justify-center">
       <div className="w-full max-w-[420px] px-[12px]">
  <div className="mt-4 rounded-[24px] bg-white ring-1 ring-black/5 flex flex-col h-[70vh] overflow-hidden shadow-sm">
    
    {/* PHẦN CỐ ĐỊNH: Header + Tabs */}
    <div className="flex-none p-5 pb-2">
      <div className="text-center">
        <div className="text-[22px] leading-[26px] font-bold inline-flex items-baseline gap-1">
          <span className="text-[#27AE60]">+10.000đ</span>
          <span className="text-[16px] font-medium text-[#555]">cho mỗi người</span>
        </div>
        <div className="mt-1 text-caption text-text-muted">
          Thưởng cộng ngay khi bạn của bạn rút tiền đầu tiên <br /> được xác nhận thành công.
        </div>
      </div>

      <div className="mt-4 rounded-full bg-[#F5F5F5] h-12 px-1 flex items-center justify-between">
        <div className="text-body text-text-muted truncate pl-3">
          Link giới thiệu: <span className="text-text-main font-medium">{inviteCode}</span>
        </div>
        <button
          onClick={copyLink}
          className="w-[96px] h-10 rounded-full bg-[#FFF3E5] text-[#E67E22] text-[15px] font-bold active:scale-95 transition-all"
        >
          Sao chép
        </button>
      </div>

      <div className="mt-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex gap-2 min-w-max pb-1">
          {(["doing", "pending", "done"] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`shrink-0 px-5 h-10 rounded-full text-[14px] border transition-all ${
                tab === s ? "bg-white border-[#D1D5DB] text-[#111827] font-semibold" : "bg-white border-[#E5E7EB] text-[#6B7280]"
              }`}
            >
              {STATUS[s].text} <span className={`ml-1 text-[12px] ${tab === s ? "text-[#F2994A]" : "text-[#9CA3AF]"}`}>({displayCount(statusCounts[s])})</span>
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* PHẦN CUỘN: Danh sách người mời */}
    <div className="flex-1 overflow-y-auto px-5 overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-caption text-text-muted">Chưa có mục nào.</div>
      ) : (
        filtered.map((u, idx) => (
          <div
            key={u.id}
            className={`py-[10px] flex items-center justify-between ${idx !== filtered.length - 1 ? "border-b border-[#F0F0F0]" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[12px] bg-[#FF6D5A] grid place-items-center text-white text-[18px]">∞</div>
              <div>
                <div className="text-body font-medium">{u.name}</div>
                <div className="text-caption text-text-muted">{u.phone}</div>
              </div>
            </div>
            <Tag tone={STATUS[u.status].tone}>{STATUS[u.status].text}</Tag>
          </div>
        ))
      )}
    </div>

    {/* PHẦN CỐ ĐỊNH: Ghi chú đáy Card */}
    <div className="flex-none p-5 pt-3 bg-white border-t border-[#F9F9F9]">
      <ul className="text-[12px] text-text-muted list-disc pl-4 space-y-1">
        <li>Áp dụng cho tài khoản mới</li>
        <li>Không tính lệnh rút bị hủy/thất bại</li>
      </ul>
    </div>
  </div>
</div>
      </PageContainer>
    </>
  );
}  