
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Tag from "../../../components/Tag";
import PageContainer from "../../../components/PageContainer";
import { api } from "@/lib/api";
import clsx from "clsx";



type Status = "Thành công" | "Chờ duyệt" | "Thất bại";


type CommissionItem = {
  id: string;
  amount: number;
  status: Status;
  createdAt: string;
  user: string; // "Người B (F1)"
  code: string; // "11234"
};

// ---- Helpers -------------------------------------------------
const toStatus = (s: string | undefined | null): Status => {
  const v = String(s || "").toLowerCase();

  if (v.includes("succ") || v.includes("ok") || v.includes("done") || v.includes("thành"))
    return "Thành công";

  if (v.includes("pend") || v.includes("processing") || v.includes("chờ"))
    return "Chờ duyệt";

  return "Thất bại";
};


const formatAmount = (v: number) =>
  `+${Math.abs(v).toLocaleString("vi-VN")}đ`;

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Mock giống Figma
const FALLBACK_MOCK: CommissionItem[] = [
  {
    id: "1",
    amount: 10000,
    status: "Thành công",
    createdAt: "2024-04-25T10:12:00",
    user: "Người B (F1)",
    code: "11234",
  },
  {
    id: "2",
    amount: 10000,
    status: "Thất bại",
    createdAt: "2024-04-25T10:12:00",
    user: "Người B (F1)",
    code: "11234",
  },
  {
    id: "3",
    amount: 10000,
    status: "Chờ duyệt",
    createdAt: "2024-04-25T10:12:00",
    user: "Người B (F1)",
    code: "11234",
  },
];

export default function HoaHongPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CommissionItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.history.commissions.get();

        let items: CommissionItem[] = [];

        if (Array.isArray(res?.items) && res.items.length > 0) {
          items = res.items.map((it: any) => ({
            id: String(it?.id ?? ""),
            amount: Number(it?.amount ?? 0),
            status: toStatus(it?.status),
            createdAt: String(it?.createdAt ?? new Date().toISOString()),
            user: String(it?.user ?? "Người B (F1)"),
            code: String(it?.code ?? "11234"),
          }));
        } else {
          items = FALLBACK_MOCK;
        }

        setRows(items);
      } catch {
        setRows(FALLBACK_MOCK);
      }
    })();
  }, []);

  const todayTotal = useMemo(() => {
    if (!rows.length) return 0;
    const today = new Date().toDateString();
    return rows
      .filter((r) => new Date(r.createdAt).toDateString() === today)
      .reduce((s, r) => s + r.amount, 0);
  }, [rows]);

  const monthTotal = useMemo(() => {
    if (!rows.length) return 0;
    const d = new Date();
    const m = d.getMonth();
    const y = d.getFullYear();
    return rows
      .filter((r) => {
        const t = new Date(r.createdAt);
        return t.getMonth() === m && t.getFullYear() === y;
      })
      .reduce((s, r) => s + r.amount, 0);
  }, [rows]);

 const STATUS_TONE: Record<Status, "success" | "warning" | "danger"> = {
  "Thành công": "success",
  "Chờ duyệt": "warning",
  "Thất bại": "danger",
};


  const handleBack = () => {
    router.push("/withdraw");
  };

  return (
    <PageContainer id="app-container" className="flex justify-center">
      {/* khung giống Trang chủ: max 420, padding 12px, header KHÔNG cố định */}
      <div className="w-full max-w-[420px] pb-8 px-[12px]">
        {/* HEADER giống home/withdraw-history */}
        <header className="pt-safe-top h-[56px] flex items-center justify-between relative">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Quay lại"
            className="w-11 h-11 rounded-full grid place-items-center hover:bg-black/5 transition"
          >
            <span className="text-[20px] leading-none text-[#111827]">‹</span>
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold text-[#111827] pointer-events-none">
            Lịch sử hoa hồng
          </h1>

          <div className="w-11 h-11" />
        </header>

      {/* Khối Hôm nay / Tháng này */}
        <div className="mt-6 mb-6 space-y-2">
          <div className="flex justify-between text-[16px]">
            <span className="text-[#374151]">Hôm nay</span>
            <span className="font-semibold text-[#2E7D32]">
              +{todayTotal.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="flex justify-between text-[16px]">
            <span className="text-[#374151]">Tháng này</span>
            <span className="font-semibold text-[#2E7D32]">
              +{monthTotal.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

{/* LIST CARD – Tag cùng dòng với “Người B • mã” */}
<div className="space-y-4">
  {rows.map((it) => (
    <div key={it.id}>
      <div
  className={clsx(
    "bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.07)] overflow-hidden transition-all duration-300 ease-out",
    it.status === "Thất bại" && "opacity-60 scale-[0.98]"
  )}
>

        <div className="px-[11px] py-[10px]">
          <div className="flex flex-col">
            {/* Số tiền */}
            <div
              className={clsx(
                "text-[17px] font-bold leading-none",
                it.status === "Thất bại"
                  ? "text-[#9CA3AF] line-through decoration-[1.5px]"
                  : "text-[#111827]"
              )}
            >
              {formatAmount(it.amount)}
            </div>

            {/* Người + Tag */}
            <div className="mt-1 flex items-center justify-between">
              <div className="text-[14px] font-medium truncate">
                {it.user} • {it.code}
              </div>

              <Tag tone={STATUS_TONE[it.status]}>
                {it.status}
              </Tag>
            </div>

            {/* Thời gian (+ hoàn lại nếu thất bại) */}
            <div className="mt-[3px] text-[12.5px] text-[#6B7280]">
              {it.status === "Thất bại"
                ? `${formatDateTime(it.createdAt)} • Đã hoàn lại`
                : formatDateTime(it.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  ))}




          {rows.length === 0 && (
            <div className="text-caption text-text-muted">
              Chưa có hoa hồng.
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-caption text-text-muted">
          Phí rút: 0đ · Hỗ trợ 24/7
        </div>
      </div>
    </PageContainer>
  );
}  