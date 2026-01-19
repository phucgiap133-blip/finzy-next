// src/app/my-withdrawals/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import Tag from "@/components/Tag";
import { api } from "@/lib/api";

type Status = "Thành công" | "Đang xử lý" | "Thất bại";
type TabKey = "withdraw" | "commission";

type WithdrawalItem = {
  id: string;
  amount: number;
  status: Status;
  fee: number;
  method: string;
  createdAt: string;
};

type CommissionItem = {
  id: string;
  amount: number;
  status: Status;
  createdAt: string;
  user: string; // "Người B (F1)"
  code: string; // "11234"
};

// ---------------- Helpers chung ----------------
const toStatus = (s: string | undefined | null): Status => {
  const v = String(s || "").toLowerCase();
  if (
    v.includes("succ") ||
    v.includes("ok") ||
    v.includes("done") ||
    v.includes("thành")
  )
    return "Thành công";
  if (v.includes("pend") || v.includes("processing") || v.includes("xử"))
    return "Đang xử lý";
  return "Thất bại";
};

// Rút tiền: luôn hiển thị có dấu “-”
const formatWithdrawAmount = (amount: number) => {
  const abs = Math.abs(amount);
  return `-${abs.toLocaleString("vi-VN")}đ`;
};

// Hoa hồng: luôn hiển thị có dấu “+”
const formatCommissionAmount = (v: number) =>
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

// ---------------- MOCK DEMO (3 trạng thái) ----------------
const WITHDRAW_FALLBACK: WithdrawalItem[] = [
  {
    id: "demo-1",
    amount: 100000,
    status: "Thành công",
    fee: 0,
    method: "MoMo *****5678",
    createdAt: "2025-08-17T10:21:00",
  },
  {
    id: "demo-2",
    amount: 100000,
    status: "Thất bại",
    fee: 0,
    method: "MoMo *****5678",
    createdAt: "2025-08-17T10:21:00",
  },
  {
    id: "demo-3",
    amount: 100000,
    status: "Đang xử lý",
    fee: 0,
    method: "MoMo *****5678",
    createdAt: "2025-08-17T10:21:00",
  },
];

const COMMISSION_FALLBACK: CommissionItem[] = [
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
    status: "Đang xử lý",
    createdAt: "2024-04-25T10:12:00",
    user: "Người B (F1)",
    code: "11234",
  },
];

export default function HistoryTabsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("withdraw");
  const [withdrawItems, setWithdrawItems] = useState<WithdrawalItem[]>([]);
  const [commissionItems, setCommissionItems] = useState<CommissionItem[]>([]);

  // ---------- Load dữ liệu rút tiền ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await api.history.withdrawals.get();
        let rows: WithdrawalItem[] = Array.isArray(res?.items)
          ? res.items.map(
              (it: any): WithdrawalItem => ({
                id: String(it?.id ?? ""),
                amount: Number(it?.amount ?? 0),
                status: toStatus(it?.status),
                fee: Number(it?.fee ?? 0),
                method: String(it?.method ?? ""),
                createdAt: String(
                  it?.createdAt ?? new Date().toISOString(),
                ),
              }),
            )
          : [];

        if (rows.length === 0) {
          rows = WITHDRAW_FALLBACK;
        } else if (rows.length < 3) {
          const need = 3 - rows.length;
          rows = [...rows, ...WITHDRAW_FALLBACK.slice(0, need)];
        }

        setWithdrawItems(rows);
      } catch {
        setWithdrawItems(WITHDRAW_FALLBACK);
      }
    })();
  }, []);

  // ---------- Load dữ liệu hoa hồng ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await api.history.commissions.get();

        let rows: CommissionItem[] = [];

        if (Array.isArray(res?.items) && res.items.length > 0) {
          rows = res.items.map(
            (it: any): CommissionItem => ({
              id: String(it?.id ?? ""),
              amount: Number(it?.amount ?? 0),
              status: toStatus(it?.status),
              createdAt: String(
                it?.createdAt ?? new Date().toISOString(),
              ),
              user: String(it?.user ?? "Người B (F1)"),
              code: String(it?.code ?? "11234"),
            }),
          );
        } else {
          rows = COMMISSION_FALLBACK;
        }

        setCommissionItems(rows);
      } catch {
        setCommissionItems(COMMISSION_FALLBACK);
      }
    })();
  }, []);

  // Tổng hôm nay / tháng này cho Hoa hồng
  const todayTotal = useMemo(() => {
    if (!commissionItems.length) return 0;
    const today = new Date().toDateString();
    return commissionItems
      .filter((r) => new Date(r.createdAt).toDateString() === today)
      .reduce((s, r) => s + r.amount, 0);
  }, [commissionItems]);

  const monthTotal = useMemo(() => {
    if (!commissionItems.length) return 0;
    const d = new Date();
    const m = d.getMonth();
    const y = d.getFullYear();
    return commissionItems
      .filter((r) => {
        const t = new Date(r.createdAt);
        return t.getMonth() === m && t.getFullYear() === y;
      })
      .reduce((s, r) => s + r.amount, 0);
  }, [commissionItems]);

  const tone = (status: Status) =>
    status === "Thành công"
      ? "success"
      : status === "Đang xử lý"
      ? "warning"
      : "danger";

  const handleBack = () => {
    router.push("/account");
  };

  // ---------- Thanh tab chung (trong khung 420px) ----------
const TabBar = (
  <div className="mt-4 mb-3">
    <div className="w-full bg-[#F7F2EB] border border-border rounded-full p-1 flex justify-between h-10 px-1"
    >
      <button
        type="button"
        onClick={() => setActiveTab("withdraw")}
        className={[
          "flex-1 rounded-full text-sm font-semibold transition",
          activeTab === "withdraw"
            ? "bg-[#F39C46] text-white shadow-sm"
            : "text-text"
        ].join(" ")}
      >
        Rút tiền
      </button>

      <button
        type="button"
        onClick={() => setActiveTab("commission")}
        className={[
          "flex-1 rounded-full text-sm font-semibold transition",
          activeTab === "commission"
            ? "bg-[#F39C46] text-white shadow-sm"
            : "text-text"
        ].join(" ")}
      >
        Hoa hồng
      </button>
    </div>
  </div>
);


  return (
    <PageContainer id="app-container" className="flex justify-center">
      {/* khung giống Trang chủ: max 420, padding 12px, header KHÔNG cố định */}
      <div className="w-full max-w-[420px] pb-8 px-[12px]">
        {/* HEADER – giống các page mới (back icon + title giữa) */}
        <header className="pt-safe-top h-[56px] flex items-center justify-between relative">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Quay lại"
            className="w-11 h-11 rounded-full grid place-items-center hover:bg-black/5 transition"
          >
            <span className="text-[20px] leading-none text-[#111827]">
              ‹
            </span>
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold text-[#111827] pointer-events-none">
            {activeTab === "withdraw" ? "Lịch sử rút" : "Lịch sử hoa hồng"}
          </h1>

          <div className="w-11 h-11" />
        </header>

        {TabBar}

        {activeTab === "withdraw" ? (
          <>
            {/* LIST RÚT TIỀN – dùng UI card đẹp giống file RutPage mới */}
            <div className="mt-4 space-y-4">
              {withdrawItems.map((it) => (
                <div key={it.id}>
                  <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.07)] overflow-hidden">
                    <div className="px-[11px] py-[10px]">
                      <div className="flex items-start justify-between gap-3">
                        {/* TRÁI: Avatar + info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="shrink-0 w-11 h-11 rounded-[12px] bg-[#A000FF] grid place-items-center text-[10px] font-bold text-white leading-tight">
                            mo
                            <br />
                            mo
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Số tiền */}
                            <div className="text-[17px] font-bold text-[#111827] leading-none">
                              {formatWithdrawAmount(it.amount)}
                            </div>

                            {/* Phương thức + TAG – thẳng hàng nhau */}
                            <div className="mt-1 flex items-center justify-between min-w-0">
                              <div className="text-[14px] font-medium text-[#111827] leading-none truncate">
                                {it.method || "MoMo *****5678"}
                              </div>

                              {/* Tag ngang hàng với phương thức */}
                              <Tag tone={tone(it.status)} className="ml-3">
                                {it.status}
                              </Tag>
                            </div>

                            {/* Thời gian */}
                            <div className="mt-[3px] text-[12.5px] text-[#6B7280] leading-none">
                              {formatDateTime(it.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {withdrawItems.length === 0 && (
                <div className="text-center text-[14px] text-[#9CA3AF] py-12">
                  Chưa có giao dịch rút tiền
                </div>
              )}
            </div>

            <div className="mt-8 text-center text-[13px] text-[#6B7280]">
              Phí rút: 0đ · Hỗ trợ 24/7
            </div>
          </>
        ) : (
          <>
            {/* Khối Hôm nay / Tháng này – giống file HoaHongPage mới */}
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

            {/* LIST HOA HỒNG – card + tag cùng dòng Người B • mã */}
            <div className="space-y-4">
              {commissionItems.map((it) => (
                <div key={it.id}>
                  <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.07)] overflow-hidden">
                    <div className="px-[11px] py-[10px]">
                      <div className="flex flex-col gap-[3px]">
                        {/* Số tiền */}
                        <div className="text-[17px] font-bold text-[#111827] leading-none">
                          {formatCommissionAmount(it.amount)}
                        </div>

                        {/* Người B • mã + Tag – cùng 1 hàng */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0 text-[14px] font-medium text-[#111827] leading-none truncate">
                            {it.user} • {it.code}
                          </div>

                          <Tag tone={tone(it.status)}>{it.status}</Tag>
                        </div>

                        {/* Thời gian */}
                        <div className="text-[12.5px] text-[#6B7280] leading-none">
                          {formatDateTime(it.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {commissionItems.length === 0 && (
                <div className="text-caption text-text-muted">
                  Chưa có hoa hồng.
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-[13px] text-[#6B7280]">
              Phí rút: 0đ · Hỗ trợ 24/7
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
