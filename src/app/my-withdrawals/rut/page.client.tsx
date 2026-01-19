
// src/app/my-withdrawals/rut/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Tag from "../../../components/Tag";
import PageContainer from "../../../components/PageContainer";
import { api } from "@/lib/api";


type Status = "Thành công" | "Chờ duyệt" | "Thất bại";
const STATUS_TONE: Record<Status, "success" | "warning" | "danger"> = {
  "Thành công": "success",
  "Chờ duyệt": "warning",
  "Thất bại": "danger",
};

type WithdrawalItem = {
  id: string;
  amount: number;
  status: Status;
  fee: number;
  method: string;
  createdAt: string;
};

const toStatus = (s: string | undefined | null): Status => {
  const v = String(s || "").toLowerCase();
  if (v.includes("succ") || v.includes("ok") || v.includes("done") || v.includes("thành")) return "Thành công";
  if (v.includes("pend") || v.includes("processing") || v.includes("xử")) return "Chờ duyệt";
  return "Thất bại";
};


const mapWithdrawal = (it: any): WithdrawalItem => ({
  id: String(it?.id ?? ""),
  amount: Number(it?.amount ?? 0),
  status: toStatus(it?.status),
  fee: Number(it?.fee ?? 0),
 method: String(it?.method ?? ""),

  createdAt: String(it?.createdAt ?? new Date().toISOString()),
});


const formatAmount = (amount: number) => {
  const abs = Math.abs(amount);
  return `-${abs.toLocaleString("vi-VN")}đ`;
};
const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  const MM = (d.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${hh}:${mm} ${dd}/${MM}/${yyyy}`;
};

const FALLBACK_MOCK: WithdrawalItem[] = [
  { id: "demo-1", amount: 100000, status: "Thành công", fee: 0, method: "MoMo *****5678", createdAt: "2025-08-17T10:21:00" },
  { id: "demo-2", amount: 100000, status: "Thất bại", fee: 0, method: "MoMo *****5678", createdAt: "2025-08-17T10:21:00" },
  { id: "demo-3", amount: 100000, status: "Chờ duyệt", fee: 0, method: "MoMo *****5678", createdAt: "2025-08-17T10:21:00" },
];
function WithdrawalCard({ it }: { it: WithdrawalItem }) {
    const isFailed = it.status === "Thất bại";

 

  return (
<div
  className={`bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.07)] overflow-hidden
    transition-all duration-300 ease-out
    ${isFailed
      ? "opacity-60 scale-[0.98]"
      : "opacity-100 scale-100"}
  `}
>


      <div className="px-[11px] py-[10px]">
        <div className="flex items-start gap-3">
          {/* Avatar */}
        <div
  className={`shrink-0 w-10 h-10 rounded-full
    grid place-items-center text-[10px] font-bold leading-tight
    ${isFailed
      ? "bg-[#E5E7EB] text-[#9CA3AF]"
      : "bg-[#A000FF] text-white"}
  `}
>

            mo<br />mo
          </div>

          {/* Nội dung */}
          <div className="flex-1 min-w-0">
      <div
  className={`text-[17px] font-bold leading-none
    ${isFailed
      ? "text-[#9CA3AF] line-through decoration-[1.5px]"
      : "text-[#111827]"}
  `}
>

  {formatAmount(it.amount)}
</div>

            <div className="mt-1 flex items-center justify-between">
              <div className="text-[14px] font-medium truncate">
                {it.method}
              </div>
              <Tag tone={STATUS_TONE[it.status]}>
  {it.status}
</Tag>

            </div>

          <div className="mt-[3px] text-[12.5px] text-[#6B7280]">
  {isFailed
    ? `${formatDateTime(it.createdAt)} • Đã hoàn lại`
    : formatDateTime(it.createdAt)}
</div>

 

          </div>
        </div>
      </div>
    </div>
  );
}

export default function RutPage({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState<WithdrawalItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.history.withdrawals.get();
        let rows = Array.isArray(res?.items) ? res.items.map(mapWithdrawal) : [];
        if (rows.length === 0) rows = FALLBACK_MOCK;
        else if (rows.length < 3) rows = [...rows, ...FALLBACK_MOCK.slice(0, 3 - rows.length)];
        setItems(rows);
      } catch {
        setItems(FALLBACK_MOCK);
      }
    })();
  }, []);

 

  const handleBack = () => router.push("/withdraw");
  const baseItem = items[0];


  return (
    <PageContainer id="app-container" className="flex justify-center">
      <div className="w-full max-w-[420px] pb-10 px-[12px]">
        {/* HEADER – giữ nguyên đẹp */}
        <header className="pt-safe-top h-[56px] flex items-center justify-between relative">
          <button
            onClick={handleBack}
            aria-label="Quay lại"
            className="w-11 h-11 rounded-full grid place-items-center hover:bg-black/5 transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#111827]">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold text-[#111827] pointer-events-none">
            Lịch sử rút
          </h1>
          <div className="w-11 h-11" />
        </header>

 <div className="mt-6 space-y-4">
{baseItem && (
  <>
    <WithdrawalCard it={baseItem} />

    <WithdrawalCard
      it={{ ...baseItem, status: "Chờ duyệt" }}
    />

    <WithdrawalCard
      it={{ ...baseItem, status: "Thất bại" }}
    />
  </>
)}




  {items.length === 0 && (
    <div className="text-center text-[14px] text-[#9CA3AF] py-12">
      Chưa có giao dịch rút tiền
    </div>
  )}
</div>
        {/* Footer */}
        {!embedded && (
          <div className="mt-8 text-center text-[13px] text-[#6B7280]">
            Phí rút: 0đ · Hỗ trợ 24/7
          </div>
        )}
      </div>
    </PageContainer>
  );
} 
